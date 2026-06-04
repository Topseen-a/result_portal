from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError

from account.models import Student
from core.models import Department
from core.constants import SEMESTER_CHOICES, LEVEL_CHOICES


class AcademicSession(models.Model):
    name = models.CharField(max_length=20, help_text="e.g 2024/2025")
    year = models.PositiveIntegerField(validators=[MaxValueValidator(2100), MinValueValidator(2000)])
    semester = models.CharField(max_length=10, choices=SEMESTER_CHOICES, default="first")
    is_current = models.BooleanField(default=False)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "academic_sessions"
        unique_together = [("year", "semester")]
        ordering = ["year", "semester"]

    def __str__(self):
        return f"{self.name} - {self.get_semester_display()}"


class Course(models.Model):
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name="courses")
    course_code = models.CharField(max_length=20, unique=True, blank=False, null=False, primary_key=True)
    title = models.CharField(max_length=200)
    credit_units = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(6)])
    level = models.CharField(max_length=3, choices=LEVEL_CHOICES, default="100")
    semester = models.CharField(max_length=10, choices=SEMESTER_CHOICES, default="first")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "academic_courses"
        ordering = ["course_code"]

    def __str__(self):
        return f"{self.course_code}: {self.title} ({self.credit_units} units)"


class CourseRegistration(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="student_registrations")
    course = models.ForeignKey(Course, on_delete=models.PROTECT, related_name="course_registrations")
    session = models.ForeignKey(AcademicSession, on_delete=models.PROTECT, related_name="sessions")
    register_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "academics_course_registrations"
        unique_together = [("student", "course", "session")]
        ordering = ["-session__year", "course__course_code"]

    def __str__(self):
        return f"{self.student} - {self.course.course_code} ({self.session})"

    def clean(self):
        if self.course_id and self.session_id:
            if self.course.semester != self.session.semester:
                raise ValidationError(
                    f"Course '{self.course.course_code}' belongs to the "
                    f"{self.course.get_semester_display()} but this session "
                    f"is the {self.session.get_semester_display()}."
                )