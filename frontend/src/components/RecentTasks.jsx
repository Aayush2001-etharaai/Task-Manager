import moment from "moment"
import React from "react"
import { useNavigate } from "react-router-dom"

const RecentTasks = ({ tasks }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Recent Tasks</h3>

        <button
          onClick={() => navigate("/admin/tasks")}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg"
        >
          See More →
        </button>
      </div>

      <div className="p-6">
        {tasks?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Task Name
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Priority
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Created On
                  </th>
                </tr>
              </thead>

              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {task.title}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                          task.status === "Done"
                            ? "bg-green-900/40 text-green-300 border-green-800/50"
                            : task.status === "To Do"
                            ? "bg-yellow-900/40 text-yellow-300 border-yellow-800/50"
                            : "bg-blue-900/40 text-blue-300 border-blue-800/50"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                          task.priority === "High"
                            ? "bg-red-900/40 text-red-300 border-red-800/50"
                            : task.priority === "Medium"
                            ? "bg-yellow-900/40 text-yellow-300 border-yellow-800/50"
                            : "bg-green-900/40 text-green-300 border-green-800/50"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {moment(task.createdAt).format("MMM Do, YYYY")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">
            No recent tasks found
          </p>
        )}
      </div>
    </div>
  )
}

export default RecentTasks
