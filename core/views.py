from django.core.mail import send_mail
from loguru import logger
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import Department
from .serializers import DepartmentSerializer


class DepartmentViewSet(ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.request.method in ["POST", "PUT", "PATCH"]:
            return [IsAdminUser()]
        return [AllowAny()]


@api_view(['POST'])
def send_message(request):
    message = request.data.get('message')
    email = request.data.get('email')
    subject = request.data.get('subject')

    try:
        send_mail(subject=subject, message=message, from_email="no-reply@resultportal.com", recipient_list=[email])
        logger.info(f"Message sent to {email}")
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"message": "Mail sent successfully!"}, status=status.HTTP_200_OK)