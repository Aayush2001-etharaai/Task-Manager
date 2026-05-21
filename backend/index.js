import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mysql from "mysql2/promise"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"

import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import taskRoutes from "./routes/task.route.js"
import reportRoutes from "./routes/report.route.js"
import projectRoutes from "./routes/project.route.js"
import { initDatabase } from "./db/init.js"
import { runMigrations } from "./db/migrate.js"
import pool from "./config/database.js"
import User from "./models/user.model.js"
import Task from "./models/task.model.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runStartupMigrations() {
  try {
    const users = await User.find()

    for (const user of users) {
      const hasUnsplash =
        user.profileImageUrl &&
        user.profileImageUrl.includes("images.unsplash.com")
      const hasLength1 =
        user.profileImageUrl && user.profileImageUrl.includes("length=1")

      if (!user.profileImageUrl || hasUnsplash || !hasLength1) {
        await User.updateById(user._id, {
          profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random&color=fff&length=1`,
        })
      }
    }

    const tasks = await Task.find(
      { status: "Done" },
      { isAdmin: true, populate: false }
    )

    for (const task of tasks) {
      if (task.todoChecklist?.length > 0) {
        const updatedChecklist = task.todoChecklist.map((item) => ({
          ...item,
          completed: true,
        }))
        const needsUpdate = task.todoChecklist.some((item) => !item.completed)
        if (needsUpdate) {
          await Task.updateById(task._id, { todoChecklist: updatedChecklist })
        }
      }
    }
  } catch (err) {
    console.log("Migration error:", err)
  }
}

async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  })
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
  )
  await connection.end()
}

async function startServer() {
  try {
    await ensureDatabase()
    await initDatabase()
    await runStartupMigrations()
    console.log("MySQL connected")
  } catch (err) {
    console.error("Database connection failed:", err.message)
    console.error(
      "Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME environment variables."
    )
    process.exit(1)
  }

  const app = express()

  app.use(
    cors({
      origin: process.env.FRONT_END_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  )

  app.use(express.json())
  app.use(cookieParser())

  app.use("/api/auth", authRoutes)
  app.use("/api/projects", projectRoutes)
  app.use("/api/users", userRoutes)
  app.use("/api/tasks", taskRoutes)
  app.use("/api/reports", reportRoutes)

  app.use("/uploads", express.static(path.join(__dirname, "uploads")))

  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    let message = err.message || "Internal Server Error"

    if (message.includes("ECONNREFUSED")) {
      message =
        "Database connection failed. Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME."
    }

    res.status(statusCode).json({ success: false, statusCode, message })
  })

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

startServer()
