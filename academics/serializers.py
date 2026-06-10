from rest_framework import serializers
from account.models import Student
from .models import Course, AcademicSession, CourseRegistration


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['course_code', 'title', 'level', 'semester', 'description', 'credit_units']

    def create(self, validated_data):
        department_id = self.context.get('department_id')
        return Course.objects.create(department_id=department_id, **validated_data)


class AcademicSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSession
        fields = ['name', 'year', 'semester', 'is_current', 'start_date', 'end_date']


class ReadAcademicSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSession
        fields = ['name', 'year', 'start_date']


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields =['department', 'matric_number', 'level', 'status', 'entry_year']


class CourseRegistrationSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    student = StudentSerializer(read_only=True)
    session_semester = serializers.SerializerMethodField()

    class Meta:
        model = CourseRegistration
        fields = ['id', 'course', 'course_title', 'session', 'student', 'session_semester', 'register_at']

        read_only_fields = ['id', 'register_at', 'session_semester', 'course_title']

    def get_session_semester(self, obj):
        return obj.session.get_semester_display()

    def validate(self, attrs):
        course = attrs.get('course')
        session = attrs.get('session')

        if course and session:
            if course.semester != session.semester:
                raise serializers.ValidationError(
                    {
                        "course": (
                            f"'{course.course_code}' is a {course.get_semester_display()} "
                            f"course but the selected session is "
                            f"{session.get_semester_display()}."
                        )
                    }
                )

        student = self.context.get('student')
        if student and course and session:
            if CourseRegistration.objects.filter(
                student=student,
                course=course,
                session=session
            ).exists():
                raise serializers.ValidationError(
                    {
                        "non_field_errors": (
                            f"You are already registered for "
                            f"'{course.course_code}' in this session. "
                        )
                    }
                )

        return attrs