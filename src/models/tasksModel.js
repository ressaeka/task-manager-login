import pool from "../config/db.js";

// CREATE TASK
export const createTask = async ({ publicId, title, description, userId }) => {
  const result = await pool.query(
    `INSERT INTO tasks (public_id, title, description, user_id, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, public_id, title, description, status, user_id, created_at, updated_at`,
    [publicId, title, description, userId, "pending"],
  );
  return result.rows[0];
};

// GET TASKS BY USER (tanpa pagination)
export const getTasksByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT id, public_id, title, description, status, created_at, updated_at
     FROM tasks
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return result.rows;
};

// GET TASKS BY USER ( dengan filter status )
export const getTasksByUserIdPaginated = async (userId, limit, offset, status = null) => {
  let query = `
    SELECT id, public_id, title, description, status, created_at, updated_at
    FROM tasks
    WHERE user_id = $1
  `;
  const values = [userId];
  let paramCount = 2;

  if (status) {
    query += ` AND status = $${paramCount}`;
    values.push(status);
    paramCount++;
  }


  query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;


  values.push(limit, offset);
  const result = await pool.query(query, values);
  return result.rows;
};

// COUNT TASKS BY USER
export const countTasksByUserId = async (userId, status=null) => {
  let query =
    `SELECT COUNT(*) FROM tasks WHERE user_id = $1`;

    const values = [userId];

    if(status){
      query += `AND status = $2`;
      values.push(status);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count)
};

// FIND TASK BY ID + USER
export const findTaskById = async (taskId, userId) => {
  const result = await pool.query(
    `SELECT id, public_id, title, description, status, created_at, updated_at
     FROM tasks
     WHERE id = $1 AND user_id = $2`,
    [taskId, userId],
  ); 
  return result.rows[0] ?? null;
};

// UPDATE TASK
export const updateTaskById = async (
  taskId,
  userId,
  { title, description, status },
) => {
  const result = await pool.query(
    `UPDATE tasks
     SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       status = COALESCE($3, status),
       updated_at = NOW()
     WHERE id = $4 AND user_id = $5
     RETURNING id, public_id, title, description, status, created_at, updated_at`,
    [title, description, status, taskId, userId],
  );
  return result.rows[0] ?? null;
};

// DELETE TASK
export const deleteTaskById = async (taskId, userId) => {
  const result = await pool.query(
    `DELETE FROM tasks
     WHERE id = $1 AND user_id = $2
     RETURNING id, public_id, title`,
    [taskId, userId],
  );
  return result.rows[0] ?? null;
};