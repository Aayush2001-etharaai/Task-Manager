import pool from "../config/database.js"
import { formatUser, formatUserPublic } from "../utils/format.js"

const User = {
  async findOne({ email }) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email])
    return formatUser(rows[0])
  },

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id])
    return formatUser(rows[0])
  },

  async find(filter = {}) {
    let sql = "SELECT * FROM users WHERE 1=1"
    const params = []

    if (filter.role) {
      sql += " AND role = ?"
      params.push(filter.role)
    }

    const [rows] = await pool.query(sql, params)
    return rows.map(formatUser)
  },

  async create({ name, email, password, profileImageUrl, role }) {
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, profileImageUrl, role)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, password, profileImageUrl || "", role || "member"]
    )
    return this.findById(result.insertId)
  },

  async updateById(id, fields) {
    const updates = []
    const params = []

    if (fields.name != null) {
      updates.push("name = ?")
      params.push(fields.name)
    }
    if (fields.email != null) {
      updates.push("email = ?")
      params.push(fields.email)
    }
    if (fields.profileImageUrl != null) {
      updates.push("profileImageUrl = ?")
      params.push(fields.profileImageUrl)
    }
    if (fields.password != null) {
      updates.push("password = ?")
      params.push(fields.password)
    }

    if (updates.length === 0) return this.findById(id)

    params.push(id)
    await pool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params)
    return this.findById(id)
  },

  async findPublic(filter = {}) {
    const users = await this.find(filter)
    return users.map((u) => {
      const { password, ...rest } = u
      return rest
    })
  },

  async findByIdPublic(id) {
    const user = await this.findById(id)
    if (!user) return null
    const { password, ...rest } = user
    return rest
  },

  async findPublicById(id) {
    return this.findByIdPublic(id)
  },

  async deleteById(id) {
    await pool.query("DELETE FROM users WHERE id = ?", [id])
  },
}

export default User
export { formatUserPublic }
