import pool from "../config/db.js";

// CREATE ADMIN
export const createAdmin = async ({ username, password }) => {
  const result = await pool.query(
    `INSERT INTO users (public_id, username, password, role)
      VALUES (gen_random_uuid(), $1, $2, 'admin')
      RETURNING id, public_id, username, role, created_at`,
    [username, password]
  );
  return result.rows[0];
};

// GET ALL USERS WITH PAGINATION + FILTER
export const findAllUsersPaginated = async (limit, offset, role = null) => {
  let query = `
    SELECT id, public_id, username, role, created_at
    FROM users
    WHERE 1=1
  `;
  const values = [];
  let paramCount = 1;

  if (role) {
    query += ` AND role = $${paramCount}`;
    values.push(role);
    paramCount++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limit, offset);

  const result = await pool.query(query, values);
  return result.rows;
};

export const countTotalUsers = async (role = null) => {
  let query = `SELECT COUNT(*) FROM users WHERE 1=1`;
  const values = [];

  if (role) {
    query += ` AND role = $1`;
    values.push(role);
  }

  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count);
};

// GET ALL TASKS WITH PAGINATION + FILTER
export const findAllTasksPaginated = async (limit, offset, status = null) => {
  let query = `
    SELECT t.id, t.public_id, t.title, t.description, t.status, 
           t.user_id, t.created_at, t.updated_at, u.username
    FROM tasks t
    JOIN users u ON u.id = t.user_id
    WHERE 1=1
  `;
  const values = [];
  let paramCount = 1;  

  if (status) {
    query += ` AND t.status = $${paramCount}`;  
    values.push(status);
    paramCount++;
  }

  query += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limit, offset);

  const result = await pool.query(query, values);
  return result.rows;
};

export const countTotalTasks = async (status = null) => {
  let query = `SELECT COUNT(*) FROM tasks WHERE 1=1`; 
  const values = [];

  if (status) {
    query += ` AND status = $1`; 
    values.push(status);
  }

  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count);
};

// ============= DASHBOARD STATS =============
export const countPendingTasks = async () => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM tasks WHERE status = 'pending'`
  );
  return parseInt(result.rows[0].count);
};

export const countInProgressTasks = async () => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM tasks WHERE status = 'in-progress'`
  );
  return parseInt(result.rows[0].count);
};

export const countCompletedTasks = async () => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM tasks WHERE status = 'done'`
  );
  return parseInt(result.rows[0].count);
};

export const countNewUsersLast7Days = async () => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM users
     WHERE created_at >= NOW() - INTERVAL '7 days'`
  );
  return parseInt(result.rows[0].count);
};

export const countActiveUsersToday = async () => {
  const result = await pool.query(
    `SELECT COUNT(DISTINCT user_id) FROM tasks
     WHERE created_at >= CURRENT_DATE`
  );
  return parseInt(result.rows[0].count);
};

// DELETE USER
export const deleteUserById = async (userId) => {
  const result = await pool.query(
    `DELETE FROM users 
     WHERE id = $1 
     RETURNING id, public_id, username, role`,
    [userId]
  );
  return result.rows[0] ?? null;
};