from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from loguru import logger

from .models import Department
from .serializers import DepartmentSerializer


@api_view(['POST'])
def create_department(request):
    try:
        serializer = DepartmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        name = serializer.validated_data['name']
        code = serializer.validated_data['code']
        logger.info(f"data validated for department: {name}")

        if Department.objects.filter(code=code).exists():
            logger.error(f"department with {code} already exists")
            return Response({"message": "department with code already exists"},
                            status=status.HTTP_400_BAD_REQUEST)

        Department.objects.create(**serializer.validated_data)
        logger.info(f"department {name} created")

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Error creating department: {str(e)}")
        return Response({"message": "Error creating department"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)