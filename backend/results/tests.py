from rest_framework.test import APITestCase

from academics.models import AcademicSession, Course, CourseRegistration
from account.models import Student, Staff
from core.models import Department, User


class ResultPermissionTests(APITestCase):
    def setUp(self):
        dept = Department.objects.create(name="Computer Science", department_code="CSC")
        self.admin = User.objects.create_user(email="admin@example.com", username="admin", password="x", role="admin")
        staff_user = User.objects.create_user(email="l@example.com", username="l", password="x", role="staff")
        self.staff = Staff.objects.create(user=staff_user, department=dept)
        student_user = User.objects.create_user(email="s@example.com", username="s", password="x", first_name="Ada")
        student = Student.objects.create(user=student_user, department=dept, entry_year=2025)
        course = Course.objects.create(department=dept, course_code="CSC101", title="Intro", credit_units=3)
        session = AcademicSession.objects.create(name="2025/2026", year=2025)
        self.registration = CourseRegistration.objects.create(student=student, course=course, session=session)

    def test_staff_uploads_and_admin_can_view_but_not_upload(self):
        self.client.force_authenticate(self.admin)
        denied = self.client.post("/api/results/", {"registration": self.registration.id, "score": 70})
        self.assertEqual(denied.status_code, 403)

        self.client.force_authenticate(self.staff.user)
        created = self.client.post("/api/results/", {"registration": self.registration.id, "score": 70})
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.data["grade"], "A")

        self.client.force_authenticate(self.admin)
        listing = self.client.get("/api/results/", {"is_published": "false", "search": "csc101"})
        self.assertEqual(listing.data["count"], 1)
        self.assertEqual(listing.data["results"][0]["course_title"], "Intro")
        self.assertEqual(listing.data["results"][0]["session_name"], "2025/2026 · First Semester")

        published_only = self.client.get("/api/results/", {"is_published": "true"})
        self.assertEqual(published_only.data["count"], 0)

        regs = self.client.get("/api/course-registration/")
        self.assertTrue(regs.data["results"][0]["has_result"])


class StaffDepartmentScopeTests(APITestCase):
    """Staff only manage courses, registrations and results in their own department."""

    def setUp(self):
        self.csc = Department.objects.create(name="Computer Science", department_code="CSC")
        self.mth = Department.objects.create(name="Mathematics", department_code="MTH")
        session = AcademicSession.objects.create(name="2025/2026", year=2025)

        def make_staff(email, dept):
            user = User.objects.create_user(email=email, username=email, password="x", role="staff")
            return Staff.objects.create(user=user, department=dept)

        self.csc_staff = make_staff("csc@example.com", self.csc)
        self.mth_staff = make_staff("mth@example.com", self.mth)

        student_user = User.objects.create_user(
            email="s@example.com", username="s", password="x", first_name="Ada", last_name="Obi"
        )
        self.student = Student.objects.create(user=student_user, department=self.csc, entry_year=2025)
        csc101 = Course.objects.create(department=self.csc, course_code="CSC101", title="Intro", credit_units=3)
        mth101 = Course.objects.create(department=self.mth, course_code="MTH101", title="Algebra", credit_units=2)
        self.csc_reg = CourseRegistration.objects.create(student=self.student, course=csc101, session=session)
        self.mth_reg = CourseRegistration.objects.create(student=self.student, course=mth101, session=session)

    def test_staff_only_manage_courses_in_own_department(self):
        self.client.force_authenticate(self.csc_staff.user)
        course = {"course_code": "X1", "title": "X", "credit_units": 2}

        self.assertEqual(self.client.post("/api/departments/CSC/course/", course).status_code, 201)
        self.assertEqual(self.client.post("/api/departments/MTH/course/", course).status_code, 403)
        self.assertEqual(self.client.patch("/api/departments/MTH/course/MTH101/", {"title": "Y"}).status_code, 403)
        # Reading another department's catalog is still allowed.
        self.assertEqual(self.client.get("/api/departments/MTH/course/").status_code, 200)

    def test_staff_only_see_and_grade_own_department_registrations(self):
        self.client.force_authenticate(self.csc_staff.user)

        regs = self.client.get("/api/course-registration/").data["results"]
        self.assertEqual([r["course"] for r in regs], ["CSC101"])

        other = self.client.post("/api/results/", {"registration": self.mth_reg.id, "score": 60})
        self.assertEqual(other.status_code, 400)
        self.assertIn("registration", other.data)

        own = self.client.post("/api/results/", {"registration": self.csc_reg.id, "score": 60})
        self.assertEqual(own.status_code, 201)

    def test_staff_can_correct_and_delete_results_only_in_own_department(self):
        self.client.force_authenticate(self.csc_staff.user)
        result_id = self.client.post("/api/results/", {"registration": self.csc_reg.id, "score": 45}).data["id"]

        corrected = self.client.patch(f"/api/results/{result_id}/", {"score": 72})
        self.assertEqual(corrected.status_code, 200)
        self.assertEqual((corrected.data["grade"], corrected.data["grade_point"]), ("A", "5.0"))

        self.client.force_authenticate(self.mth_staff.user)
        self.assertEqual(self.client.patch(f"/api/results/{result_id}/", {"score": 10}).status_code, 404)
        self.assertEqual(self.client.delete(f"/api/results/{result_id}/").status_code, 404)
        self.assertEqual(self.client.get("/api/results/").data["count"], 0)

        self.client.force_authenticate(self.csc_staff.user)
        self.assertEqual(self.client.delete(f"/api/results/{result_id}/").status_code, 204)

    def test_staff_cannot_drop_registrations(self):
        self.client.force_authenticate(self.csc_staff.user)
        response = self.client.delete(f"/api/course-registration/{self.csc_reg.id}/")

        self.assertEqual(response.status_code, 403)
        self.assertTrue(CourseRegistration.objects.filter(pk=self.csc_reg.pk).exists())

    def test_cgpa_lookup_includes_student_details_and_session_breakdown(self):
        self.client.force_authenticate(self.csc_staff.user)
        result_id = self.client.post("/api/results/", {"registration": self.csc_reg.id, "score": 65}).data["id"]
        self.client.patch(f"/api/results/{result_id}/", {"is_published": True})

        response = self.client.get(f"/api/cgpa/{self.student.matric_number}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["student_name"], "Ada Obi")
        self.assertEqual(str(response.data["cgpa"]), "4.00")
        self.assertEqual(len(response.data["sessions"]), 1)
        self.assertEqual(response.data["sessions"][0]["units"], 3)

        missing = self.client.get("/api/cgpa/STU0000/")
        self.assertEqual(missing.status_code, 404)
