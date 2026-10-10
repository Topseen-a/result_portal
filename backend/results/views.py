from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from academics.models import AcademicSession
from account.models import Student
from core.permissions import IsStaffMember, staff_department_id
from results.models import Result
from results.serializers import ResultSerializer
from results.utils import calculate_gpa, calculate_cgpa, session_breakdown


class ResultViewSet(ModelViewSet):
    serializer_class = ResultSerializer

    def get_queryset(self):
        qs = Result.objects.select_related(
            "registration__student__user",
            "registration__course",
            "registration__session",
            "uploaded_by__user",
        ).order_by("-updated_at")

        user = self.request.user
        if user.is_student:
            # Students only ever see their own published results.
            qs = qs.filter(
                registration__student=user.student_profile,
                is_published=True,
            )
        elif user.is_staff_member:
            # Staff only see and manage results for courses in their own department.
            qs = qs.filter(registration__course__department_id=staff_department_id(user))

        params = self.request.query_params
        if params.get("session"):
            qs = qs.filter(registration__session_id=params["session"])
        if params.get("course"):
            qs = qs.filter(registration__course_id=params["course"])
        if params.get("is_published") in ("true", "false"):
            qs = qs.filter(is_published=params["is_published"] == "true")
        if params.get("search"):
            term = params["search"]
            qs = qs.filter(
                Q(registration__student__matric_number__icontains=term)
                | Q(registration__student__user__first_name__icontains=term)
                | Q(registration__student__user__last_name__icontains=term)
                | Q(registration__course__course_code__icontains=term)
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
            student = Student.objects.select_related("user", "department").get(pk=matric_number)
        except Student.DoesNotExist:
            return Response({"error": "No student has that matric number."}, status=status.HTTP_404_NOT_FOUND)

        cgpa = calculate_cgpa(student)

        return Response(
            {
                "student": student.matric_number,
                "student_name": student.user.get_full_name(),
                "department_name": student.department.name,
                "level": student.level,
                "status": student.status,
                "cgpa": cgpa,
                "sessions": session_breakdown(student),
            }
        )