from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['department', 'code', 'title', 'level', 'semester', 'description', 'credit_units']