import React from "react"
import { Outlet, Navigate } from "react-router-dom"
import { useSelector } from "react-redux"

const PrivateRoute = ({ allowedRoles }) => {
  const { currentUser } = useSelector((state) => state.user)

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  const role =
    currentUser.role === "user" ? "member" : currentUser.role

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <Navigate
        to={role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
        replace
      />
    )
  }

  return <Outlet />
}

export default PrivateRoute
