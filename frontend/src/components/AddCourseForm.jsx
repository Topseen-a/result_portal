import { useState } from "react";
import { apiRequest } from "../api/client";
import { Card, Input, Select, Button, Alert } from "./ui";

const LEVELS = ["100", "200", "300", "400", "500"];

export default function AddCourseForm({ departmentCode, onCreated }) {
  const [form, setForm] = useState({
    course_code: "",
    title: "",
    level: "100",
    semester: "first",
    credit_units: 3,
    description: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await apiRequest(`/departments/${departmentCode}/course/`, {
        method: "POST",
        body: { ...form, credit_units: Number(form.credit_units) },
      });
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Course code"
            required
            value={form.course_code}
            onChange={(e) => update("course_code", e.target.value.toUpperCase())}
            placeholder="CSC101"
          />
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Introduction to Computer Science"
          />
          <Select label="Level" value={form.level} onChange={(e) => update("level", e.target.value)}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l} Level
              </option>
            ))}
          </Select>
          <Select label="Semester" value={form.semester} onChange={(e) => update("semester", e.target.value)}>
            <option value="first">First Semester</option>
            <option value="second">Second Semester</option>
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
        <Input
          label="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Optional"
        />
        <Button type="submit" disabled={saving || !departmentCode}>
          {saving ? "Saving..." : "Create course"}
        </Button>
      </form>
    </Card>
  );
}
