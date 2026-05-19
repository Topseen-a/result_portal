from django.db import models

from account.models import Student
from core.models import Department


class AcademicSession(models.Model):
    name = models.CharField(max_length=200)
    year = models.CharField(max_length=4)
    semester = models.IntegerField()
    is_current = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['year', 'semester']


class Course(models.Model):
    class CourseLevel(models.TextChoices):
        LEVEL_100 = '100'
        LEVEL_200 = '200'
        LEVEL_300 = '300'
        LEVEL_400 = '400'
        LEVEL_500 = '500'

    department = models.ManyToManyField(Department)
    code = models.CharField(max_length=10, unique=True, blank=False, null=False)
    title = models.CharField(max_length=200, blank=False, null=False, unique=True)
    level = models.CharField(max_length=10, choices=CourseLevel, default=CourseLevel.LEVEL_100)
    semester = models.IntegerField()

    def __str__(self):
        return self.title


class CourseRegistration(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    register_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.course.title