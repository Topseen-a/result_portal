from django.urls import include, path
from academics.views import CourseViewSet
from .views import DepartmentViewSet
from rest_framework_nested import routers


router = routers.DefaultRouter()
router.register('departments', DepartmentViewSet, basename='departments')
dept_router = routers.NestedDefaultRouter(router, 'departments')
dept_router.register('course', CourseViewSet, basename='course')


urlpatterns = [
    path('', include(router.urls)),
    path('', include(dept_router.urls)),
]