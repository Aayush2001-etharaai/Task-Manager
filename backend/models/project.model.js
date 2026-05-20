import pool from "../config/database.js"

const Project = {
  async create({ name, description, createdBy }) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      const [result] = await connection.query(
        `INSERT INTO projects (name, description, createdBy) VALUES (?, ?, ?)`,
        [name, description || "", createdBy]
      )

      const projectId = result.insertId

      await connection.query(
        `INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, 'admin')`,
        [projectId, createdBy]
      )

      await connection.commit()
      return this.findById(projectId, createdBy)
    } catch (err) {
      await connection.rollback()
      throw err
    } finally {
      connection.release()
    }
  },

  async findById(projectId, userId = null) {
    const [rows] = await pool.query(`SELECT * FROM projects WHERE id = ?`, [projectId])
    if (!rows[0]) return null

    const project = {
      _id: rows[0].id,
      name: rows[0].name,
      description: rows[0].description || "",
      createdBy: rows[0].createdBy,
      createdAt: rows[0].createdAt,
      updatedAt: rows[0].updatedAt,
    }

    project.members = await this.getMembers(projectId)

    if (userId) {
      const membership = project.members.find((m) => m._id === userId)
      project.myRole = membership?.projectRole || null
    }

    return project
  },

  async findForUser(userId, isPlatformAdmin = false) {
    let rows

    if (isPlatformAdmin) {
      ;[rows] = await pool.query(`SELECT * FROM projects ORDER BY createdAt DESC`)
    } else {
      ;[rows] = await pool.query(
        `SELECT p.*, pm.role AS projectRole
         FROM projects p
         INNER JOIN project_members pm ON p.id = pm.project_id
         WHERE pm.user_id = ?
         ORDER BY p.createdAt DESC`,
        [userId]
      )
    }

    return rows.map((r) => ({
      _id: r.id,
      name: r.name,
      description: r.description || "",
      createdBy: r.createdBy,
      projectRole: r.projectRole || "admin",
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))
  },

  async getMembers(projectId) {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.profileImageUrl, pm.role AS projectRole
       FROM project_members pm
       INNER JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = ?
       ORDER BY pm.role DESC, u.name ASC`,
      [projectId]
    )

    return rows.map((r) => ({
      _id: r.id,
      name: r.name,
      email: r.email,
      profileImageUrl: r.profileImageUrl || "",
      projectRole: r.projectRole,
    }))
  },

  async addMember(projectId, userId, role = "member") {
    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE role = VALUES(role)`,
      [projectId, userId, role]
    )
  },

  async removeMember(projectId, userId) {
    const [project] = await pool.query(`SELECT createdBy FROM projects WHERE id = ?`, [
      projectId,
    ])
    if (project[0]?.createdBy === userId) {
      throw new Error("Cannot remove project creator")
    }

    await pool.query(
      `DELETE FROM project_members WHERE project_id = ? AND user_id = ?`,
      [projectId, userId]
    )
  },

  async getMemberRole(projectId, userId) {
    const [rows] = await pool.query(
      `SELECT role FROM project_members WHERE project_id = ? AND user_id = ?`,
      [projectId, userId]
    )
    return rows[0]?.role || null
  },

  async isMember(projectId, userId) {
    const role = await this.getMemberRole(projectId, userId)
    return !!role
  },

  async isProjectAdmin(projectId, userId) {
    const role = await this.getMemberRole(projectId, userId)
    return role === "admin"
  },

  async getAccessibleProjectIds(userId, isPlatformAdmin = false) {
    if (isPlatformAdmin) {
      const [rows] = await pool.query(`SELECT id FROM projects`)
      return rows.map((r) => r.id)
    }

    const [rows] = await pool.query(
      `SELECT project_id FROM project_members WHERE user_id = ?`,
      [userId]
    )
    return rows.map((r) => r.project_id)
  },
}

export default Project
