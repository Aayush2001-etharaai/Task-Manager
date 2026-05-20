import React from "react"

const AuthLayout = ({ children }) => {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-slate-900 text-slate-100">
      {/* Fullscreen background image representing company task management */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop"
          alt="Company tasks background"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Centered form container */}
      <div className="relative z-20 w-full max-w-md px-6">
        <div className="flex flex-col items-center justify-center w-full">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
