from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register("students", views.AdminStudentViewSet, basename="admin-students")
router.register("staff", views.AdminStaffViewSet, basename="admin-staff")

urlpatterns = [
    path("", include(router.urls)),
    path('student-enroll/', views.StudentEnrollment.as_view(), name='student_enroll'),
    path('staff-enroll/', views.StaffEnrollment.as_view(), name='staff_enroll'),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/password-reset/", views.PasswordResetRequestView.as_view(), name="password_reset"),
    path("auth/password-reset/confirm/", views.PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("me/", views.MeView.as_view(), name="me"),
]