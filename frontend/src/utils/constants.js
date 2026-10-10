// Mirrors the choices defined on the Django models.
export const LEVELS = ["100", "200", "300", "400", "500"];

export const SEMESTERS = [
  { value: "first", label: "First Semester" },
  { value: "second", label: "Second Semester" },
];

export const DESIGNATIONS = [
  { value: "lecturer_i", label: "Lecturer I" },
  { value: "lecturer_ii", label: "Lecturer II" },
  { value: "sr_lecturer", label: "Senior Lecturer" },
  { value: "professor", label: "Professor" },
  { value: "hod", label: "Head of Department" },
];

export const STUDENT_STATUSES = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "graduated", label: "Graduated" },
  { value: "withdrawn", label: "Withdrawn" },
];

const labelFor = (options) => (value) => options.find((o) => o.value === value)?.label ?? value;

export const semesterLabel = labelFor(SEMESTERS);
export const designationLabel = labelFor(DESIGNATIONS);
export const statusLabel = labelFor(STUDENT_STATUSES);

export const PAGE_SIZE = 20;

export function fullName(person) {
  return `${person?.first_name || ""} ${person?.last_name || ""}`.trim() || person?.username || "";
}

export function formatDate(value, options = { day: "numeric", month: "short", year: "numeric" }) {
  return value ? new Date(value).toLocaleDateString("en-US", options) : "—";
}
