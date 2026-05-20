import React, { useEffect, useState } from "react"
import axiosInstance from "../../utils/axioInstance"
import DashboardLayout from "../../components/DashboardLayout"
import { FaPlus } from "react-icons/fa"
import UserCard from "../../components/UserCard"
import toast from "react-hot-toast"
import Modal from "../../components/Modal"

const ManageUsers = () => {
  const [allUsers, setAllUsers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newMember, setNewMember] = useState({ name: "", email: "", password: "" })

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get("/users/get-users")

      if (response.data?.length > 0) {
        setAllUsers(response.data)
      }
    } catch (error) {
      console.log("Error fetching users: ", error)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the team?")) return
    try {
      await axiosInstance.delete(`/users/${userId}`)
      toast.success("Member removed")
      getAllUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member")
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    try {
      await axiosInstance.post("/auth/sign-up", {
        name: newMember.name,
        email: newMember.email,
        password: newMember.password
      })
      toast.success("Member added successfully!")
      setIsModalOpen(false)
      setNewMember({ name: "", email: "", password: "" })
      getAllUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add member")
    }
  }

  useEffect(() => {
    getAllUsers()

    return () => {}
  }, [])

  return (
    <DashboardLayout activeMenu={"Team Members"}>
      <div className="mt-5 mb-10 text-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-white">Team Members</h2>

          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors duration-200 font-medium shadow-sm hover:shadow-md cursor-pointer text-sm"
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlus />
            Add Member
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {allUsers?.map((user) => (
            <UserCard
              key={user._id}
              userInfo={user}
              onRemove={handleRemoveMember}
            />
          ))}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Member">
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Full Name</label>
              <input type="text" required value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Email</label>
              <input type="email" required value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})} className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Password</label>
              <input type="password" required value={newMember.password} onChange={(e) => setNewMember({...newMember, password: e.target.value})} className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors">Add Member</button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default ManageUsers
