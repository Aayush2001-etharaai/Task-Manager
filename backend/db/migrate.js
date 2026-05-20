import pool from "../config/database.js"

export async function runMigrations() {
  const connection = await pool.getConnection()

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        createdBy INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_members (
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('admin', 'member') NOT NULL DEFAULT 'member',
        joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (project_id, user_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    const [projectCol] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tasks' AND COLUMN_NAME = 'project_id'`
    )

    if (projectCol.length === 0) {
      await connection.query(
        `ALTER TABLE tasks ADD COLUMN project_id INT NULL AFTER id`
      )

      const [users] = await connection.query(`SELECT id FROM users LIMIT 1`)
      if (users.length > 0) {
        const creatorId = users[0].id
        const [proj] = await connection.query(
          `INSERT INTO projects (name, description, createdBy) VALUES ('Main Project', 'Default workspace', ?)`,
          [creatorId]
        )
        const projectId = proj.insertId

        await connection.query(
          `INSERT IGNORE INTO project_members (project_id, user_id, role)
           SELECT ?, id, IF(role = 'admin', 'admin', 'member') FROM users`,
          [projectId]
        )

        await connection.query(`UPDATE tasks SET project_id = ? WHERE project_id IS NULL`, [
          projectId,
        ])
      }

      await connection.query(
        `ALTER TABLE tasks MODIFY project_id INT NOT NULL,
         ADD FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE`
      )
    }

    try {
      await connection.query(
        `ALTER TABLE users MODIFY role ENUM('admin', 'member') NOT NULL DEFAULT 'member'`
      )
    } catch {
      /* column may already be updated */
    }

    await connection.query(`UPDATE users SET role = 'member' WHERE role = 'user'`)

    await connection.query(
      `UPDATE tasks SET status = 'To Do' WHERE status = 'Pending'`
    )
    await connection.query(
      `UPDATE tasks SET status = 'Done' WHERE status = 'Completed'`
    )

    try {
      await connection.query(
        `ALTER TABLE tasks MODIFY status ENUM('To Do', 'In Progress', 'Done') NOT NULL DEFAULT 'To Do'`
      )
    } catch {
      /* enum may already be updated */
    }

    try {
      await connection.query(`ALTER TABLE tasks MODIFY submissionNote TEXT NULL`)
    } catch {
      /* table or column may not exist yet */
    }
  } finally {
    connection.release()
  }
}
