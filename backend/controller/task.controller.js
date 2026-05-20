import Task from "../models/task.model.js"
import Project from "../models/project.model.js"
import { errorHandler } from "../utils/error.js"

const TASK_STATUSES = ["To Do", "In Progress", "Done"]
const isPlatformAdmin = (user) => user.role === "admin"

const reduceDistribution = (raw, keys, totalKey = null, total = 0) => {
  const result = keys.reduce((acc, key) => {
    const formattedKey = key.replace(/\s+/g, "")
    acc[formattedKey] =
      Number(raw.find((item) => item._id === key)?.count) || 0
    return acc
  }, {})

  if (totalKey) result[totalKey] = total
  return result
}

async function getScope(req) {
  const projectId = req.query.projectId ? Number(req.query.projectId) : null
  const platformAdmin = isPlatformAdmin(req.user)

  if (projectId) {
    const canAccess =
      platformAdmin || (await Project.isMember(projectId, req.user.id))
    if (!canAccess) return { error: errorHandler(403, "Access denied to this project") }
  }

  const projectIds = projectId
    ? [projectId]
    : await Project.getAccessibleProjectIds(req.user.id, platformAdmin)

  return {
    projectId,
    projectIds,
    platformAdmin,
    memberMode: !platformAdmin,
  }
}

async function canManageProject(projectId, userId, platformAdmin) {
  if (platformAdmin) return true
  return Project.isProjectAdmin(projectId, userId)
}

export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
      projectId,
    } = req.body

    if (!projectId) {
      return next(errorHandler(400, "projectId is required"))
    }

    if (!Array.isArray(assignedTo)) {
      return next(errorHandler(400, "assignedTo must be an array of user IDs"))
    }

    const platformAdmin = isPlatformAdmin(req.user)
    const allowed = await canManageProject(projectId, req.user.id, platformAdmin)

    if (!allowed) {
      return next(errorHandler(403, "Only project admin can create tasks"))
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
      createdBy: req.user.id,
      projectId,
    })

    res.status(201).json({ message: "Task created successfully", task })
  } catch (error) {
    next(error)
  }
}

export const getTasks = async (req, res, next) => {
  try {
    const { status } = req.query
    const scope = await getScope(req)
    if (scope.error) return next(scope.error)

    const filter = status ? { status } : {}
    const isAdmin = scope.platformAdmin

    const tasks = await Task.find(filter, {
      userId: req.user.id,
      isAdmin: isAdmin || !scope.memberMode,
      projectId: scope.projectId,
      projectIds: scope.projectIds,
      populate: true,
    })

    const tasksWithCount = tasks.map((task) => {
      const completedCount = task.todoChecklist.filter((item) => item.completed).length
      return { ...task, completedCount }
    })

    const countOptions = {
      userId: req.user.id,
      isAdmin: isAdmin || !scope.memberMode,
      projectId: scope.projectId,
      projectIds: scope.projectIds,
    }

    const allTasks = await Task.countDocuments({}, countOptions)
    const todoTasks = await Task.countDocuments(
      { ...filter, status: "To Do" },
      countOptions
    )
    const inProgressTasks = await Task.countDocuments(
      { ...filter, status: "In Progress" },
      countOptions
    )
    const doneTasks = await Task.countDocuments(
      { ...filter, status: "Done" },
      countOptions
    )

    res.status(200).json({
      tasks: tasksWithCount,
      statusSummary: {
        all: allTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id, true)
    if (!task) return next(errorHandler(404, "Task not found!"))

    const platformAdmin = isPlatformAdmin(req.user)
    const isMember = await Project.isMember(task.projectId, req.user.id)
    const isAssigned = await Task.isUserAssigned(task._id, req.user.id)

    if (!platformAdmin && !isMember) {
      return next(errorHandler(403, "Access denied"))
    }

    if (!platformAdmin && !isAssigned && req.user.role === "member") {
      const isProjAdmin = await Project.isProjectAdmin(task.projectId, req.user.id)
      if (!isProjAdmin) {
        return next(errorHandler(403, "Access denied"))
      }
    }

    res.status(200).json(task)
  } catch (error) {
    next(error)
  }
}

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return next(errorHandler(404, "Task not found!"))

    const platformAdmin = isPlatformAdmin(req.user)
    const allowed = await canManageProject(task.projectId, req.user.id, platformAdmin)

    if (!allowed) {
      return next(errorHandler(403, "Only project admin can update tasks"))
    }

    if (req.body.assignedTo && !Array.isArray(req.body.assignedTo)) {
      return next(errorHandler(400, "assignedTo must be an array of user IDs"))
    }

    const updatedTask = await Task.updateById(req.params.id, {
      title: req.body.title ?? task.title,
      description: req.body.description ?? task.description,
      priority: req.body.priority ?? task.priority,
      dueDate: req.body.dueDate ?? task.dueDate,
      todoChecklist: req.body.todoChecklist ?? task.todoChecklist,
      attachments: req.body.attachments ?? task.attachments,
      assignedTo: req.body.assignedTo ?? undefined,
    })

    return res
      .status(200)
      .json({ updatedTask, message: "Task updated successfully!" })
  } catch (error) {
    next(error)
  }
}

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return next(errorHandler(404, "Task not found!"))

    const platformAdmin = isPlatformAdmin(req.user)
    const allowed = await canManageProject(task.projectId, req.user.id, platformAdmin)

    if (!allowed) {
      return next(errorHandler(403, "Only project admin can delete tasks"))
    }

    await Task.deleteById(req.params.id)
    res.status(200).json({ message: "Task deleted successfully!" })
  } catch (error) {
    next(error)
  }
}

