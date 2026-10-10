import {
  DashboardIcon,
  CoursesIcon,
  RegistrationIcon,
  ResultsIcon,
  GpaIcon,
  SettingsIcon,
  BuildingIcon,
  CalendarIcon,
  UsersIcon,
  BriefcaseIcon,
  SearchIcon,
} from "./icons";

const account = { section: "Settings", items: [{ to: "/account", label: "Account settings", icon: SettingsIcon }] };

// Sidebar sections per role. Each page title in the top bar comes from here too.
export const NAV_BY_ROLE = {
  admin: [
    { section: "Overview", items: [{ to: "/dashboard", label: "Dashboard", icon: DashboardIcon }] },
    {
      section: "Academics",
      items: [
        { to: "/departments", label: "Departments", icon: BuildingIcon },
        { to: "/courses", label: "Courses", icon: CoursesIcon },
        { to: "/sessions", label: "Sessions", icon: CalendarIcon },
      ],
    },
    {
      section: "People",
      items: [
        { to: "/students", label: "Students", icon: UsersIcon },
        { to: "/staff", label: "Staff", icon: BriefcaseIcon },
      ],
    },
    {
      section: "Records",
      items: [
        { to: "/registrations", label: "Registrations", icon: RegistrationIcon },
        { to: "/results", label: "Results", icon: ResultsIcon },
      ],
    },
    account,
  ],
  staff: [
    {
      section: "Teaching",
      items: [
        { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
        { to: "/courses", label: "Courses", icon: CoursesIcon },
        { to: "/results", label: "Grade results", icon: ResultsIcon },
        { to: "/student-lookup", label: "Student lookup", icon: SearchIcon },
      ],
    },
    account,
  ],
  student: [
    {
      section: "Academic",
      items: [
        { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
        { to: "/courses", label: "Course catalog", icon: CoursesIcon },
        { to: "/registrations", label: "My registrations", icon: RegistrationIcon },
        { to: "/results", label: "My results", icon: ResultsIcon },
        { to: "/gpa", label: "GPA / CGPA", icon: GpaIcon },
      ],
    },
    account,
  ],
};

export function pageTitle(role, pathname) {
  for (const group of NAV_BY_ROLE[role] || []) {
    const match = group.items.find((item) => pathname.startsWith(item.to));
    if (match) return { section: group.section, label: match.label };
  }
  return null;
}
