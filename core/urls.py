from .views import create_department
from django.urls import path


urlpatterns = [
    path('create-department/', create_department, name='create-department'),
]