export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return next(errorHandler(404, "Task not found!"))

    const isAssigned = await Task.isUserAssigned(req.params.id, req.user.id)
    const platformAdmin = isPlatformAdmin(req.user)
    const projAdmin = await Project.isProjectAdmin(task.projectId, req.user.id)

    if (!isAssigned && !platformAdmin && !projAdmin) {
      return next(errorHandler(403, "Unauthorized"))
    }

    const status = req.body.status || task.status
    let todoChecklist = task.todoChecklist

    if (status === "Done") {
      todoChecklist = todoChecklist.map((item) => ({ ...item, completed: true }))
    }

    const updatedTask = await Task.updateById(req.params.id, {
      status,
      todoChecklist,
    })

    res.status(200).json({ message: "Task status updated", task: updatedTask })
  } catch (error) {
    next(error)
  }
}

export const updateTaskChecklist = async (req, res, next) => {
  try {
    const { todoChecklist } = req.body
    const task = await Task.findById(req.params.id)
    if (!task) return next(errorHandler(404, "Task not found!"))

    const isAssigned = await Task.isUserAssigned(req.params.id, req.user.id)
    const platformAdmin = isPlatformAdmin(req.user)
    const projAdmin = await Project.isProjectAdmin(task.projectId, req.user.id)

    if (!isAssigned && !platformAdmin && !projAdmin) {
      return next(errorHandler(403, "Not authorized to update checklist"))
    }

    const completedCount = todoChecklist.filter((item) => item.completed).length
    const totalItems = todoChecklist.length
    const progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

    let status = "To Do"
    if (progress === 100) status = "Done"
    else if (progress > 0) status = "In Progress"

    const updatedTask = await Task.updateById(req.params.id, {
      todoChecklist,
      progress,
      status,
    })

    res
      .status(200)
      .json({ message: "Task checklist updated", task: updatedTask })
  } catch (error) {
    next(error)
  }
}

export const getDashboardData = async (req, res, next) => {
  try {
    const scope = await getScope(req)
    if (scope.error) return next(scope.error)

    const options = {
      projectId: scope.projectId,
      projectIds: scope.projectIds,
      isAdmin: true,
    }

    const totalTasks = await Task.countDocuments({}, options)
    const todoTasks = await Task.countDocuments({ status: "To Do" }, options)
    const doneTasks = await Task.countDocuments({ status: "Done" }, options)
    const overdueTasks = await Task.countDocuments(
      { statusNe: "Done", dueDateLt: new Date() },
      options
    )

    const taskDistributionRaw = await Task.groupByField("status", options)
    const taskDistribution = reduceDistribution(
      taskDistributionRaw,
      TASK_STATUSES,
      "All",
      totalTasks
    )

    const taskPriorities = ["Low", "Medium", "High"]
    const taskPriorityLevelRaw = await Task.groupByField("priority", options)
    const taskPriorityLevel = reduceDistribution(
      taskPriorityLevelRaw,
      taskPriorities
    )

    const recentTasks = await Task.findRecent(10, options)
    const tasksPerUser = await Task.getTasksPerUser(scope.projectIds)

    res.status(200).json({
      statistics: {
        totalTasks,
        todoTasks,
        inProgressTasks: taskDistribution.InProgress,
        doneTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevel,
      },
      recentTasks,
      tasksPerUser,
    })
  } catch (error) {
    next(error)
  }
}

export const userDashboardData = async (req, res, next) => {
  try {
    const scope = await getScope(req)
    if (scope.error) return next(scope.error)

    const options = {
      userId: req.user.id,
      isAdmin: false,
      projectId: scope.projectId,
      projectIds: scope.projectIds,
    }

    const totalTasks = await Task.countDocuments({}, options)
    const todoTasks = await Task.countDocuments({ status: "To Do" }, options)
    const doneTasks = await Task.countDocuments({ status: "Done" }, options)
    const overdueTasks = await Task.countDocuments(
      { statusNe: "Done", dueDateLt: new Date() },
      options
    )

    const taskDistributionRaw = await Task.groupByField("status", options)
    const taskDistribution = reduceDistribution(
      taskDistributionRaw,
      TASK_STATUSES,
      "All",
      totalTasks
    )

    const taskPriorities = ["Low", "Medium", "High"]
    const taskPriorityLevelRaw = await Task.groupByField("priority", options)
    const taskPriorityLevel = reduceDistribution(
      taskPriorityLevelRaw,
      taskPriorities
    )

    const recentTasks = await Task.findRecent(10, options)

    res.status(200).json({
      statistics: {
        totalTasks,
        todoTasks,
        inProgressTasks: taskDistribution.InProgress,
        doneTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevel,
      },
      recentTasks,
    })
  } catch (error) {
    next(error)
  }
}
