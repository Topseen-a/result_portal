from django.shortcuts import get_object_or_404
from loguru import logger
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.models import Department
from .models import Course
from .serializers import CourseSerializer

@api_view(['POST'])
def create_course(request):
    try:
        serializer = CourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data['code']
        logger.info(f"Creating new course {code}")
        department_id = serializer.validated_data['department']
        department = Department

        department_code = serializer.validated_data['department']

        department = get_object_or_404(Department, code=department_code)
        logger.info(f"data type of department {department_code}")
        Course.objects.create(department=department, **serializer.validated_data)

        logger.info(f"Created new course {code}")
        return Response(serializer.validated_data, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(e)
        return Response(str(e), status=status.HTTP_400_BAD_REQUEST)