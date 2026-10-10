import { useMemo, useState } from "react";
import { listDepartments, createDepartment, updateDepartment, deleteDepartment, getAdminOverview } from "../../api/endpoints";
import { useFetch } from "../../utils/useFetch";
import { useToast } from "../../context/ToastContext";
import { Card, PageHeader, Button, Input, Textarea, Alert, SearchInput, FilterBar, LoadingBlock, EmptyState, IconButton } from "../../components/ui";
import { DataTable } from "../../components/DataTable";
import Modal, { ConfirmDialog } from "../../components/Modal";
import { PlusIcon, PencilIcon, TrashIcon } from "../../components/icons";

const EMPTY_FORM = { name: "", department_code: "", description: "" };

function DepartmentFormModal({ department, onClose, onSaved }) {
  const isEdit = Boolean(department);
  const [form, setForm] = useState(department ? { ...EMPTY_FORM, ...department } : EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isEdit) {
        await updateDepartment(department.department_code, { name: form.name, description: form.description });
      } else {
        await createDepartment(form);
      }
      onSaved(isEdit ? `${form.name} updated.` : `${form.name} created.`);
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
      title={isEdit ? "Edit department" : "New department"}
      description={isEdit ? "The department code can't be changed." : "Students and staff are assigned to departments."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="department-form" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create department"}
          </Button>
        </>
      }
    >
      <form id="department-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Computer Science"
          />
          <Input
            label="Code"
            required
            maxLength={20}
            disabled={isEdit}
            value={form.department_code}
            onChange={(e) => update("department_code", e.target.value.toUpperCase().replace(/\s/g, ""))}
            placeholder="CSC"
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

export default function Departments() {
  const toast = useToast();
  const { data: departments, loading, reload } = useFetch(listDepartments, []);
  // Head counts per department come from the admin overview endpoint.
  const { data: overview, reload: reloadOverview } = useFetch(getAdminOverview, []);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | department
  const [deleting, setDeleting] = useState(null);
  const [deleteState, setDeleteState] = useState({ busy: false, error: "" });

  const countsByCode = useMemo(
    () => new Map((overview?.departments || []).map((d) => [d.department_code, d])),
    [overview]
  );

  const rows = (departments || []).filter((d) => {
    const term = search.trim().toLowerCase();
    return !term || d.name.toLowerCase().includes(term) || d.department_code.toLowerCase().includes(term);
  });

  function refresh() {
    reload();
    reloadOverview();
  }

  async function confirmDelete() {
    setDeleteState({ busy: true, error: "" });
    try {
      await deleteDepartment(deleting.department_code);
      toast(`${deleting.name} deleted.`);
      setDeleting(null);
      refresh();
      setDeleteState({ busy: false, error: "" });
    } catch (err) {
      setDeleteState({ busy: false, error: err.message });
    }
  }

  const count = (code, key) => countsByCode.get(code)?.[key] ?? "—";

  const columns = [
    {
      key: "name",
      header: "Department",
      cell: (d) => (
        <span className="block leading-tight">
          <span className="block font-medium text-slate-800">{d.name}</span>
          {d.description && <span className="mt-0.5 block max-w-md truncate text-xs text-slate-400">{d.description}</span>}
        </span>
      ),
    },
    {
      key: "department_code",
      header: "Code",
      cell: (d) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">{d.department_code}</span>
      ),
    },
    { key: "students", header: "Students", align: "right", cellClassName: "tabular-nums text-slate-600", cell: (d) => count(d.department_code, "students") },
    { key: "staff", header: "Staff", align: "right", cellClassName: "tabular-nums text-slate-600", cell: (d) => count(d.department_code, "staff") },
    { key: "courses", header: "Courses", align: "right", cellClassName: "tabular-nums text-slate-600", cell: (d) => count(d.department_code, "courses") },
    {
      key: "actions",
      header: "",
      align: "right",
      hideLabel: true,
      cell: (d) => (
        <div className="flex justify-end gap-1">
          <IconButton label={`Edit ${d.name}`} onClick={() => setEditing(d)}>
            <PencilIcon width={16} height={16} />
          </IconButton>
          <IconButton label={`Delete ${d.name}`} tone="danger" onClick={() => setDeleting(d)}>
            <TrashIcon width={16} height={16} />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Academic departments that students, staff and courses belong to."
        actions={
          <Button onClick={() => setEditing("new")}>
            <PlusIcon width={16} height={16} />
            New department
          </Button>
        }
      />

      <Card flush>
        <FilterBar>
          <SearchInput
            className="sm:w-72"
            placeholder="Search by name or code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FilterBar>
        {loading ? (
          <LoadingBlock />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            keyField="department_code"
            empty={
              <EmptyState
                title={search ? "No departments match your search" : "No departments yet"}
                description={search ? undefined : "Create the first department to start adding courses and people."}
              />
            }
          />
        )}
      </Card>

      {editing && (
        <DepartmentFormModal
          department={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null);
            toast(message);
            refresh();
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => {
          setDeleting(null);
          setDeleteState({ busy: false, error: "" });
        }}
        onConfirm={confirmDelete}
        title="Delete department?"
        message={
          deleting && (
            <>
              <span className="font-semibold text-slate-800">{deleting.name}</span> will be removed. A department that
              still has students, staff or courses can't be deleted.
            </>
          )
        }
        busy={deleteState.busy}
        error={deleteState.error}
      />
    </div>
  );
}
