from rest_framework import serializers
from core.models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['name', 'department_code', 'description']


class GetDepartmentSerializer(serializers.Serializer):
    department_code = serializers.CharField(max_length=255, required=True)