import express from "express"
import { verifyToken } from "../utils/verifyUser.js"
import {
  addProjectMember,
  createProject,
  getMyProjects,
  getProjectById,
  removeProjectMember,
} from "../controller/project.controller.js"

const router = express.Router()

router.post("/", verifyToken, createProject)
router.get("/", verifyToken, getMyProjects)
router.get("/:id", verifyToken, getProjectById)
router.post("/:id/members", verifyToken, addProjectMember)
router.delete("/:id/members/:userId", verifyToken, removeProjectMember)

export default router
