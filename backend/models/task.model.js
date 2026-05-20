import pool from "../config/database.js"
import { formatTask, parseJsonField } from "../utils/format.js"

async function getAssigneeIds(taskId) {
  const [rows] = await pool.query(
    "SELECT user_id FROM task_assignees WHERE task_id = ?",
    [taskId]
  )
  return rows.map((r) => r.user_id)
}

async function getPopulatedAssignees(taskId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.profileImageUrl
     FROM users u
     INNER JOIN task_assignees ta ON u.id = ta.user_id
     WHERE ta.task_id = ?`,
    [taskId]
  )
  return rows.map((u) => ({
    _id: u.id,
    name: u.name,
    email: u.email,
    profileImageUrl: u.profileImageUrl || "",
  }))
}

async function setAssignees(taskId, userIds) {
  await pool.query("DELETE FROM task_assignees WHERE task_id = ?", [taskId])
  if (!userIds?.length) return

  const values = userIds.map((uid) => [taskId, uid])
  await pool.query(
    "INSERT INTO task_assignees (task_id, user_id) VALUES ?",
    [values]
  )
}

function buildTaskFilter(filter = {}, options = {}) {
  const { userId = null, isAdmin = true, projectId = null, projectIds = null } =
    options
  const conditions = []
  const params = []

  if (filter.status) {
    conditions.push("t.status = ?")
    params.push(filter.status)
  }

  if (projectId) {
    conditions.push("t.project_id = ?")
    params.push(projectId)
  } else if (projectIds?.length) {
    conditions.push(`t.project_id IN (${projectIds.map(() => "?").join(",")})`)
    params.push(...projectIds)
  }

  if (!isAdmin && userId) {
    conditions.push(
      "EXISTS (SELECT 1 FROM task_assignees ta WHERE ta.task_id = t.id AND ta.user_id = ?)"
    )
    params.push(userId)
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""
  return { where, params }
}

const Task = {
  async create(data) {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
      createdBy,
      projectId,
      status = "To Do",
      progress = 0,
      submissionNote = "",
    } = data

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      const [result] = await connection.query(
        `INSERT INTO tasks
         (project_id, title, description, priority, status, dueDate, createdBy, attachments, todoChecklist, progress, submissionNote)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          projectId,
          title,
          description || "",
          priority || "Low",
          status,
          dueDate,
          createdBy,
          JSON.stringify(attachments || []),
          JSON.stringify(todoChecklist || []),
          progress,
          submissionNote,
        ]
      )

      const taskId = result.insertId

      if (assignedTo?.length) {
        const values = assignedTo.map((uid) => [taskId, uid])
        await connection.query(
          "INSERT INTO task_assignees (task_id, user_id) VALUES ?",
          [values]
        )
      }

      await connection.commit()
      return this.findById(taskId, true)
    } catch (err) {
      await connection.rollback()
      throw err
    } finally {
      connection.release()
    }
  },

  async findById(id, populate = false) {
    const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id])
    if (!rows[0]) return null

    const assignedTo = populate
      ? await getPopulatedAssignees(id)
      : await getAssigneeIds(id)

    return formatTask(rows[0], assignedTo)
  },

  async find(filter = {}, options = {}) {
    const { where, params } = buildTaskFilter(filter, options)

    const [rows] = await pool.query(
      `SELECT DISTINCT t.* FROM tasks t ${where} ORDER BY t.createdAt DESC`,
      params
    )

    const tasks = []
    for (const row of rows) {
      const assignedTo = options.populate !== false
        ? await getPopulatedAssignees(row.id)
        : await getAssigneeIds(row.id)
      tasks.push(formatTask(row, assignedTo))
    }
    return tasks
  },

  async countDocuments(filter = {}, options = {}) {
    const conditions = []
    const params = []

    if (filter.status) {
      conditions.push("t.status = ?")
      params.push(filter.status)
    }

    if (filter.statusNe) {
      conditions.push("t.status != ?")
      params.push(filter.statusNe)
    }

    if (filter.dueDateLt) {
      conditions.push("t.dueDate < ?")
      params.push(filter.dueDateLt)
    }

    if (options.projectId) {
      conditions.push("t.project_id = ?")
      params.push(options.projectId)
    } else if (options.projectIds?.length) {
      conditions.push(
        `t.project_id IN (${options.projectIds.map(() => "?").join(",")})`
      )
      params.push(...options.projectIds)
    }

    if (!options.isAdmin && options.userId) {
      conditions.push(
        "EXISTS (SELECT 1 FROM task_assignees ta WHERE ta.task_id = t.id AND ta.user_id = ?)"
      )
      params.push(options.userId)
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""
    const [rows] = await pool.query(
      `SELECT COUNT(DISTINCT t.id) AS count FROM tasks t ${where}`,
      params
    )
    return Number(rows[0].count)
  },

  async groupByField(field, options = {}) {
    const conditions = []
    const params = []

    if (options.projectId) {
      conditions.push("t.project_id = ?")
      params.push(options.projectId)
    } else if (options.projectIds?.length) {
      conditions.push(
        `t.project_id IN (${options.projectIds.map(() => "?").join(",")})`
      )
      params.push(...options.projectIds)
    }

    if (!options.isAdmin && options.userId) {
      conditions.push(
        "EXISTS (SELECT 1 FROM task_assignees ta WHERE ta.task_id = t.id AND ta.user_id = ?)"
      )
      params.push(options.userId)
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""
    const [rows] = await pool.query(
      `SELECT t.${field} AS _id, COUNT(DISTINCT t.id) AS count
       FROM tasks t ${where}
       GROUP BY t.${field}`,
      params
    )
    return rows
  },

  async findRecent(limit = 10, options = {}) {
    const { where, params } = buildTaskFilter({}, options)

    const [rows] = await pool.query(
      `SELECT DISTINCT t.id, t.title, t.status, t.priority, t.dueDate, t.createdAt
       FROM tasks t ${where}
       ORDER BY t.createdAt DESC
       LIMIT ?`,
      [...params, limit]
    )

    return rows.map((r) => ({
      _id: r.id,
      title: r.title,
      status: r.status,
      priority: r.priority,
      dueDate: r.dueDate,
      createdAt: r.createdAt,
    }))
  },

  async getTasksPerUser(projectIds = null) {
    let sql = `
      SELECT u.id, u.name, u.email,
        COUNT(DISTINCT t.id) AS totalTasks,
        SUM(CASE WHEN t.status = 'To Do' THEN 1 ELSE 0 END) AS todoTasks,
        SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) AS inProgressTasks,
        SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) AS doneTasks
      FROM users u
      INNER JOIN task_assignees ta ON u.id = ta.user_id
      INNER JOIN tasks t ON t.id = ta.task_id
    `
    const params = []

    if (projectIds?.length) {
      sql += ` WHERE t.project_id IN (${projectIds.map(() => "?").join(",")})`
      params.push(...projectIds)
    }

    sql += ` GROUP BY u.id, u.name, u.email ORDER BY totalTasks DESC`

    const [rows] = await pool.query(sql, params)
    return rows.map((r) => ({
      _id: r.id,
      name: r.name,
      email: r.email,
      totalTasks: Number(r.totalTasks),
      todoTasks: Number(r.todoTasks),
      inProgressTasks: Number(r.inProgressTasks),
      doneTasks: Number(r.doneTasks),
    }))
  },

  async updateById(id, fields) {
    const existing = await this.findById(id)
    if (!existing) return null

    const updates = []
    const params = []

    const map = {
      title: fields.title,
      description: fields.description,
      priority: fields.priority,
      status: fields.status,
      dueDate: fields.dueDate,
      progress: fields.progress,
      submissionNote: fields.submissionNote,
    }

    for (const [key, value] of Object.entries(map)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`)
        params.push(value)
      }
    }

    if (fields.attachments !== undefined) {
      updates.push("attachments = ?")
      params.push(JSON.stringify(fields.attachments))
    }

    if (fields.todoChecklist !== undefined) {
      updates.push("todoChecklist = ?")
      params.push(JSON.stringify(fields.todoChecklist))
    }

    if (updates.length) {
      params.push(id)
      await pool.query(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`, params)
    }

    if (fields.assignedTo !== undefined) {
      await setAssignees(id, fields.assignedTo)
    }

    return this.findById(id, true)
  },

  async deleteById(id) {
    await pool.query("DELETE FROM tasks WHERE id = ?", [id])
  },

  async isUserAssigned(taskId, userId) {
    const [rows] = await pool.query(
      "SELECT 1 FROM task_assignees WHERE task_id = ? AND user_id = ? LIMIT 1",
      [taskId, userId]
    )
    return rows.length > 0
  },

  async findAllWithAssignees(projectIds = null) {
    let sql = "SELECT * FROM tasks"
    const params = []

    if (projectIds?.length) {
      sql += ` WHERE project_id IN (${projectIds.map(() => "?").join(",")})`
      params.push(...projectIds)
    }

    sql += " ORDER BY createdAt DESC"

    const [rows] = await pool.query(sql, params)
    const tasks = []
    for (const row of rows) {
      const assignedTo = await getPopulatedAssignees(row.id)
      tasks.push(formatTask(row, assignedTo))
    }
    return tasks
  },
}

export default Task
export { getAssigneeIds, parseJsonField }
