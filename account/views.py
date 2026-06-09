from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction, IntegrityError
from loguru import logger
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import StudentEnrollmentSerializer, StaffEnrollmentSerializer, CustomTokenObtainSerializer
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
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Department.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except IntegrityError as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StaffEnrollment(APIView):
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
                    department=department
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
            logger.info(f"Invalid token: {e}")
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.info(f"An error occurred while logging in for: {e}")
            return Response(status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"User {user_email} logged in successfully")
        return Response(serializer.validated_data, status=status.HTTP_200_OK)