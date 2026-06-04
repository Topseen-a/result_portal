from django.contrib import admin
from django.contrib.admin import ModelAdmin
from .models import Department, User

# Register your models here.

# admin.site.register(Department)

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'department_code', 'description', 'created_at')
    list_per_page = 10


@admin.register(User)
class UserAdmin(ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'last_login']