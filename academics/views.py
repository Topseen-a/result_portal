from rest_framework.viewsets import ModelViewSet
from .models import Course
from .serializers import CourseSerializer


class CourseViewSet(ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_serializer_context(self):
        return {"department_id": self.kwargs.get("nested_1_pk")}