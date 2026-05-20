import dotenv from "dotenv"
import pool from "./config/database.js"
import { initDatabase } from "./db/init.js"
import User from "./models/user.model.js"

dotenv.config()

async function updateAvatars() {
  try {
    await initDatabase()
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
        console.log(`Updated avatar for ${user.name}`)
      }
    }

    console.log("Avatar update complete")
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

updateAvatars()
