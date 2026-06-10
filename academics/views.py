from django.db import IntegrityError
from loguru import logger
from rest_framework import status
from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListCreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from .models import Course, AcademicSession, CourseRegistration
from .serializers import CourseSerializer, AcademicSessionSerializer, CourseRegistrationSerializer, \
    ReadAcademicSessionSerializer


class CourseViewSet(ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        return Course.objects.filter(department=self.kwargs["nested_1_pk"])

    def get_serializer_context(self):
        return {"department_id": self.kwargs.get("nested_1_pk")}


class AcademicSessionView(ListCreateAPIView):
    queryset = AcademicSession.objects.all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AcademicSessionSerializer
        return ReadAcademicSessionSerializer


class GetUpdateDeleteAcademicSessionView(RetrieveUpdateDestroyAPIView):
    queryset = AcademicSession.objects.all()
    serializer_class = AcademicSessionSerializer


class CourseRegistrationViewSet(ModelViewSet):
    serializer_class = CourseRegistrationSerializer
    permissions = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        qs = CourseRegistration.objects.select_related(
            "student__user", "course__department", "session"
        ).all()

        if user.is_active:
            qs = qs.filter(student=user.student_profile)

        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user

        if user.is_authenticated and user.is_active:
            try:
                context["student"] = user.student_profile
            except Exception as e:
                context["student"] = None

        return context

    def create(self, request, *args, **kwargs):
        if not request.user.is_active:
            logger.warning(
                f"Non-student user_id={request.user.id} attempted course registration"
            )
            return Response(
                {"error": "Only active students can register courses"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            student = request.user.student_profile
        except Exception as e:
            logger.error(
                f"User id={request.user.id} has role=student but no student profile"
            )
            return Response(
                {"error": "No student profile found for this account. Contact admin."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        logger.info(
            f"Course registration attempt - "
            f"student={student.matric_number}, "
            f"payload={request.data}"
        )

        serializer = self.get_serializer(data=request.data)

        try:
            if not serializer.is_valid():
                logger.warning(
                    f"Registration failed - student={student.matric_number}, "
                    f"errors={serializer.errors}"
                )
                return Response(
                    {"errors": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            registration = serializer.save(student=student)

            logger.success(
                f"Registration created - id={registration.id}, "
                f"student={student.matric_number}, "
                f"course={registration.course.course_code}, "
                f"session={registration.session.name}"
            )
            return Response(
                self.get_serializer(registration).data,
                status=status.HTTP_201_CREATED,
            )
        except IntegrityError as e:
            logger.error(
                f"Duplicate registration (race condition) - "
                f"student={student.matric_number}, "
                f"data={request.data}"
            )
            return Response(
                {"errors": "You are already registered for this course in the selected session."},
                status=status.HTTP_409_CONFLICT,
            )

        except Exception as exc:
            logger.exception(f"Unexpected error during registration: {exc}")
            return Response(
                {"error": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def destroy(self, request, *args, **kwargs):
        registration = self.get_object()

        if request.user.is_active and registration.student != request.user.student_profile:
            logger.warning(
                f"Student {request.user.id} attempted to drop "
                f"another student's registration id={registration.id}"
            )
            return Response(
                {"error": "You can only drop your own course registrations."},
                status=status.HTTP_403_FORBIDDEN,
            )

        logger.info(
            f"Dropping registration id={registration.id} - "
            f"student={registration.student.matric_number}, "
            f"course={registration.course.course_code}"
        )
        registration.delete()
        logger.success(f"Registration id={registration.id} dropped successfully")
        return Response(status=status.HTTP_204_NO_CONTENT)