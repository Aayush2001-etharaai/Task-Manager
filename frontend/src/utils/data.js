import {
  MdAddTask,
  MdDashboardCustomize,
  MdLogout,
  MdManageHistory,
  MdOutlineTaskAlt,
  MdPeopleAlt,
  MdFolderShared,
} from "react-icons/md"

export const SIDE_MENU_DATA = [
  {
    id: 1,
    label: "Dashboard",
    icon: MdDashboardCustomize,
    path: "/admin/dashboard",
  },
  {
    id: 2,
    label: "Projects",
    icon: MdFolderShared,
    path: "/admin/projects",
  },
  {
    id: 3,
    label: "Manage Task",
    icon: MdManageHistory,
    path: "/admin/tasks",
  },
  {
    id: 4,
    label: "Create Task",
    icon: MdAddTask,
    path: "/admin/create-task",
  },
  {
    id: 5,
    label: "Team Members",
    icon: MdPeopleAlt,
    path: "/admin/users",
  },
  {
    id: 6,
    label: "Logout",
    icon: MdLogout,
    path: "logout",
  },
]

export const USER_SIDE_MENU_DATA = [
  {
    id: 1,
    label: "Dashboard",
    icon: MdDashboardCustomize,
    path: "/user/dashboard",
  },
  {
    id: 2,
    label: "My Projects",
    icon: MdFolderShared,
    path: "/user/projects",
  },
  {
    id: 3,
    label: "My Tasks",
    icon: MdOutlineTaskAlt,
    path: "/user/tasks",
  },
  {
    id: 4,
    label: "Logout",
    icon: MdLogout,
    path: "logout",
  },
]

export const PRIORITY_DATA = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
]

export const STATUS_DATA = [
  { label: "To Do", value: "To Do" },
  { label: "In Progress", value: "In Progress" },
  { label: "Done", value: "Done" },
]
