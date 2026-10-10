import { useState } from "react";
import { createCourse, updateCourse } from "../api/endpoints";
import { LEVELS, SEMESTERS } from "../utils/constants";
import Modal from "./Modal";
import { Alert, Button, Input, Select, Textarea } from "./ui";

const EMPTY_FORM = { course_code: "", title: "", level: "100", semester: "first", credit_units: 3, description: "" };

export default function CourseFormModal({ course, department, onClose, onSaved }) {
  const isEdit = Boolean(course);
  const [form, setForm] = useState(course ? { ...EMPTY_FORM, ...course } : EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = { ...form, credit_units: Number(form.credit_units) };
    try {
      if (isEdit) await updateCourse(department.department_code, course.course_code, payload);
      else await createCourse(department.department_code, payload);
      onSaved(isEdit ? `${form.course_code} updated.` : `${form.course_code} added to ${department.name}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? `Edit ${course.course_code}` : "New course"}
      description={department ? `Department: ${department.name}` : undefined}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="course-form" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create course"}
          </Button>
        </>
      }
    >
      <form id="course-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
          <Input
            label="Course code"
            required
            disabled={isEdit}
            value={form.course_code}
            onChange={(e) => update("course_code", e.target.value.toUpperCase().replace(/\s/g, ""))}
            placeholder="CSC101"
          />
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Introduction to Computer Science"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select label="Level" value={form.level} onChange={(e) => update("level", e.target.value)}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l} Level
              </option>
            ))}
          </Select>
          <Select label="Semester" value={form.semester} onChange={(e) => update("semester", e.target.value)}>
            {SEMESTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          <Input
            label="Credit units"
            type="number"
            min={1}
            max={6}
            required
            value={form.credit_units}
            onChange={(e) => update("credit_units", e.target.value)}
          />
        </div>
        <Textarea
          label="Description"
          rows={3}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Optional"
        />
      </form>
    </Modal>
  );
}
