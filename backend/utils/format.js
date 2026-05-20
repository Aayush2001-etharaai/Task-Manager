export function parseJsonField(value, fallback = []) {
  if (value == null) return fallback
  if (typeof value === "object") return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export function formatUser(row) {
  if (!row) return null

  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    profileImageUrl: row.profileImageUrl || "",
    role: row.role,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function formatUserPublic(row) {
  if (!row) return null
  const user = formatUser(row)
  delete user.password
  return user
}

export function formatTask(row, assignedTo = []) {
  if (!row) return null

  return {
    _id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description || "",
    priority: row.priority,
    status: row.status,
    dueDate: row.dueDate,
    createdBy: row.createdBy,
    attachments: parseJsonField(row.attachments, []),
    todoChecklist: parseJsonField(row.todoChecklist, []),
    progress: row.progress ?? 0,
    submissionNote: row.submissionNote || "",
    assignedTo,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
