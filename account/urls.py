from django.urls import path
from . import views


urlpatterns = [
    path('student-enroll/', views.StudentEnrollment.as_view(), name='student_enroll'),
    path('staff-enroll/', views.StaffEnrollment.as_view(), name='staff_enroll'),
    path("auth/login/", views.LoginView.as_view(), name="login"),
]