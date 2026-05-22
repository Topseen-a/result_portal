from .views import create_department, get_department, update_department, delete_department
from django.urls import path


urlpatterns = [
    path('create/', create_department, name='create-department'),
    path('get/<str:department_code>', get_department, name='get-department'),
    path('update/<str:department_code>', update_department, name='update-department'),
    path('delete/<str:department_code>', delete_department, name='delete-department'),
]