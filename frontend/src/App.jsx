import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/auth/Login"
import SignUp from "./pages/auth/SignUp"
import Dashboard from "./pages/admin/Dashboard"
import ManageTasks from "./pages/admin/ManageTasks"
import ManageUsers from "./pages/admin/ManageUsers"
import ManageProjects from "./pages/admin/ManageProjects"
import CreateTask from "./pages/admin/CreateTask"
import PrivateRoute from "./routes/PrivateRoute"
import UserDashboard from "./pages/user/UserDashboard"
import TaskDetails from "./pages/user/TaskDetails"
import MyTasks from "./pages/user/MyTasks"
import { useSelector } from "react-redux"

import toast, { Toaster } from "react-hot-toast"

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Admin Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/projects" element={<ManageProjects />} />
            <Route path="/admin/tasks" element={<ManageTasks />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/create-task" element={<CreateTask />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={["member", "user"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/projects" element={<ManageProjects />} />
            <Route path="/user/tasks" element={<MyTasks />} />
            <Route path="/user/task-details/:id" element={<TaskDetails />} />
            <Route path="/user/create-task" element={<CreateTask />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Root />} />
        </Routes>
      </BrowserRouter>

      <Toaster />
    </div>
  )
}

export default App

const Root = () => {
  const { currentUser } = useSelector((state) => state.user)

  if (!currentUser) {
    return <Navigate to={"/login"} />
  }

  const role =
    currentUser.role === "user" ? "member" : currentUser.role

  return role === "admin" ? (
    <Navigate to={"/admin/dashboard"} />
  ) : (
    <Navigate to={"/user/dashboard"} />
  )
}
