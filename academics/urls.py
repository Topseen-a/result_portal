from django.urls import include, path
from rest_framework import routers

from academics.views import AcademicSessionViewSet

router = routers.DefaultRouter()
router.register('', AcademicSessionViewSet, basename='academic-sessions')

urlpatterns = [
    path('', include(router.urls)),
]