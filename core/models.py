from django.contrib.auth.base_user import AbstractBaseUser
from django.db import models


# Create your models here.

class User(AbstractBaseUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        STUDENT = 'student', 'Student'
        STAFF = 'staff', 'Staff'

    first_name = models.CharField(max_length=255, blank=False, null=False)
    last_name = models.CharField(max_length=255, blank=False, null=False)
    email = models.EmailField(max_length=255, unique=True, blank=False, null=False)
    username = models.CharField(max_length=255, unique=True, blank=False, null=False)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=7, choices=Role, default=Role.STUDENT)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username


class Department(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)