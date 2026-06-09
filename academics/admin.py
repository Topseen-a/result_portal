from django.contrib import admin
from academics.models import Course


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('department', 'course_code', 'credit_units', 'semester', 'description')
    search_fields = ('department',)