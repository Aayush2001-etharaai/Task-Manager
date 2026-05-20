import React from "react"

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 p-3 shadow-xl rounded-lg border border-slate-600">
        <p className="text-xs font-semibold text-blue-400 mb-1">
          {payload[0].name}
        </p>

        <p className="text-sm text-slate-300">
          Count:{" "}
          <span className="text-sm font-medium text-white">
            {payload[0].value}
          </span>
        </p>
      </div>
    )
  }

  return null
}

export default CustomTooltip
