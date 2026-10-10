from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APITestCase

from account.models import Student, Staff
from core.models import Department, User


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    FRONTEND_URL="http://frontend.test",
)
class PasswordResetTests(APITestCase):
    request_url = "/api/auth/password-reset/"
    confirm_url = "/api/auth/password-reset/confirm/"

    def setUp(self):
        self.user = User.objects.create_user(
            email="jane@example.com",
            username="jane",
            password="OldPassw0rd!",
            first_name="Jane",
        )

    def test_request_sends_email_with_reset_link(self):
        response = self.client.post(self.request_url, {"email": "jane@example.com"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["jane@example.com"])
        self.assertIn("http://frontend.test/reset-password?uid=", mail.outbox[0].body)

    def test_request_for_unknown_email_returns_same_response_without_sending(self):
        known = self.client.post(self.request_url, {"email": "jane@example.com"})
        unknown = self.client.post(self.request_url, {"email": "nobody@example.com"})

        self.assertEqual(unknown.status_code, 200)
        self.assertEqual(unknown.data, known.data)
        self.assertEqual(len(mail.outbox), 1)

    def test_confirm_with_valid_token_changes_password(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.post(
            self.confirm_url, {"uid": uid, "token": token, "new_password": "BrandNewPassw0rd!"}
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("BrandNewPassw0rd!"))

    def test_token_cannot_be_reused(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        payload = {"uid": uid, "token": token, "new_password": "BrandNewPassw0rd!"}

        self.client.post(self.confirm_url, payload)
        response = self.client.post(self.confirm_url, {**payload, "new_password": "AnotherPassw0rd!"})

        self.assertEqual(response.status_code, 400)

    def test_confirm_with_invalid_token_is_rejected(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))

        response = self.client.post(
            self.confirm_url, {"uid": uid, "token": "bad-token", "new_password": "BrandNewPassw0rd!"}
        )

        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("OldPassw0rd!"))

    def test_confirm_rejects_weak_password(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.post(self.confirm_url, {"uid": uid, "token": token, "new_password": "123"})

        self.assertEqual(response.status_code, 400)
        self.assertIn("new_password", response.data)


class AdminDirectoryTests(APITestCase):
    def setUp(self):
        self.dept = Department.objects.create(name="Computer Science", department_code="CSC")
        self.admin = User.objects.create_user(email="admin@example.com", username="admin", password="x", role="admin")
        staff_user = User.objects.create_user(
            email="lect@example.com", username="lect", password="x", role="staff", first_name="Bola", last_name="Ade"
        )
        self.staff = Staff.objects.create(user=staff_user, department=self.dept)
        student_user = User.objects.create_user(
            email="ada@example.com", username="ada", password="x", first_name="Ada", last_name="Obi"
        )
        self.student = Student.objects.create(user=student_user, department=self.dept, entry_year=2025)

    def test_admin_can_search_students_by_name_and_matric(self):
        self.client.force_authenticate(self.admin)

        by_name = self.client.get("/api/students/", {"search": "obi"})
        by_matric = self.client.get("/api/students/", {"search": self.student.matric_number[-4:]})
        no_match = self.client.get("/api/students/", {"search": "zzz"})

        self.assertEqual(by_name.data["count"], 1)
        self.assertEqual(by_name.data["results"][0]["first_name"], "Ada")
        self.assertEqual(by_matric.data["count"], 1)
        self.assertEqual(no_match.data["count"], 0)

    def test_admin_can_update_student_status_and_level(self):
        self.client.force_authenticate(self.admin)
        url = f"/api/students/{self.student.matric_number}/"

        response = self.client.patch(url, {"status": "suspended", "level": "200"})

        self.assertEqual(response.status_code, 200)
        self.student.refresh_from_db()
        self.assertEqual((self.student.status, self.student.level), ("suspended", "200"))

    def test_admin_can_list_and_update_staff(self):
        self.client.force_authenticate(self.admin)

        listing = self.client.get("/api/staff/")
        update = self.client.patch(f"/api/staff/{self.staff.id}/", {"designation": "professor"})

        self.assertEqual(listing.data["count"], 1)
        self.assertEqual(update.status_code, 200)
        self.staff.refresh_from_db()
        self.assertEqual(self.staff.designation, "professor")

    def test_directories_are_admin_only(self):
        self.client.force_authenticate(self.staff.user)
        self.assertEqual(self.client.get("/api/students/").status_code, 403)
        self.assertEqual(self.client.get("/api/staff/").status_code, 403)

    def test_staff_enroll_sets_designation(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post("/api/staff-enroll/", {
            "department": "CSC", "designation": "sr_lecturer", "email": "new@example.com",
            "username": "newlect", "password": "Str0ngPassw0rd!", "first_name": "New", "last_name": "Lect",
        })

        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.get(email="new@example.com").staff_profile.designation, "sr_lecturer")

    def test_student_enroll_returns_matric_number(self):
        response = self.client.post("/api/student-enroll/", {
            "department": "CSC", "entry_year": 2026, "email": "kemi@example.com", "username": "kemi",
            "password": "Str0ngPassw0rd!", "first_name": "Kemi", "last_name": "Ola",
        })

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            response.data["matric_number"],
            User.objects.get(email="kemi@example.com").student_profile.matric_number,
        )
