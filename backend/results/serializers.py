from rest_framework import serializers
from results.models import Result
from results.utils import calculate_grade


class ResultSerializer(serializers.ModelSerializer):
    student = serializers.CharField(source="registration.student.matric_number", read_only=True)
    course = serializers.CharField(source="registration.course.course_code", read_only=True)
    student_name = serializers.CharField(source="registration.student.user.get_full_name", read_only=True)
    course_title = serializers.CharField(source="registration.course.title", read_only=True)
    session = serializers.IntegerField(source="registration.session_id", read_only=True)
    session_name = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(source="uploaded_by.user.get_full_name", read_only=True)

    class Meta:
        model = Result
        fields = ["id", "registration", "student", "student_name", "course", "course_title", "session", "session_name", "score", "grade", "grade_point", "is_published", "uploaded_by", "uploaded_by_name", "created_at", "updated_at"]
        read_only_fields = ["grade", "grade_point", "uploaded_by", "created_at", "updated_at"]


    def get_session_name(self, obj):
        session = obj.registration.session
        return f"{session.name} · {session.get_semester_display()}"

    def validate_registration(self, registration):
        user = self.context["request"].user
        staff = getattr(user, "staff_profile", None)
        if staff is None or registration.course.department_id != staff.department_id:
            raise serializers.ValidationError("You can only grade courses in your own department.")
        return registration

    def validate_score(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Score must be between 0 and 100")
        return value


    def create(self, validated_data):
        score = validated_data.get("score")
        grade, grade_point = (calculate_grade(score))

        validated_data["grade"] = grade
        validated_data["grade_point"] = grade_point
        validated_data["uploaded_by"] = (
            self.context["request"]
            .user
            .staff_profile
        )

        return Result.objects.create(**validated_data)


    def update(self, instance, validated_data):
        score = validated_data.get("score", instance.score)
        grade, grade_point = (calculate_grade(score))

        instance.score = score
        instance.grade = grade
        instance.grade_point = grade_point
        instance.is_published = (
            validated_data.get(
                "is_published",
                instance.is_published
            )
        )

        instance.save()

        return instance