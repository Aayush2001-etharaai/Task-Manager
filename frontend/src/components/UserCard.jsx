import React from "react"

const UserCard = ({ userInfo, onRemove }) => {
  return (
    <div className="p-4 bg-slate-800 rounded-xl shadow-lg shadow-slate-900/50 border border-slate-700 transition-all hover:border-slate-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={userInfo?.profileImageUrl}
            alt={userInfo?.name}
            className="h-14 w-14 rounded-full object-cover border-2 border-slate-600 shadow-sm"
          />

          <div className="">
            <p className="text-lg font-semibold text-white tracking-wide">{userInfo?.name}</p>

            <p className="text-sm text-slate-400 font-medium">{userInfo?.email}</p>
          </div>
        </div>

        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(userInfo._id)}
            className="text-sm text-red-400 hover:text-red-300 cursor-pointer"
          >
            Remove
          </button>
        )}
      </div>

      <div className="flex items-end gap-2 mt-5">
        <StatCard
          label="Pending"
          count={userInfo?.pendingTasks || 0}
          status="pending"
        />

        <StatCard
          label="In Progress"
          count={userInfo?.inProgressTasks || 0}
          status="in-progress"
        />

        <StatCard
          label="Done"
          count={userInfo?.completedTasks || 0}
          status="completed"
        />
      </div>
    </div>
  )
}

export default UserCard

const StatCard = ({ label, count, status }) => {
  const getStatusTagColor = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50"

      case "in-progress":
        return "bg-blue-900/30 text-blue-400 border border-blue-800/50"

      case "completed":
        return "bg-green-900/30 text-green-400 border border-green-800/50"

      default:
        return "bg-slate-800 text-slate-400 border border-slate-700"
    }
  }

  return (
    <div
      className={`flex flex-1 flex-col text-[10px] font-medium ${getStatusTagColor()} px-2 py-1.5 rounded-lg items-center justify-center`}
    >
      <span className="text-base font-bold mb-0.5">{count}</span>
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </div>
  )
}
