from rest_framework.viewsets import ModelViewSet
from .models import Course, AcademicSession
from .serializers import CourseSerializer, AcademicSessionSerializer


class CourseViewSet(ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        return Course.objects.filter(department=self.kwargs["nested_1_pk"])

    def get_serializer_context(self):
        return {"department_id": self.kwargs.get("nested_1_pk")}


class AcademicSessionViewSet(ModelViewSet):
    queryset = AcademicSession.objects.all()
    serializer_class = AcademicSessionSerializer
#
#
# class CourseRegistrationViewSet(ModelViewSet):
#     serializer = CourseRegistrationSerializer
#
#       def get_queryset(self):
#             ...