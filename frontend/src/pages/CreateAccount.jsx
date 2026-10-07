import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { enrollStudent, listDepartments } from "../api/endpoints";
import { useFetch } from "../utils/useFetch";
import { Button, Input, Select, Alert } from "../components/ui";

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

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-navy-950 p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold">
            R
          </div>
          <span className="text-lg font-semibold tracking-tight">Result Portal</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">
            Create your student account in a minute.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Your matric number is generated automatically. Once you're in, you can register for
            courses and track your results and GPA.
          </p>
        </div>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Result Portal</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#f6f7fb] px-6 py-12">
        <div className="w-full max-w-sm">
          {success !== null ? (
            <>
              <h2 className="text-2xl font-semibold text-slate-900">Account created</h2>
              <p className="mt-1 text-sm text-slate-500">
                {success ? (
                  <>
                    Your matric number is <span className="font-semibold text-slate-700">{success}</span>.
                    Sign in with your email and password to continue.
                  </>
                ) : (
                  "Sign in with your email and password to continue."
                )}
              </p>
              <Button className="mt-6 w-full" onClick={() => navigate("/login")}>
                Go to sign in
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-slate-900">Create your account</h2>
              <p className="mt-1 text-sm text-slate-500">Register as a student to get started.</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {error && <Alert>{error}</Alert>}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="First name"
                    required
                    value={form.first_name}
                    onChange={(e) => update("first_name", e.target.value)}
                    placeholder="Jane"
                  />
                  <Input
                    label="Last name"
                    required
                    value={form.last_name}
                    onChange={(e) => update("last_name", e.target.value)}
                    placeholder="Doe"
                  />
                </div>
                <Input
                  label="Email"
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
                <Input
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="••••••••"
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
                  <Select
                    label="Entry year"
                    value={form.entry_year}
                    onChange={(e) => update("entry_year", e.target.value)}
                  >
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

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-brand-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
