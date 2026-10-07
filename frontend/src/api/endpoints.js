import { apiRequest, unwrapResults } from "./client";

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
export async function listDepartments() {
  const data = await apiRequest("/departments/", { auth: false });
  return unwrapResults(data);
}

// --- Courses (nested under a department) ---
export async function listCourses(departmentCode) {
  const data = await apiRequest(`/departments/${departmentCode}/course/`);
  return unwrapResults(data);
}

// --- Academic sessions ---
export async function listSessions() {
  const data = await apiRequest("/session/");
  return unwrapResults(data);
}

// --- Course registration ---
export async function listMyRegistrations() {
  const data = await apiRequest("/course-registration/");
  return unwrapResults(data);
}

export function registerCourse({ course, session }) {
  return apiRequest("/course-registration/", { method: "POST", body: { course, session } });
}

export function dropRegistration(id) {
  return apiRequest(`/course-registration/${id}/`, { method: "DELETE" });
}

// --- Results ---
export async function listResults() {
  const data = await apiRequest("/results/");
  return unwrapResults(data);
}

export function uploadResult({ registration, score }) {
  return apiRequest("/results/", { method: "POST", body: { registration, score } });
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
