import express from "express"
import { verifyToken } from "../utils/verifyUser.js"
import {
  createTask,
  deleteTask,
  getDashboardData,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskChecklist,
  updateTaskStatus,
  userDashboardData,
} from "../controller/task.controller.js"

const router = express.Router()

router.post("/create", verifyToken, createTask)
router.get("/", verifyToken, getTasks)
router.get("/dashboard-data", verifyToken, getDashboardData)
router.get("/user-dashboard-data", verifyToken, userDashboardData)
router.get("/:id", verifyToken, getTaskById)
router.put("/:id", verifyToken, updateTask)
router.delete("/:id", verifyToken, deleteTask)
router.put("/:id/status", verifyToken, updateTaskStatus)
router.put("/:id/todo", verifyToken, updateTaskChecklist)

export default router
