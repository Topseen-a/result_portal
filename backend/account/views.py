from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.db.models import Q
from rest_framework import mixins, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction, IntegrityError
from loguru import logger
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenObtainPairView

from core.permissions import IsAdmin
from .serializers import (
    StudentEnrollmentSerializer,
    StaffEnrollmentSerializer,
    CustomTokenObtainSerializer,
    MeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    AdminStudentSerializer,
    AdminStaffSerializer,
)
from .models import Student, Staff
from core.models import User, Department


class StudentEnrollment(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        try:
            serializer = StudentEnrollmentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            department_code = serializer.validated_data['department']
            department = Department.objects.get(department_code=department_code)

            with transaction.atomic():
                user = User()
                user.email = serializer.validated_data["email"]
                user.username = serializer.validated_data["username"]
                user.first_name = serializer.validated_data["first_name"]
                user.last_name = serializer.validated_data["last_name"]
                user.set_password(serializer.validated_data["password"])
                user.save()

                student = Student.objects.create(
                    user=user,
                    department=department,
                    entry_year=serializer.validated_data["entry_year"],
                )
                student.save()
                return Response(
                    {**serializer.data, "matric_number": student.matric_number},
                    status=status.HTTP_201_CREATED,
                )
        except Department.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except IntegrityError as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StaffEnrollment(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, *args, **kwargs):
        try:
            serializer = StaffEnrollmentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            department_code = serializer.validated_data['department']
            department = Department.objects.get(department_code=department_code)

            with transaction.atomic():
                user = User()
                user.email = serializer.validated_data["email"]
                user.username = serializer.validated_data["username"]
                user.first_name = serializer.validated_data["first_name"]
                user.last_name = serializer.validated_data["last_name"]
                user.set_password(serializer.validated_data["password"])
                user.role = "staff"
                user.save()

                staff = Staff.objects.create(
                    user=user,
                    department=department,
                    designation=serializer.validated_data.get("designation", "lecturer_i"),
                )
                staff.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Department.DoesNotExist as e:
            return Response({"message": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except IntegrityError as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainSerializer

    def post(self, request, *args, **kwargs):
        user_email = request.data.get("email")
        logger.info(f"User {user_email} is attempting to login")

        serializer = self.serializer_class(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            logger.info(f"Invalid credentials: {e}")
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.info(f"An error occurred while logging in for: {e}")
            return Response(status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"User {user_email} logged in successfully")
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user).data)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

            try:
                send_mail(
                    subject="Reset your Result Portal password",
                    message=(
                        f"Hi {user.first_name or user.username},\n\n"
                        f"We received a request to reset your Result Portal password. "
                        f"Use the link below to choose a new one:\n\n{reset_link}\n\n"
                        f"If you didn't ask for this, you can ignore this email. "
                        f"Your password won't change."
                    ),
                    from_email=None,
                    recipient_list=[user.email],
                )
                logger.info(f"Password reset email sent to user_id={user.id}")
            except Exception as e:
                logger.error(f"Failed to send password reset email to user_id={user.id}: {e}")

        # Same response whether or not the account exists, so this endpoint
        # can't be used to find out which emails are registered.
        return Response(
            {"message": "If an account exists for that email, a reset link has been sent."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user_id = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is None or not default_token_generator.check_token(user, serializer.validated_data["token"]):
            return Response(
                {"error": "This reset link is invalid or has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        logger.info(f"Password reset completed for user_id={user.id}")

        return Response({"message": "Your password has been reset. You can now sign in."}, status=status.HTTP_200_OK)



def _filter_people(qs, params, extra_search=()):
    if params.get("department"):
        qs = qs.filter(department_id=params["department"])
    if params.get("search"):
        term = params["search"]
        query = (
            Q(user__first_name__icontains=term)
            | Q(user__last_name__icontains=term)
            | Q(user__email__icontains=term)
            | Q(user__username__icontains=term)
        )
        for field in extra_search:
            query |= Q(**{f"{field}__icontains": term})
        qs = qs.filter(query)
    return qs


class AdminStudentViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                          mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """Admin directory of students. Admins can change department, level and status."""
    serializer_class = AdminStudentSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        params = self.request.query_params
        qs = Student.objects.select_related("user", "department")
        qs = _filter_people(qs, params, extra_search=("matric_number",))
        if params.get("level"):
            qs = qs.filter(level=params["level"])
        if params.get("status"):
            qs = qs.filter(status=params["status"])
        return qs.order_by("matric_number")


class AdminStaffViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                        mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """Admin directory of academic staff. Admins can change department and designation."""
    serializer_class = AdminStaffSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = Staff.objects.select_related("user", "department")
        return _filter_people(qs, self.request.query_params).order_by("user__last_name", "user__first_name")
