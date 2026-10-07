from django.urls import include, path
from rest_framework.routers import DefaultRouter
from academics import views

router = DefaultRouter()
router.register('course-registration', views.CourseRegistrationViewSet, basename='course-registration')

urlpatterns = [
    path("", include(router.urls)),
    path('session/', views.AcademicSessionView.as_view(), name='session'),
    path('session/<int:pk>/', views.GetUpdateDeleteAcademicSessionView.as_view(), name='session-detail'),
]