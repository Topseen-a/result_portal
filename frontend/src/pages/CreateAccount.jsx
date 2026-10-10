import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { enrollStudent, listDepartments } from "../api/endpoints";
import { useFetch } from "../utils/useFetch";
import { Button, Input, PasswordInput, Select, Alert } from "../components/ui";
import AuthLayout from "../components/AuthLayout";

const CURRENT_YEAR = new Date().getFullYear();
const ENTRY_YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

export default function CreateAccount() {
  const navigate = useNavigate();
  const { data: departments, loading: loadingDepts } = useFetch(listDepartments, []);

  const [form, setForm] = useState({
    department: "",
    entry_year: CURRENT_YEAR,
    email: "",
    username: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const result = await enrollStudent({ ...form, entry_year: Number(form.entry_year) });
      setSuccess(result?.matric_number || "");
    } catch (err) {
      setError(err.message || "Could not create your account.");
    } finally {
      setSaving(false);
    }
  }

  const panelProps = {
    panelTitle: "Create your student account in a minute.",
    panelText:
      "Your matric number is generated automatically. Once you're in, you can register for courses and track your results and GPA.",
  };

  if (success !== null) {
    return (
      <AuthLayout heading="Account created" {...panelProps}>
        <p className="text-sm leading-relaxed text-slate-600">
          {success ? (
            <>
              Your matric number is <span className="font-semibold text-slate-800">{success}</span>. Sign in with
              your email and password to continue.
            </>
          ) : (
            "Sign in with your email and password to continue."
          )}
        </p>
        <Button className="mt-6 w-full" onClick={() => navigate("/login")}>
          Go to sign in
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      heading="Create your account"
      subheading="Register as a student to get started."
      {...panelProps}
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            autoComplete="given-name"
            required
            value={form.first_name}
            onChange={(e) => update("first_name", e.target.value)}
            placeholder="Jane"
          />
          <Input
            label="Last name"
            autoComplete="family-name"
            required
            value={form.last_name}
            onChange={(e) => update("last_name", e.target.value)}
            placeholder="Doe"
          />
        </div>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="you@example.com"
        />
        <Input
          label="Username"
          autoComplete="username"
          required
          value={form.username}
          onChange={(e) => update("username", e.target.value)}
          placeholder="janedoe"
        />
        <PasswordInput
          label="Password"
          autoComplete="new-password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="At least 8 characters"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Department"
            required
            value={form.department}
            onChange={(e) => update("department", e.target.value)}
            disabled={loadingDepts}
          >
            <option value="" disabled>
              Select department
            </option>
            {(departments || []).map((d) => (
              <option key={d.department_code} value={d.department_code}>
                {d.department_code} — {d.name}
              </option>
            ))}
          </Select>
          <Select label="Entry year" value={form.entry_year} onChange={(e) => update("entry_year", e.target.value)}>
            {ENTRY_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
