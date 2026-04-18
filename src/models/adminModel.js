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
export const findAllUsersPaginated = async (limit, offset, role = null, public_id=null) => {
  let query = `
    SELECT id, public_id, username, role, created_at
    FROM users
    WHERE deleted_at IS NULL
`;
  const values = [];
  let paramCount = 1;

  if (role) {
    query += ` AND role = $${paramCount}`;
    values.push(role);
    paramCount++;
  }

  if(public_id){
    query += ` AND public_id = $${paramCount}`;
    values.push(public_id);
    paramCount++;
  }


  query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limit, offset);

  const result = await pool.query(query, values);
  return result.rows;
};

//COUNT TASK BY ADMIN WITH PAGINATION + FILTER
export const countTotalUsers = async (role = null, public_id=null) => {
  let query = `SELECT COUNT(*) FROM users WHERE deleted_at IS NULL`;
  const values = [];
  const paramCount = 1;

  if (role) {
    query += ` AND role = $${paramCount}`;
    values.push(role);
  }

  if(public_id){
    query += ` AND public_id = $${paramCount}`;
    values.push(public_id)

  }

  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count);
};

// GET TASKS WITH PAGINATION + FILTER
export const findAllTasksPaginated = async (limit, offset, status = null, search=null) => {
  let query = `
    SELECT t.id, t.public_id, t.title, t.description, t.status, 
           t.user_id, t.created_at, t.updated_at, u.username
    FROM tasks t
    JOIN users u ON u.id = t.user_id 
    WHERE t.deleted_at IS NULL 
  `;
  const values = [];
  let paramCount = 1;  

  if (status) {          
    query += ` AND t.status = $${paramCount}`;  
    values.push(status);
    paramCount++;
  }

  // SEARCH BY TITLE
  if(search){
    query += ` AND t.title ILIKE $${paramCount}`;
    values.push(`%${search}%`);
    paramCount++

  }

  query += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limit, offset);

  const result = await pool.query(query, values);
  return result.rows;
};

export const countTotalTasks = async (status = null, search=null) => {
  let query = `SELECT COUNT(*) FROM tasks WHERE 1=1`; 
  const values = [];

  if (status) {
    query += ` AND status = $1`; 
    values.push(status);
  }

  if(search){
    query += ` AND ILIKE = $2`
    values.push(`%${search}%`);
  }

  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count);
};

// DASHBOARD STATS 
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

// SOFT DELETE
export const softDeleteUserById = async (userId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Soft delete tasks user +  expiry 30 hari
    await client.query(
      `UPDATE tasks SET 
        deleted_at = NOW(),
        expires_at = NOW() + INTERVAL '30 days'
       WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId]
    );
    
    // Soft delete user + expiry 30 hari
    const result = await client.query(
      `UPDATE users SET 
        deleted_at = NOW(),
        expires_at = NOW() + INTERVAL '30 days'
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, public_id, username, role, deleted_at, expires_at`,
      [userId]
    );
    
    await client.query('COMMIT');
    return result.rows[0] ?? null;
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// RESTORE USER 
export const restoreUserById = async (userId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Restore tasks user + reset expires_at
    await client.query(
      `UPDATE tasks SET 
        deleted_at = NULL,
        expires_at = NULL
       WHERE user_id = $1 AND deleted_at IS NOT NULL`,
      [userId]
    );
    
    // Restore user + reset expires_at
    const result = await client.query(
      `UPDATE users SET 
        deleted_at = NULL,
        expires_at = NULL
       WHERE id = $1
       RETURNING id, public_id, username, role`,
      [userId]
    );
    
    await client.query('COMMIT');
    return result.rows[0] ?? null;
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};