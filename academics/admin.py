from django.contrib import admin
from academics.models import Course, AcademicSession, CourseRegistration


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('department', 'course_code', 'credit_units', 'semester', 'description')
    search_fields = ('department',)


@admin.register(AcademicSession)
class AcademicSessionAdmin(admin.ModelAdmin):
    list_display = ('name', 'year', 'semester', 'is_current', 'start_date', 'end_date')
    search_fields = ('name', 'year')


@admin.register(CourseRegistration)
class CourseRegistrationAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'session', 'register_at')
    search_fields = ('course',)