import Project from "../models/project.model.js"
import User from "../models/user.model.js"
import { errorHandler } from "../utils/error.js"

const isPlatformAdmin = (user) => user.role === "admin"

export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body

    if (!name?.trim()) {
      return next(errorHandler(400, "Project name is required"))
    }

    const project = await Project.create({
      name: name.trim(),
      description,
      createdBy: req.user.id,
    })

    res.status(201).json({ message: "Project created", project })
  } catch (error) {
    next(error)
  }
}

export const getMyProjects = async (req, res, next) => {
  try {
    const projects = await Project.findForUser(
      req.user.id,
      isPlatformAdmin(req.user)
    )
    res.status(200).json(projects)
  } catch (error) {
    next(error)
  }
}

export const getProjectById = async (req, res, next) => {
  try {
    const projectId = req.params.id
    const canAccess =
      isPlatformAdmin(req.user) ||
      (await Project.isMember(projectId, req.user.id))

    if (!canAccess) {
      return next(errorHandler(403, "You are not a member of this project"))
    }

    const project = await Project.findById(projectId, req.user.id)
    if (!project) return next(errorHandler(404, "Project not found"))

    res.status(200).json(project)
  } catch (error) {
    next(error)
  }
}

export const addProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id
    const { email, userId } = req.body

    const canManage =
      isPlatformAdmin(req.user) ||
      (await Project.isProjectAdmin(projectId, req.user.id))

    if (!canManage) {
      return next(errorHandler(403, "Only project admin can add members"))
    }

    let member
    if (userId) {
      member = await User.findById(userId)
    } else if (email) {
      member = await User.findOne({ email })
    } else {
      return next(errorHandler(400, "Email or userId is required"))
    }

    if (!member) return next(errorHandler(404, "User not found"))

    await Project.addMember(projectId, member._id, "member")

    const project = await Project.findById(projectId)
    res.status(200).json({ message: "Member added", project })
  } catch (error) {
    next(error)
  }
}

export const removeProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id
    const memberId = req.params.userId

    const canManage =
      isPlatformAdmin(req.user) ||
      (await Project.isProjectAdmin(projectId, req.user.id))

    if (!canManage) {
      return next(errorHandler(403, "Only project admin can remove members"))
    }

    await Project.removeMember(projectId, memberId)

    const project = await Project.findById(projectId)
    res.status(200).json({ message: "Member removed", project })
  } catch (error) {
    if (error.message === "Cannot remove project creator") {
      return next(errorHandler(400, error.message))
    }
    next(error)
  }
}
