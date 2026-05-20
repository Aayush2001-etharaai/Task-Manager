import Task from "../models/task.model.js"
import User from "../models/user.model.js"
import Project from "../models/project.model.js"
import { errorHandler } from "../utils/error.js"

export const getUsers = async (req, res, next) => {
  try {
    const projectId = req.query.projectId
      ? Number(req.query.projectId)
      : null

    let users

    if (projectId) {
      const canAccess =
        req.user.role === "admin" ||
        (await Project.isProjectAdmin(projectId, req.user.id))

      if (!canAccess) {
        return next(errorHandler(403, "Only project admin can view members"))
      }

      const members = await Project.getMembers(projectId)
      users = await Promise.all(
        members.map(async (m) => {
          const full = await User.findById(m._id)
          return full
        })
      )
    } else {
      users = await User.find({ role: "member" })
    }

    const userWithTaskCounts = await Promise.all(
      users.map(async (user) => {
        if (!user) return null
        const { password, ...rest } = user

        const countOpts = {
          userId: user._id,
          isAdmin: false,
          projectId,
        }

        const todoTasks = await Task.countDocuments(
          { status: "To Do" },
          countOpts
        )
        const inProgressTasks = await Task.countDocuments(
          { status: "In Progress" },
          countOpts
        )
        const doneTasks = await Task.countDocuments(
          { status: "Done" },
          countOpts
        )

        return {
          ...rest,
          pendingTasks: todoTasks,
          inProgressTasks,
          completedTasks: doneTasks,
        }
      })
    )

    res.status(200).json(userWithTaskCounts.filter(Boolean))
  } catch (error) {
    next(error)
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByIdPublic(req.params.id)
    if (!user) return next(errorHandler(404, "User not found!"))
    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

export const removeUser = async (req, res, next) => {
  try {
    const targetId = Number(req.params.id)

    if (targetId === req.user.id) {
      return next(errorHandler(400, "You cannot remove your own account"))
    }

    const target = await User.findById(targetId)
    if (!target) return next(errorHandler(404, "User not found"))

    const platformAdmin = req.user.role === "admin"
    const projectId = req.query.projectId
      ? Number(req.query.projectId)
      : null

    if (projectId) {
      const canManage =
        platformAdmin ||
        (await Project.isProjectAdmin(projectId, req.user.id))

      if (!canManage) {
        return next(errorHandler(403, "Only project admin can remove members"))
      }

      await Project.removeMember(projectId, targetId)
      return res.status(200).json({ message: "Member removed from project" })
    }

    if (!platformAdmin) {
      return next(errorHandler(403, "Only admin can remove users"))
    }

    await User.deleteById(targetId)
    res.status(200).json({ message: "User removed successfully" })
  } catch (error) {
    if (error.message === "Cannot remove project creator") {
      return next(errorHandler(400, error.message))
    }
    next(error)
  }
}
