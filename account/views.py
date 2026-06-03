from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction

from .serializers import StudentEnrollmentSerializer
from .models import Student
from core.models import User


class StudentEnrollment(APIView):
    def post(self, request, *args, **kwargs):
        serializer = StudentEnrollmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            user = User.objects.create(
                email=serializer.validated_data["email"],
                username=serializer.validated_data["username"],
                first_name=serializer.validated_data["first_name"],
                last_name=serializer.validated_data["last_name"],
                password=serializer.validated_data["password"]
            )

            student = Student.objects.create(
                user=user,
                department=serializer.validated_data["department"],
                entry_year=serializer.validated_data["entry_year"],
            )

            user.save()
            student.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)