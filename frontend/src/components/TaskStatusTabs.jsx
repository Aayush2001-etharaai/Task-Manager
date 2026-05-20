import React from "react"

const TaskStatusTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="my-2 bg-slate-800/50 p-1 rounded-xl inline-flex backdrop-blur-sm border border-slate-700/50">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
              activeTab === tab.label
                ? "bg-slate-700 text-white shadow-md shadow-slate-900/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
            } cursor-pointer`}
            onClick={() => setActiveTab(tab.label)}
            type="button"
          >
            <div className="flex items-center gap-2">
              <span className="text-[15px]">{tab.label}</span>

              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === tab.label
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default TaskStatusTabs
