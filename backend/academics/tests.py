from decimal import Decimal

from rest_framework.test import APITestCase

from academics.models import AcademicSession, Course, CourseRegistration
from account.models import Staff, Student
from core.models import Department, User
from results.models import Result


class AdminAcademicsTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(email="admin@example.com", username="admin", password="x", role="admin")
        self.dept = Department.objects.create(name="Computer Science", department_code="CSC")
        self.course = Course.objects.create(department=self.dept, course_code="CSC101", title="Intro", credit_units=3)
        self.client.force_authenticate(self.admin)

    def test_only_one_session_is_current(self):
        first = AcademicSession.objects.create(name="2024/2025", year=2024, is_current=True)
        response = self.client.post("/api/session/", {"name": "2025/2026", "year": 2025, "is_current": True})

        self.assertEqual(response.status_code, 201)
        first.refresh_from_db()
        self.assertFalse(first.is_current)

    def test_session_end_date_must_follow_start(self):
        response = self.client.post("/api/session/", {
            "name": "2025/2026", "year": 2025, "start_date": "2025-10-01", "end_date": "2025-09-01",
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn("end_date", response.data)

    def test_admin_role_can_manage_departments(self):
        response = self.client.post("/api/departments/", {"name": "Physics", "department_code": "PHY"})
        self.assertEqual(response.status_code, 201)

    def test_editing_department_does_not_change_its_code(self):
        response = self.client.patch("/api/departments/CSC/", {"name": "Computing", "department_code": "XYZ"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Department.objects.count(), 1)
        self.assertEqual(Department.objects.get().name, "Computing")

    def test_editing_course_does_not_change_its_code(self):
        response = self.client.patch(
            "/api/departments/CSC/course/CSC101/", {"title": "Intro to CS", "course_code": "CSC999"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(list(Course.objects.values_list("course_code", "title")), [("CSC101", "Intro to CS")])

    def test_deleting_records_in_use_returns_conflict(self):
        session = AcademicSession.objects.create(name="2025/2026", year=2025)
        student_user = User.objects.create_user(email="s@example.com", username="s", password="x")
        student = Student.objects.create(user=student_user, department=self.dept, entry_year=2025)
        CourseRegistration.objects.create(student=student, course=self.course, session=session)

        for url in ["/api/departments/CSC/", "/api/departments/CSC/course/CSC101/", f"/api/session/{session.id}/"]:
            response = self.client.delete(url)
            self.assertEqual(response.status_code, 409, url)
            self.assertIn("error", response.data)


class DropGradedRegistrationTests(APITestCase):
    def setUp(self):
        dept = Department.objects.create(name="Computer Science", department_code="CSC")
        course = Course.objects.create(department=dept, course_code="CSC101", title="Intro", credit_units=3)
        session = AcademicSession.objects.create(name="2025/2026", year=2025)
        self.student_user = User.objects.create_user(email="s@example.com", username="s", password="x")
        student = Student.objects.create(user=self.student_user, department=dept, entry_year=2025)
        self.registration = CourseRegistration.objects.create(student=student, course=course, session=session)
        staff_user = User.objects.create_user(email="l@example.com", username="l", password="x", role="staff")
        staff = Staff.objects.create(user=staff_user, department=dept)
        Result.objects.create(registration=self.registration, score=70, grade="A",
                              grade_point=Decimal("5.0"), uploaded_by=staff)
        self.url = f"/api/course-registration/{self.registration.id}/"

    def test_student_cannot_drop_graded_course(self):
        self.client.force_authenticate(self.student_user)
        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, 400)
        self.assertTrue(CourseRegistration.objects.filter(pk=self.registration.pk).exists())

    def test_admin_can_drop_graded_course(self):
        admin = User.objects.create_user(email="a@example.com", username="a", password="x", role="admin")
        self.client.force_authenticate(admin)

        self.assertEqual(self.client.delete(self.url).status_code, 204)
