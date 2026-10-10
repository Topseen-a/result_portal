import { apiRequest, fetchAllPages, toQuery } from "./client";

// --- Auth ---
export function login(email, password) {
  return apiRequest("/auth/login/", { method: "POST", body: { email, password }, auth: false });
}

export function enrollStudent(payload) {
  return apiRequest("/student-enroll/", { method: "POST", body: payload, auth: false });
}

export function getMe() {
  return apiRequest("/me/");
}

// --- Departments ---
export function listDepartments() {
  return fetchAllPages("/departments/", {}, { auth: false });
}

export function createDepartment(payload) {
  return apiRequest("/departments/", { method: "POST", body: payload });
}

export function updateDepartment(code, payload) {
  return apiRequest(`/departments/${code}/`, { method: "PATCH", body: payload });
}

export function deleteDepartment(code) {
  return apiRequest(`/departments/${code}/`, { method: "DELETE" });
}

// --- Courses (nested under a department) ---
export function listCourses(departmentCode) {
  return fetchAllPages(`/departments/${departmentCode}/course/`);
}

export function createCourse(departmentCode, payload) {
  return apiRequest(`/departments/${departmentCode}/course/`, { method: "POST", body: payload });
}

export function updateCourse(departmentCode, courseCode, payload) {
  return apiRequest(`/departments/${departmentCode}/course/${courseCode}/`, { method: "PATCH", body: payload });
}

export function deleteCourse(departmentCode, courseCode) {
  return apiRequest(`/departments/${departmentCode}/course/${courseCode}/`, { method: "DELETE" });
}

// --- Academic sessions ---
export function listSessions() {
  return fetchAllPages("/session/");
}

export function createSession(payload) {
  return apiRequest("/session/", { method: "POST", body: payload });
}

export function updateSession(id, payload) {
  return apiRequest(`/session/${id}/`, { method: "PATCH", body: payload });
}

export function deleteSession(id) {
  return apiRequest(`/session/${id}/`, { method: "DELETE" });
}

// --- Course registration ---
export function listMyRegistrations() {
  return fetchAllPages("/course-registration/");
}

// One page of registrations, with filters (admin/staff view).
export function listRegistrationsPage(params) {
  return apiRequest(`/course-registration/${toQuery(params)}`);
}

export function registerCourse({ course, session }) {
  return apiRequest("/course-registration/", { method: "POST", body: { course, session } });
}

export function dropRegistration(id) {
  return apiRequest(`/course-registration/${id}/`, { method: "DELETE" });
}

// --- Results ---
export function listResults() {
  return fetchAllPages("/results/");
}

// One page of results, with filters (admin view).
export function listResultsPage(params) {
  return apiRequest(`/results/${toQuery(params)}`);
}

export function uploadResult({ registration, score }) {
  return apiRequest("/results/", { method: "POST", body: { registration, score } });
}

export function updateResultScore(id, score) {
  return apiRequest(`/results/${id}/`, { method: "PATCH", body: { score } });
}

export function deleteResult(id) {
  return apiRequest(`/results/${id}/`, { method: "DELETE" });
}

export function publishResult(id, isPublished) {
  return apiRequest(`/results/${id}/`, { method: "PATCH", body: { is_published: isPublished } });
}

// --- GPA / CGPA ---
export function getGpa(matricNumber, sessionId) {
  return apiRequest(`/gpa/${matricNumber}/${sessionId}/`);
}

export function getCgpa(matricNumber) {
  return apiRequest(`/cgpa/${matricNumber}/`);
}

// --- Password reset ---
export function requestPasswordReset(email) {
  return apiRequest("/auth/password-reset/", { method: "POST", body: { email }, auth: false });
}

export function confirmPasswordReset({ uid, token, newPassword }) {
  return apiRequest("/auth/password-reset/confirm/", {
    method: "POST",
    body: { uid, token, new_password: newPassword },
    auth: false,
  });
}

// --- Admin ---
export function getAdminOverview() {
  return apiRequest("/admin-overview/");
}

export function listStudentsPage(params) {
  return apiRequest(`/students/${toQuery(params)}`);
}

export function updateStudent(matricNumber, payload) {
  return apiRequest(`/students/${matricNumber}/`, { method: "PATCH", body: payload });
}

export function listStaffPage(params) {
  return apiRequest(`/staff/${toQuery(params)}`);
}

export function enrollStaff(payload) {
  return apiRequest("/staff-enroll/", { method: "POST", body: payload });
}

export function updateStaff(id, payload) {
  return apiRequest(`/staff/${id}/`, { method: "PATCH", body: payload });
}

export function sendMessage({ email, subject, message }) {
  return apiRequest("/send-message/", { method: "POST", body: { email, subject, message } });
}
