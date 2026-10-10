from rest_framework import serializers
from core.models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['name', 'department_code', 'description']

    def update(self, instance, validated_data):
        # department_code is the primary key; changing it would create a new row.
        validated_data.pop('department_code', None)
        return super().update(instance, validated_data)


class GetDepartmentSerializer(serializers.Serializer):
    department_code = serializers.CharField(max_length=255, required=True)