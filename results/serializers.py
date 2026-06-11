from rest_framework import serializers
from results.models import Result
from results.utils import calculate_grade


class ResultSerializer(serializers.ModelSerializer):
    student = serializers.CharField(source="registration.student.matric_number", read_only=True)
    course = serializers.CharField(source="registration.course.course_code", read_only=True)

    class Meta:
        model = Result
        fields = ["id", "registration", "student", "course", "score", "grade", "grade_point", "is_published", "uploaded_by", "created_at", "updated_at"]
        read_only_fields = ["grade", "grade_point", "uploaded_by", "created_at", "updated_at"]


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
            .staff
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