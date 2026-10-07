from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from academics.models import AcademicSession
from account.models import Student
from core.permissions import IsStaffMember
from results.models import Result
from results.serializers import ResultSerializer
from results.utils import calculate_gpa, calculate_cgpa


class ResultViewSet(ModelViewSet):
    serializer_class = ResultSerializer

    def get_queryset(self):
        qs = Result.objects.select_related(
            "registration__student",
            "registration__course",
            "uploaded_by"
        )

        user = self.request.user
        if user.is_student:
            # Students only ever see their own published results.
            qs = qs.filter(
                registration__student=user.student_profile,
                is_published=True,
            )

        return qs

    def get_permissions(self):
        if self.request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            return [IsStaffMember()]
        return [IsAuthenticated()]


def _can_view_academic_record(user, matric_number):
    if user.is_student:
        return user.student_profile.matric_number == matric_number
    return user.is_admin or user.is_staff_member


class StudentGPAView(APIView):

    def get(self, request, matric_number, session_id):
        if not _can_view_academic_record(request.user, matric_number):
            return Response(
                {"error": "You can only view your own GPA."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            student = Student.objects.get(pk=matric_number)
            session = AcademicSession.objects.get(pk=session_id)
        except (Student.DoesNotExist, AcademicSession.DoesNotExist):
            return Response(status=status.HTTP_404_NOT_FOUND)

        gpa = calculate_gpa(student, session)

        return Response(
            {
                "student": student.matric_number,
                "session": session.name,
                "gpa": gpa
            }
        )


class StudentCGPAView(APIView):

    def get(self, request, matric_number):
        if not _can_view_academic_record(request.user, matric_number):
            return Response(
                {"error": "You can only view your own CGPA."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            student = Student.objects.get(pk=matric_number)
        except Student.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        cgpa = calculate_cgpa(student)

        return Response(
            {
                "student": student.matric_number,
                "cgpa": cgpa
            }
        )