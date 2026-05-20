import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axiosInstance from "../../utils/axioInstance"
import DashboardLayout from "../../components/DashboardLayout"
import moment from "moment"
import AvatarGroup from "../../components/AvatarGroup"
import { FaExternalLinkAlt, FaUpload } from "react-icons/fa"
import toast from "react-hot-toast"

const TaskDetails = () => {
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [submissionNote, setSubmissionNote] = useState("")

  useEffect(() => {
    if (task?.submissionNote) {
      setSubmissionNote(task.submissionNote)
    }
  }, [task?.submissionNote])

  const getStatusTagColor = (status) => {
    switch (status) {
      case "In Progress":
        return "text-blue-300 bg-blue-900/40 border border-blue-800/50"

      case "Done":
        return "text-green-300 bg-green-900/40 border border-green-800/50"

      default:
        return "text-yellow-300 bg-yellow-900/40 border border-yellow-800/50"
    }
  }

  const getTaskDetailsById = async () => {
    try {
      const response = await axiosInstance.get(`/tasks/${id}`)

      if (response.data) {
        const taskInfo = response.data

        setTask(taskInfo)
      }
    } catch (error) {
      console.log("Error fetching task details: ", error)
    }
  }

  const updateTodoChecklist = async (index) => {
    const todoChecklist = [...task?.todoChecklist]
    const taskId = id

    if (todoChecklist && todoChecklist[index]) {
      todoChecklist[index].completed = !todoChecklist[index].completed

      try {
        const response = await axiosInstance.put(`/tasks/${id}/todo`, {
          todoChecklist,
        })

        if (response.status === 200) {
          setTask(response.data?.task || task)
        } else {
          todoChecklist[index].completed = !todoChecklist[index].completed
        }
      } catch (error) {
        todoChecklist[index].completed = !todoChecklist[index].completed
      }
    }
  }

  const markTaskCompleted = async () => {
    try {
      const response = await axiosInstance.put(`/tasks/${id}/status`, {
        status: "Done",
      })

      if (response.status === 200) {
        setTask(response.data?.task || task)
        toast.success("Task marked as completed!")
      }
    } catch (error) {
      console.log("Error updating task status: ", error)
      toast.error("Failed to mark task as completed")
    }
  }

  const handleSaveNote = async () => {
    try {
      const response = await axiosInstance.put(`/tasks/${id}`, {
        submissionNote
      })
      if (response.status === 200) {
        toast.success("Submission note saved successfully!")
      }
    } catch (error) {
      console.log("Error saving note: ", error)
      toast.error("Failed to save note")
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const toastId = toast.loading("Uploading file...")
      const formData = new FormData()
      formData.append("image", file)

      const response = await axiosInstance.post("/auth/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data && response.data.imageUrl) {
        const newAttachments = [...(task?.attachments || []), response.data.imageUrl]
        
        const updateRes = await axiosInstance.put(`/tasks/${id}`, {
          attachments: newAttachments,
        })
        
        if (updateRes.data) {
          setTask(updateRes.data.updatedTask || { ...task, attachments: newAttachments })
          toast.success("File attached successfully!", { id: toastId })
        }
      }
    } catch (error) {
      console.log("Error uploading file: ", error)
      toast.error("Failed to upload file")
    }
  }

  const handleLinkClick = (link) => {
    if (link.startsWith("http://") || link.startsWith("https://")) {
      window.open(link, "_blank")
    } else {
      window.open("https://" + link, "_blank")
    }
  }

  useEffect(() => {
    if (id) {
      getTaskDetailsById()
    }
  }, [id])

  return (
    <DashboardLayout activeMenu={"My Tasks"}>
      <div className="mt-5 px-4 sm:px-6 lg:px-8">
        {task && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4 pb-10">
            <div className="md:col-span-3 space-y-6">
              <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 transition-all">
                <div className="flex flex-col space-y-3">
                  <h2 className="text-xl font-bold text-white tracking-wide">
                    {task?.title}
                  </h2>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusTagColor(
                          task?.status
                        )}`}
                      >
                        {task?.status}

                        <span className="ml-1.5 w-2 h-2 rounded-full bg-current opacity-80"></span>
                      </div>
                    </div>

                    {task?.status !== "Done" && (
                      <button
                        onClick={markTaskCompleted}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded shadow-sm transition-colors"
                      >
                        Submit & Mark Done
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <InfoBox label="Description" value={task?.description} />
                </div>

                <div className="grid grid-cols-12 gap-4 mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="col-span-6 md:col-span-4">
                    <InfoBox label={"Priority"} value={task?.priority} />
                  </div>

                  <div className="col-span-6 md:col-span-4">
                    <InfoBox
                      label={"Due Date"}
                      value={
                        task?.dueDate
                          ? moment(task?.dueDate).format("Do MMM YYYY")
                          : "N/A"
                      }
                    />
                  </div>

                  <div className="col-span-6 md:col-span-4">
                    <label className="text-xs font-medium text-slate-400">
                      Assigned To
                    </label>

                    <div className="mt-1">
                      <AvatarGroup
                        avatars={
                          task?.assignedTo?.map(
                            (item) => item?.profileImageUrl
                          ) || []
                        }
                        maxVisible={5}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-sm font-semibold text-slate-300">
                    Todo Checklist
                  </label>

                  <div className="mt-2 space-y-2">
                    {task?.todoChecklist?.map((item, index) => (
                      <TodoCheckList
                        key={`todo_${index}`}
                        text={item.text}
                        isChecked={item?.completed}
                        onChange={() => updateTodoChecklist(index)}
                      />
                    ))}
                  </div>
                </div>

                {task?.attachments?.length > 0 && (
                  <div className="mt-6">
                    <label className="text-sm font-semibold text-slate-300">
                      Attachments
                    </label>

                    <div className="mt-2 space-y-2">
                      {task?.attachments?.map((link, index) => (
                        <Attachment
                          key={`link_${index}`}
                          link={link}
                          index={index}
                          onClick={() => handleLinkClick(link)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Work Section */}
                <div className="mt-8 pt-6 border-t border-slate-700/80">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/80 shadow-[0_0_15px_rgba(59,130,246,0.1)] overflow-hidden">
                    <div className="bg-slate-800/50 border-b border-slate-700/80 px-5 py-4">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                        Submit Completed Work
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 ml-4">
                        Add a description of your work and attach any final files here.
                      </p>
                    </div>

                    <div className="p-5 space-y-5">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">
                          Submission Note
                        </label>
                        <textarea
                          rows={4}
                          value={submissionNote}
                          onChange={(e) => setSubmissionNote(e.target.value)}
                          onBlur={handleSaveNote}
                          placeholder="Describe what you completed, any challenges faced, or important links..."
                          className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y"
                        ></textarea>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">
                          Upload Files
                        </label>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800/40 hover:bg-slate-700/50 hover:border-blue-500/50 transition-all group">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="p-3 bg-slate-700/50 rounded-full group-hover:scale-110 transition-transform duration-300 mb-3">
                              <FaUpload className="w-5 h-5 text-blue-400" />
                            </div>
                            <p className="mb-1 text-sm text-slate-300">
                              <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-500">
                              Any files, images, or documents
                            </p>
                          </div>
                          <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default TaskDetails

const InfoBox = ({ label, value }) => {
  return (
    <>
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>

      <p className="text-[13px] md:text-sm font-medium text-slate-200 mt-1">
        {value}
      </p>
    </>
  )
}

const TodoCheckList = ({ text, isChecked, onChange }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        className="w-4 h-4 text-blue-500 bg-slate-800 border-slate-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
      />

      <p className={`text-sm ${isChecked ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{text}</p>
    </div>
  )
}

const Attachment = ({ link, index, onClick }) => {
  return (
    <div
      className="flex justify-between items-center bg-slate-700/30 hover:bg-slate-700/50 border border-slate-700/50 px-4 py-3 rounded-lg cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex flex-1 items-center gap-3 overflow-hidden">
        <span className="text-xs text-slate-500 font-bold bg-slate-800 px-2 py-1 rounded flex-shrink-0">
          {index < 9 ? `0${index + 1}` : index + 1}
        </span>

        <p className="text-xs text-blue-400 hover:text-blue-300 truncate">{link}</p>
      </div>

      <FaExternalLinkAlt className="text-slate-400 text-sm flex-shrink-0 ml-4" />
    </div>
  )
}
