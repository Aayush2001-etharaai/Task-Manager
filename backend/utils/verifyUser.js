import { errorHandler } from "./error.js"
import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token

  if (!token) return next(errorHandler(401, "Unauthorized"))

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(errorHandler(401, "Unauthorized"))
    req.user = user
    next()
  })
}

// Use AFTER verifyToken — no duplicate jwt.verify
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next()
  return next(errorHandler(403, "Access denied — admin only"))
}

export const memberOnly = (req, res, next) => {
  if (req.user && (req.user.role === "member" || req.user.role === "admin"))
    return next()
  return next(errorHandler(403, "Access denied"))
}
