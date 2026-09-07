from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Student, Staff


class StudentEnrollmentSerializer(serializers.Serializer):
    department = serializers.CharField(max_length=10, required=True)
    entry_year = serializers.IntegerField()
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)


class StaffEnrollmentSerializer(serializers.Serializer):
    department = serializers.CharField(max_length=10, required=True)
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)


class CustomTokenObtainSerializer(TokenObtainSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        refresh = RefreshToken.for_user(user)

        data["user"] = {
            "id": user.id,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "email": user.email,
            "username": user.username,
            "role": user.role
        }

        return data


class StudentProfileSerializer(serializers.ModelSerializer):
    department = serializers.CharField(source="department.department_code")
    department_name = serializers.CharField(source="department.name")

    class Meta:
        model = Student
        fields = ["matric_number", "department", "department_name", "level", "status", "entry_year"]


class StaffProfileSerializer(serializers.ModelSerializer):
    department = serializers.CharField(source="department.department_code")
    department_name = serializers.CharField(source="department.name")

    class Meta:
        model = Staff
        fields = ["department", "department_name", "designation"]


class MeSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    email = serializers.EmailField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    role = serializers.CharField()
    student = serializers.SerializerMethodField()
    staff = serializers.SerializerMethodField()

    def get_student(self, user):
        if hasattr(user, "student_profile"):
            return StudentProfileSerializer(user.student_profile).data
        return None

    def get_staff(self, user):
        if hasattr(user, "staff_profile"):
            return StaffProfileSerializer(user.staff_profile).data
        return None