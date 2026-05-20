import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import pool from "../config/database.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function initDatabase() {
  const connection = await pool.getConnection()

  try {
    const schemaPath = path.join(__dirname, "schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf8")
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)

    for (const statement of statements) {
      await connection.query(statement)
    }

    console.log("MySQL database ready")
  } finally {
    connection.release()
  }
}
