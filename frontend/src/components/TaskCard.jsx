import React, { useState } from "react"
import Progress from "./Progress"
import moment from "moment"
import AvatarGroup from "./AvatarGroup"
import { FaFileLines } from "react-icons/fa6"
import { MdMoreVert, MdEdit } from "react-icons/md"

const TaskCard = ({
  title,
  description,
  priority,
  status,
  progress,
  createdAt,
  dueDate,
  assignedTo,
  attachmentCount,
  completedTodoCount,
  todoChecklist,
  onClick,
}) => {
  const [showMenu, setShowMenu] = useState(false)

  const getStatusTagColor = () => {
    switch (status) {
      case "To Do":
        return "bg-yellow-900/40 text-yellow-300"
      case "In Progress":
        return "bg-blue-900/40 text-blue-300"
      case "Done":
        return "bg-green-900/40 text-green-300"
      default:
        return "bg-yellow-900/40 text-yellow-300"
    }
  }

  const getPriorityTagColor = () => {
    switch (priority) {
      case "High":
        return "bg-red-900/40 text-red-300"
      case "Medium":
        return "bg-yellow-900/40 text-yellow-300"
      case "Low":
        return "bg-green-900/40 text-green-300"
      default:
        return "bg-green-900/40 text-green-300"
    }
  }

  return (
    <div 
      className="bg-slate-800 rounded-xl py-4 shadow-md shadow-slate-900/50 border border-slate-700 relative cursor-pointer hover:bg-slate-700/60 hover:shadow-lg transition-all duration-300"
      onClick={onClick}
    >
      <div className="flex justify-between items-start px-4">
        <div className="flex items-end gap-3">
          <div className={`text-[11px] font-medium ${getStatusTagColor()} px-4 py-0.5 rounded-lg`}>
            {status}
          </div>

          <div className={`text-[11px] font-medium ${getPriorityTagColor()} px-4 py-0.5 rounded-lg`}>
            {priority} Priority
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }} 
            className="text-slate-400 hover:text-slate-200 p-1 rounded-full hover:bg-slate-700 transition-colors"
          >
            <MdMoreVert className="text-xl" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-slate-800 rounded-md shadow-xl z-20 border border-slate-700 overflow-hidden">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); onClick(); }} 
                className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <MdEdit /> Edit Task
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={`px-4 border-l-[3px] mt-2 ${
          status === "In Progress"
            ? "border-cyan-500"
            : status === "Done"
            ? "border-indigo-500"
            : "border-violet-500"
        }`}
      >
        <p className="text-lg font-medium text-white mt-3 line-clamp-2">
          {title}
        </p>

        <p className="text-sm text-slate-400 mt-1.5 line-clamp-2 leading-[18px]">
          {description}
        </p>

        <p className="text-[13px] text-slate-300 font-medium mt-3 mb-2 leading-[18px]">
          Task Done:{" "}
          <span className="font-semibold text-slate-200">
            {completedTodoCount} / {todoChecklist.length || 0}
          </span>
        </p>

        <Progress progress={progress} status={status} />
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between my-2">
          <div>
            <label className="text-xs text-slate-500">Start Date</label>
            <p className="text-[13px] font-medium text-slate-300">
              {moment(createdAt).format("Do MMM YYYY")}
            </p>
          </div>

          <div>
            <label className="text-xs text-slate-500">Due Date</label>
            <p className="text-[13px] font-medium text-slate-300">
              {moment(dueDate).format("Do MMM YYYY")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <AvatarGroup avatars={assignedTo || []} />

          {attachmentCount > 0 && (
            <div className="flex items-center gap-2 bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-600">
              <FaFileLines className="text-blue-400" />
              <span className="text-xs text-slate-200">{attachmentCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskCard
