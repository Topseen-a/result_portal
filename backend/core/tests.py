from decimal import Decimal

from rest_framework.test import APITestCase

from academics.models import AcademicSession, Course, CourseRegistration
from account.models import Student, Staff
from core.models import Department, User
from results.models import Result


class AdminOverviewTests(APITestCase):
    url = "/api/admin-overview/"

    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com", username="admin", password="x", role="admin"
        )
        dept = Department.objects.create(name="Computer Science", department_code="CSC")
        Department.objects.create(name="Mathematics", department_code="MTH")

        staff_user = User.objects.create_user(
            email="staff@example.com", username="staff", password="x", role="staff"
        )
        self.staff = Staff.objects.create(user=staff_user, department=dept)

        student_user = User.objects.create_user(
            email="stu@example.com", username="stu", password="x", first_name="Ada", last_name="Obi"
        )
        student = Student.objects.create(user=student_user, department=dept, entry_year=2025)

        session = AcademicSession.objects.create(name="2025/2026", year=2025, is_current=True)
        c1 = Course.objects.create(department=dept, course_code="CSC101", title="Intro", credit_units=3)
        c2 = Course.objects.create(department=dept, course_code="CSC103", title="Logic", credit_units=2)
        r1 = CourseRegistration.objects.create(student=student, course=c1, session=session)
        r2 = CourseRegistration.objects.create(student=student, course=c2, session=session)

        Result.objects.create(registration=r1, score=75, grade="A", grade_point=Decimal("5.0"),
                              is_published=True, uploaded_by=self.staff)
        Result.objects.create(registration=r2, score=55, grade="C", grade_point=Decimal("3.0"),
                              uploaded_by=self.staff)

    def test_admin_gets_overview(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        counts = response.data["counts"]
        self.assertEqual(counts["students"], 1)
        self.assertEqual(counts["staff"], 1)
        self.assertEqual(counts["departments"], 2)
        self.assertEqual(counts["courses"], 2)
        self.assertEqual(counts["registrations"], 2)
        self.assertEqual(counts["published_results"], 1)
        self.assertEqual(counts["pending_results"], 1)

        grades = {g["grade"]: g["count"] for g in response.data["grade_distribution"]}
        self.assertEqual(grades, {"A": 1, "B": 0, "C": 1, "D": 0, "E": 0, "F": 0})

        csc = next(d for d in response.data["departments"] if d["department_code"] == "CSC")
        self.assertEqual((csc["students"], csc["staff"], csc["courses"]), (1, 1, 2))

        self.assertEqual(response.data["current_session"]["name"], "2025/2026")
        self.assertEqual(len(response.data["recent_registrations"]), 2)
        self.assertEqual(response.data["recent_registrations"][0]["student_name"], "Ada Obi")

    def test_non_admins_are_forbidden(self):
        self.client.force_authenticate(self.staff.user)
        self.assertEqual(self.client.get(self.url).status_code, 403)

        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(self.url).status_code, 401)
