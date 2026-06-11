from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from academics.models import AcademicSession
from account.models import Student
from results.models import Result
from results.serializers import ResultSerializer
from results.utils import calculate_gpa, calculate_cgpa


class ResultViewSet(ModelViewSet):
    queryset = (
        Result.objects.
        select_related(
            "registration__student",
            "registration__course",
            "uploaded_by"
        )
    )

    serializer_class = ResultSerializer


class StudentGPAView(APIView):

    def get(self, request, matric_number, session_id):
        student = Student.objects.get(pk=matric_number)
        session = AcademicSession.objects.get(pk=session_id)
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
        student = Student.objects.get(pk=matric_number)
        cgpa = calculate_cgpa(student)

        return Response(
            {
                "student": student.matric_number,
                "cgpa": cgpa
            }
        )