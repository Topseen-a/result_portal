from rest_framework import serializers


class DepartmentSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=True)
    code = serializers.CharField(max_length=255, required=True)
    description = serializers.CharField(max_length=255, required=True)