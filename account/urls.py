from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views


urlpatterns = [
    path('student-enroll/', views.StudentEnrollment.as_view(), name='student_enroll'),
    path('staff-enroll/', views.StaffEnrollment.as_view(), name='staff_enroll'),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", views.MeView.as_view(), name="me"),
]