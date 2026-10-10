import { useState } from "react";
import {
  listStudentsPage,
  updateStudent,
  listDepartments,
  enrollStudent,
  getCgpa,
} from "../../api/endpoints";
import { useFetch } from "../../utils/useFetch";
import { useDebounce } from "../../utils/useDebounce";
import { useToast } from "../../context/ToastContext";
import {
  LEVELS,
  STUDENT_STATUSES,
  PAGE_SIZE,
  fullName,
  statusLabel,
  formatDate,
} from "../../utils/constants";
import {
  Card,
  PageHeader,
  Button,
  Input,
  PasswordInput,
  Select,
  Alert,
  Badge,
  SearchInput,
  FilterBar,
  Pagination,
  LoadingBlock,
  EmptyState,
  IconButton,
  Spinner,
} from "../../components/ui";
import { DataTable } from "../../components/DataTable";
import Modal from "../../components/Modal";
import SendMessageModal from "../../components/SendMessageModal";
import { initials } from "../../components/Sidebar";
import { PlusIcon, PencilIcon, SendIcon } from "../../components/icons";

function StudentModal({ student, departments, onClose, onSaved, onEmail }) {
  const [form, setForm] = useState({
    department: student.department,
    level: student.level,
    status: student.status,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { data: cgpa, loading: loadingCgpa } = useFetch(
    () => getCgpa(student.matric_number),
    [student.matric_number],
  );
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const name = fullName(student);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateStudent(student.matric_number, form);
      onSaved(`${name}'s record updated.`);
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
      title="Student record"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="student-form" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 font-semibold text-brand-600">
            {initials(name)}
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-slate-900">{name}</p>
            <p className="text-sm text-slate-500">{student.email}</p>
          </div>
        </div>
        <Button variant="outline" className="!py-2" onClick={onEmail}>
          <SendIcon width={15} height={15} />
          Send email
        </Button>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-100 bg-slate-100 sm:grid-cols-4">
        {[
          { label: "Matric number", value: student.matric_number, mono: true },
          { label: "Entry year", value: student.entry_year },
          { label: "Enrolled", value: formatDate(student.enrolled_at) },
          {
            label: "CGPA",
            value: loadingCgpa ? (
              <Spinner key="cgpa" className="!h-4 !w-4" />
            ) : (
              (cgpa?.cgpa ?? "—")
            ),
          },
        ].map(({ label, value, mono }) => (
          <div key={label} className="bg-white px-4 py-3">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd
              className={`mt-1 text-sm font-semibold text-slate-800 ${mono ? "font-mono text-[13px]" : ""}`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <form
        id="student-form"
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
      >
        <h3 className="text-sm font-semibold text-slate-800">
          Academic details
        </h3>
        {error && <Alert>{error}</Alert>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            label="Department"
            value={form.department}
            onChange={(e) => update("department", e.target.value)}
          >
            {(departments || []).map((d) => (
              <option key={d.department_code} value={d.department_code}>
                {d.name}
              </option>
            ))}
          </Select>
          <Select
            label="Level"
            value={form.level}
            onChange={(e) => update("level", e.target.value)}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l} Level
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
          >
            {STUDENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </form>
    </Modal>
  );
}

const thisYear = new Date().getFullYear();

function AddStudentModal({ departments, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    department: departments?.[0]?.department_code || "",
    entry_year: thisYear,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const created = await enrollStudent({
        ...form,
        entry_year: Number(form.entry_year),
      });
      onSaved(`Student added with matric number ${created.matric_number}.`);
    } catch (err) {
      setError(
        err.status === 404 ? "That department doesn't exist." : err.message,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Add student"
      description="A matric number is generated automatically. Share the password with the student so they can sign in."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-student-form" disabled={saving}>
            {saving ? "Adding..." : "Add student"}
          </Button>
        </>
      }
    >
      <form id="add-student-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            required
            value={form.first_name}
            onChange={(e) => update("first_name", e.target.value)}
          />
          <Input
            label="Last name"
            required
            value={form.last_name}
            onChange={(e) => update("last_name", e.target.value)}
          />
          <Input
            label="Email address"
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
          <Input
            label="Username"
            required
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
          />
          <Select
            label="Department"
            required
            value={form.department}
            onChange={(e) => update("department", e.target.value)}
          >
            {(departments || []).map((d) => (
              <option key={d.department_code} value={d.department_code}>
                {d.name}
              </option>
            ))}
          </Select>
          <Input
            label="Entry year"
            type="number"
            min={2000}
            max={2100}
            required
            value={form.entry_year}
            onChange={(e) => update("entry_year", e.target.value)}
          />
        </div>
        <PasswordInput
          label="Temporary password"
          autoComplete="new-password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="At least 8 characters"
        />
      </form>
    </Modal>
  );
}

export default function Students() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    level: "",
    status: "",
  });
  const debouncedSearch = useDebounce(search);
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [emailing, setEmailing] = useState(null);

  const { data: departments } = useFetch(listDepartments, []);
  const { data, loading, reload } = useFetch(
    () => listStudentsPage({ page, search: debouncedSearch, ...filters }),
    [page, debouncedSearch, filters.department, filters.level, filters.status],
  );

  function setFilter(field, value) {
    setFilters((f) => ({ ...f, [field]: value }));
    setPage(1);
  }

  const columns = [
    {
      key: "name",
      header: "Student",
      cell: (s) => (
        <span className="flex items-center gap-3">
          <span className="hidden h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 sm:grid">
            {initials(fullName(s))}
          </span>
          <span className="block min-w-0 leading-tight">
            <span className="block font-medium text-slate-800">
              {fullName(s)}
            </span>
            <span className="block truncate text-xs text-slate-400">
              {s.email}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: "matric_number",
      header: "Matric no.",
      cellClassName: "font-mono text-[13px] text-slate-600",
    },
    { key: "department_name", header: "Department" },
    { key: "level", header: "Level", cell: (s) => `${s.level}L` },
    {
      key: "status",
      header: "Status",
      cell: (s) => <Badge tone={s.status}>{statusLabel(s.status)}</Badge>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      hideLabel: true,
      cell: (s) => (
        <div className="flex justify-end gap-1">
          <IconButton
            label={`Email ${fullName(s)}`}
            onClick={() => setEmailing({ name: fullName(s), email: s.email })}
          >
            <SendIcon width={15} height={15} />
          </IconButton>
          <IconButton
            label={`Edit ${fullName(s)}`}
            onClick={() => setSelected(s)}
          >
            <PencilIcon width={16} height={16} />
          </IconButton>
        </div>
      ),
    },
  ];

  const filtered =
    debouncedSearch || filters.department || filters.level || filters.status;

  return (
    <div>
      <PageHeader
        title="Students"
        description="Look up any student, update their level or status, and view their CGPA."
        actions={
          <Button onClick={() => setAdding(true)}>
            <PlusIcon width={16} height={16} />
            Add student
          </Button>
        }
      />

      <Card flush>
        <FilterBar>
          <SearchInput
            className="sm:w-72"
            placeholder="Search name, email or matric no."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <div className="col-span-2 sm:col-span-1">
              <Select
                value={filters.department}
                onChange={(e) => setFilter("department", e.target.value)}
                className="sm:w-48"
              >
                <option value="">All departments</option>
                {(departments || []).map((d) => (
                  <option key={d.department_code} value={d.department_code}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>
            <Select
              value={filters.level}
              onChange={(e) => setFilter("level", e.target.value)}
              className="sm:w-32"
            >
              <option value="">All levels</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l} Level
                </option>
              ))}
            </Select>
            <Select
              value={filters.status}
              onChange={(e) => setFilter("status", e.target.value)}
              className="sm:w-36"
            >
              <option value="">All statuses</option>
              {STUDENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </FilterBar>
        {loading && !data ? (
          <LoadingBlock />
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : ""}>
            <DataTable
              columns={columns}
              rows={data?.results}
              keyField="matric_number"
              empty={
                <EmptyState
                  title={
                    filtered
                      ? "No students match these filters"
                      : "No students yet"
                  }
                  description={
                    filtered
                      ? "Try a different search or clear the filters."
                      : "Students appear here once they sign up or you add them."
                  }
                />
              }
            />
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              count={data?.count ?? 0}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>

      {selected && (
        <StudentModal
          student={selected}
          departments={departments}
          onClose={() => setSelected(null)}
          onEmail={() =>
            setEmailing({ name: fullName(selected), email: selected.email })
          }
          onSaved={(message) => {
            setSelected(null);
            toast(message);
            reload();
          }}
        />
      )}
      {adding && (
        <AddStudentModal
          departments={departments}
          onClose={() => setAdding(false)}
          onSaved={(message) => {
            setAdding(false);
            toast(message);
            reload();
          }}
        />
      )}
      {emailing && (
        <SendMessageModal
          recipient={emailing}
          onClose={() => setEmailing(null)}
        />
      )}
    </div>
  );
}
