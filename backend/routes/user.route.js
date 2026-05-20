import express from "express"
import { adminOnly, verifyToken } from "../utils/verifyUser.js"
import { getUserById, getUsers, removeUser } from "../controller/user.controller.js"

const router = express.Router()

router.get("/get-users", verifyToken, getUsers)
router.delete("/:id", verifyToken, removeUser)
router.get("/:id", verifyToken, getUserById)

export default router
