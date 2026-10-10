from django.core.mail import send_mail
from django.db.models import Count, Q
from loguru import logger
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from academics.models import AcademicSession, Course, CourseRegistration
from account.models import Student, Staff
from results.models import Result
from .mixins import ProtectedDestroyMixin
from .models import Department
from .permissions import IsAdmin
from .serializers import DepartmentSerializer


class DepartmentViewSet(ProtectedDestroyMixin, ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    protected_message = "This department still has students, staff or courses. Move or remove them first."

    def get_permissions(self):
        if self.request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            return [IsAdmin()]
        return [AllowAny()]


@api_view(['POST'])
@permission_classes([IsAdmin])
def send_message(request):
    message = request.data.get('message')
    email = request.data.get('email')
    subject = request.data.get('subject')

    try:
        send_mail(subject=subject, message=message, from_email="no-reply@resultportal.com", recipient_list=[email])
        logger.info(f"Message sent to {email}")
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"message": "Mail sent successfully!"}, status=status.HTTP_200_OK)


GRADES = ["A", "B", "C", "D", "E", "F"]


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_overview(request):
    """Everything the admin dashboard needs, in one request."""
    results = Result.objects.aggregate(
        total=Count('id'),
        published=Count('id', filter=Q(is_published=True)),
    )
    grade_counts = dict(Result.objects.values_list('grade').annotate(count=Count('id')))

    current_session = (
        AcademicSession.objects.filter(is_current=True).first()
        or AcademicSession.objects.order_by('-year', '-semester').first()
    )

    departments = Department.objects.annotate(
        student_count=Count('student_department', distinct=True),
        staff_count=Count('department_staff', distinct=True),
        course_count=Count('courses', distinct=True),
    ).order_by('name')

    recent_registrations = CourseRegistration.objects.select_related(
        'student__user', 'course', 'session'
    ).order_by('-register_at')[:6]

    return Response({
        "counts": {
            "students": Student.objects.count(),
            "active_students": Student.objects.filter(status="active").count(),
            "staff": Staff.objects.count(),
            "departments": Department.objects.count(),
            "courses": Course.objects.count(),
            "sessions": AcademicSession.objects.count(),
            "registrations": CourseRegistration.objects.count(),
            "results": results["total"],
            "published_results": results["published"],
            "pending_results": results["total"] - results["published"],
        },
        "current_session": current_session and {
            "id": current_session.id,
            "name": current_session.name,
            "semester": current_session.get_semester_display(),
            "is_current": current_session.is_current,
            "start_date": current_session.start_date,
            "end_date": current_session.end_date,
        },
        "grade_distribution": [{"grade": g, "count": grade_counts.get(g, 0)} for g in GRADES],
        "departments": [
            {
                "department_code": d.department_code,
                "name": d.name,
                "students": d.student_count,
                "staff": d.staff_count,
                "courses": d.course_count,
            }
            for d in departments
        ],
        "recent_registrations": [
            {
                "id": r.id,
                "student": r.student.matric_number,
                "student_name": r.student.user.get_full_name(),
                "course": r.course.course_code,
                "course_title": r.course.title,
                "session": f"{r.session.name} · {r.session.get_semester_display()}",
                "register_at": r.register_at,
            }
            for r in recent_registrations
        ],
    })
