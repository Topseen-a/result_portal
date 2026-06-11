from django.urls import path, include
from rest_framework.routers import DefaultRouter
from results.views import ResultViewSet, StudentGPAView, StudentCGPAView

router = DefaultRouter()
router.register('results', ResultViewSet, basename='results')

urlpatterns = [
    path("", include(router.urls)),
    path("gpa/<str:matric_number>/<int:session_id>/", StudentGPAView.as_view()),
    path("cgpa/<str:matric_number>/", StudentCGPAView.as_view()),
]