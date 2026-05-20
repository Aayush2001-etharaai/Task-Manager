import React, { useEffect, useState } from "react"
import axiosInstance from "../utils/axioInstance"
import { useDispatch, useSelector } from "react-redux"
import { signOutSuccess } from "../redux/slice/userSlice"
import { useNavigate } from "react-router-dom"
import { SIDE_MENU_DATA, USER_SIDE_MENU_DATA } from "../utils/data"
import { MdEdit } from "react-icons/md"
import toast from "react-hot-toast"
import { signInSuccess } from "../redux/slice/userSlice"

const SideMenu = ({ activeMenu }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [SideMenuData, setSideMenuData] = useState([])
  const { currentUser } = useSelector((state) => state.user)

  const handleClick = (route) => {
    console.log(route)

    if (route === "logout") {
      handleLogut()
      return
    }

    navigate(route)
  }

  const handleLogut = async () => {
    try {
      const response = await axiosInstance.post("/auth/sign-out")

      if (response.data) {
        dispatch(signOutSuccess())

        navigate("/login")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (currentUser) {
      const role =
        currentUser?.role === "user" ? "member" : currentUser?.role
      setSideMenuData(role === "admin" ? SIDE_MENU_DATA : USER_SIDE_MENU_DATA)
    }

    return () => {}
  }, [currentUser])

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const toastId = toast.loading("Updating profile image...")
      const formData = new FormData()
      formData.append("image", file)

      const uploadRes = await axiosInstance.post("/auth/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      if (uploadRes.data?.imageUrl) {
        const updateRes = await axiosInstance.put("/auth/update-profile", {
          profileImageUrl: uploadRes.data.imageUrl
        })
        
        if (updateRes.status === 200) {
          dispatch(signInSuccess(updateRes.data))
          toast.success("Profile image updated!", { id: toastId })
        }
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to update profile image")
    }
  }

  return (
    <div className="w-64 p-6 h-full flex flex-col lg:border-r lg:border-slate-700 bg-slate-800">
      <div className="flex flex-col items-center mb-8 relative">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-slate-700 overflow-hidden mb-4 border-2 border-slate-600">
            <img
              src={currentUser?.profileImageUrl || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=200&auto=format&fit=crop"}
              alt="Profile Image"
              className="w-full h-full object-cover"
            />
          </div>
          
          <label className="absolute bottom-4 right-0 bg-blue-600 p-1.5 rounded-full cursor-pointer hover:bg-blue-500 transition-colors shadow-md group-hover:scale-110">
            <MdEdit className="text-white text-xs" />
            <input type="file" className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
          </label>
        </div>

        {currentUser?.role === "admin" ? (
          <div className="bg-blue-900/40 text-blue-300 border border-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
            Admin
          </div>
        ) : (
          <div className="bg-slate-700 text-slate-300 border border-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
            Member
          </div>
        )}

        <h5 className="text-lg font-semibold text-white">
          {currentUser?.name || ""}
        </h5>

        <p className="text-sm text-slate-400">{currentUser?.email || ""}</p>
      </div>

      <div className="flex-1 overscroll-y-auto">
        {SideMenuData.map((item, index) => (
          <button
            key={`menu_${index}`}
            className={`w-full flex items-center gap-4 text-[15px] ${
              activeMenu === item.label
                ? "text-blue-400 bg-slate-700/80 rounded-lg shadow-sm"
                : "text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors"
            } py-3 px-6 mb-3 cursor-pointer`}
            onClick={() => handleClick(item.path)}
          >
            <item.icon className="text-2xl" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SideMenu
