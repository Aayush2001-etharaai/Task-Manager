import React, { useEffect, useState } from "react"
import axiosInstance from "../../utils/axioInstance"
import DashboardLayout from "../../components/DashboardLayout"
import { FaPlus, FaTrash } from "react-icons/fa"
import toast from "react-hot-toast"
import Modal from "../../components/Modal"
import { useSelector } from "react-redux"

const ManageProjects = () => {
  const { currentUser } = useSelector((state) => state.user)
  const basePath =
    currentUser?.role === "admin" ? "/admin" : "/user"

  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [newProject, setNewProject] = useState({ name: "", description: "" })
  const [memberEmail, setMemberEmail] = useState("")

  const loadProjects = async () => {
    try {
      const res = await axiosInstance.get("/projects")
      setProjects(res.data || [])
    } catch (err) {
      console.log(err)
    }
  }

  const loadProjectDetails = async (id) => {
    try {
      const res = await axiosInstance.get(`/projects/${id}`)
      setSelectedProject(res.data)
    } catch (err) {
      toast.error("Could not load project")
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await axiosInstance.post("/projects", newProject)
      toast.success("Project created — you are the project admin")
      setIsCreateOpen(false)
      setNewProject({ name: "", description: "" })
      loadProjects()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create project")
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!selectedProject) return
    try {
      await axiosInstance.post(`/projects/${selectedProject._id}/members`, {
        email: memberEmail,
      })
      toast.success("Member added")
      setMemberEmail("")
      setIsAddMemberOpen(false)
      loadProjectDetails(selectedProject._id)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member")
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!selectedProject) return
    try {
      await axiosInstance.delete(
        `/projects/${selectedProject._id}/members/${userId}`
      )
      toast.success("Member removed")
      loadProjectDetails(selectedProject._id)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member")
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const canManage =
    currentUser?.role === "admin" ||
    selectedProject?.myRole === "admin" ||
    selectedProject?.members?.some(
      (m) => m._id === currentUser?._id && m.projectRole === "admin"
    )

  return (
    <DashboardLayout activeMenu={currentUser?.role === "admin" ? "Projects" : "My Projects"}>
      <div className="p-6 space-y-6 text-slate-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Projects</h2>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm cursor-pointer"
          >
            <FaPlus /> New Project
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {projects.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => loadProjectDetails(p._id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  selectedProject?._id === p._id
                    ? "border-blue-500 bg-slate-700/80"
                    : "border-slate-700 bg-slate-800 hover:border-slate-600"
                }`}
              >
                <p className="font-semibold text-white">{p.name}</p>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                  {p.description || "No description"}
                </p>
                <span className="text-xs text-blue-400 mt-2 inline-block">
                  {p.projectRole === "admin" ? "Project Admin" : "Member"}
                </span>
              </button>
            ))}
            {projects.length === 0 && (
              <p className="text-slate-400">Create a project to get started.</p>
            )}
          </div>

          {selectedProject && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white">
                {selectedProject.name}
              </h3>
              <p className="text-slate-400 text-sm mt-2">
                {selectedProject.description}
              </p>

              <div className="flex justify-between items-center mt-6 mb-3">
                <h4 className="font-medium text-white">Members</h4>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => setIsAddMemberOpen(true)}
                    className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    + Add member
                  </button>
                )}
              </div>

              <ul className="space-y-2">
                {selectedProject.members?.map((m) => (
                  <li
                    key={m._id}
                    className="flex justify-between items-center py-2 px-3 bg-slate-700/50 rounded-lg"
                  >
                    <div>
                      <p className="text-white text-sm">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300 capitalize">
                        {m.projectRole}
                      </span>
                      {canManage && m.projectRole !== "admin" && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m._id)}
                          className="text-red-400 hover:text-red-300 cursor-pointer"
                          title="Remove member"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {canManage && (
                <button
                  type="button"
                  onClick={() =>
                    window.location.assign(
                      `${basePath}/create-task?projectId=${selectedProject._id}`
                    )
                  }
                  className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm cursor-pointer"
                >
                  Create task in this project
                </button>
              )}
            </div>
          )}
        </div>

        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create Project"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              required
              placeholder="Project name"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
              className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white"
            />
            <textarea
              placeholder="Description"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
              className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white"
              rows={3}
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg cursor-pointer"
            >
              Create
            </button>
          </form>
        </Modal>

        <Modal
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          title="Add Member"
        >
          <form onSubmit={handleAddMember} className="space-y-4">
            <input
              required
              type="email"
              placeholder="Member email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white"
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg cursor-pointer"
            >
              Add
            </button>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default ManageProjects
