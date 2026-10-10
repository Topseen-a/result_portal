import { useState } from "react";
import { listStaffPage, updateStaff, enrollStaff, listDepartments } from "../../api/endpoints";
import { useFetch } from "../../utils/useFetch";
import { useDebounce } from "../../utils/useDebounce";
import { useToast } from "../../context/ToastContext";
import { DESIGNATIONS, PAGE_SIZE, fullName, designationLabel, formatDate } from "../../utils/constants";
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
} from "../../components/ui";
import { DataTable } from "../../components/DataTable";
import Modal from "../../components/Modal";
import SendMessageModal from "../../components/SendMessageModal";
import { initials } from "../../components/Sidebar";
import { PlusIcon, PencilIcon, SendIcon } from "../../components/icons";

function AddStaffModal({ departments, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    department: departments?.[0]?.department_code || "",
    designation: "lecturer_i",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await enrollStaff(form);
      onSaved(`${form.first_name} ${form.last_name} added to staff.`);
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
      title="Add staff member"
      description="Creates a staff account that can add courses and grade results. Share the password with them."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-staff-form" disabled={saving}>
            {saving ? "Adding..." : "Add staff member"}
          </Button>
        </>
      }
    >
      <form id="add-staff-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First name" required value={form.first_name} onChange={(e) => update("first_name", e.target.value)} />
          <Input label="Last name" required value={form.last_name} onChange={(e) => update("last_name", e.target.value)} />
          <Input label="Email address" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
          <Input label="Username" required value={form.username} onChange={(e) => update("username", e.target.value)} />
          <Select label="Department" required value={form.department} onChange={(e) => update("department", e.target.value)}>
            {(departments || []).map((d) => (
              <option key={d.department_code} value={d.department_code}>
                {d.name}
              </option>
            ))}
          </Select>
          <Select label="Designation" value={form.designation} onChange={(e) => update("designation", e.target.value)}>
            {DESIGNATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
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

function EditStaffModal({ member, departments, onClose, onSaved }) {
  const [form, setForm] = useState({ department: member.department, designation: member.designation });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateStaff(member.id, form);
      onSaved(`${fullName(member)}'s details updated.`);
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
      title={fullName(member)}
      description={member.email}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-staff-form" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </>
      }
    >
      <form id="edit-staff-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Select label="Department" value={form.department} onChange={(e) => update("department", e.target.value)}>
          {(departments || []).map((d) => (
            <option key={d.department_code} value={d.department_code}>
              {d.name}
            </option>
          ))}
        </Select>
        <Select label="Designation" value={form.designation} onChange={(e) => update("designation", e.target.value)}>
          {DESIGNATIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>
      </form>
    </Modal>
  );
}

export default function Staff() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const debouncedSearch = useDebounce(search);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [emailing, setEmailing] = useState(null);

  const { data: departments } = useFetch(listDepartments, []);
  const { data, loading, reload } = useFetch(
    () => listStaffPage({ page, search: debouncedSearch, department }),
    [page, debouncedSearch, department]
  );

  const columns = [
    {
      key: "name",
      header: "Name",
      cell: (m) => (
        <span className="flex items-center gap-3">
          <span className="hidden h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 sm:grid">
            {initials(fullName(m))}
          </span>
          <span className="block min-w-0 leading-tight">
            <span className="block font-medium text-slate-800">{fullName(m)}</span>
            <span className="block truncate text-xs text-slate-400">{m.email}</span>
          </span>
        </span>
      ),
    },
    { key: "department_name", header: "Department" },
    {
      key: "designation",
      header: "Designation",
      cell: (m) => <Badge tone={m.designation === "hod" ? "info" : "default"}>{designationLabel(m.designation)}</Badge>,
    },
    { key: "created_at", header: "Joined", cellClassName: "whitespace-nowrap text-slate-500", cell: (m) => formatDate(m.created_at) },
    {
      key: "actions",
      header: "",
      align: "right",
      hideLabel: true,
      cell: (m) => (
        <div className="flex justify-end gap-1">
          <IconButton label={`Email ${fullName(m)}`} onClick={() => setEmailing({ name: fullName(m), email: m.email })}>
            <SendIcon width={15} height={15} />
          </IconButton>
          <IconButton label={`Edit ${fullName(m)}`} onClick={() => setEditing(m)}>
            <PencilIcon width={16} height={16} />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Lecturers who add courses and grade results."
        actions={
          <Button onClick={() => setAdding(true)}>
            <PlusIcon width={16} height={16} />
            Add staff member
          </Button>
        }
      />

      <Card flush>
        <FilterBar>
          <SearchInput
            className="sm:w-72"
            placeholder="Search name or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="sm:w-56"
          >
            <option value="">All departments</option>
            {(departments || []).map((d) => (
              <option key={d.department_code} value={d.department_code}>
                {d.name}
              </option>
            ))}
          </Select>
        </FilterBar>
        {loading && !data ? (
          <LoadingBlock />
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : ""}>
            <DataTable
              columns={columns}
              rows={data?.results}
              empty={
                <EmptyState
                  title={debouncedSearch || department ? "No staff match these filters" : "No staff yet"}
                  description={debouncedSearch || department ? undefined : "Add a staff member so they can start grading."}
                />
              }
            />
            <Pagination page={page} pageSize={PAGE_SIZE} count={data?.count ?? 0} onPageChange={setPage} />
          </div>
        )}
      </Card>

      {adding && (
        <AddStaffModal
          departments={departments}
          onClose={() => setAdding(false)}
          onSaved={(message) => {
            setAdding(false);
            toast(message);
            reload();
          }}
        />
      )}
      {editing && (
        <EditStaffModal
          member={editing}
          departments={departments}
          onClose={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null);
            toast(message);
            reload();
          }}
        />
      )}
      {emailing && <SendMessageModal recipient={emailing} onClose={() => setEmailing(null)} />}
    </div>
  );
}
