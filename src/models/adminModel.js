/* eslint-disable no-useless-assignment */
import pool from "../config/db.js";

// 
// 1. CREATE ADMIN
// Membuat user baru dengan role admin
// Parameters: username, password
// Returns: user data (id, public_id, username, role, created_at)
export const createAdmin = async ({ username, password }) => {
  const result = await pool.query(
    `INSERT INTO users (public_id, username, password, role)
      VALUES (gen_random_uuid(), $1, $2, 'admin')
      RETURNING id, public_id, username, role, created_at`,
    [username, password]
  );
  return result.rows[0];
};

// 2. USERS - GET ALL USERS WITH PAGINATION + FILTER
// Mengambil semua user (kecuali yang di soft delete)
// Support: pagination (limit, offset), filter role, filter public_id
export const findAllUsersPaginated = async (limit, offset, role = null, public_id = null) => {
  let query = `
    SELECT id, public_id, username, role, created_at
    FROM users
    WHERE deleted_at IS NULL
  `;
  const values = [];
  let paramCount = 1;

  // Filter by role (user/admin)
  if (role) {
    query += ` AND role = $${paramCount++}`;
    values.push(role);
  }

  // Filter by public_id (exact match)
  if (public_id) {
    query += ` AND public_id = $${paramCount++}`;
    values.push(public_id);
  }

  // Pagination: ORDER by created_at DESC, LIMIT, OFFSET
  query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
  values.push(limit, offset);

  const result = await pool.query(query, values);
  return result.rows;
};

// 3. USERS - COUNT TOTAL USERS WITH FILTER
// Menghitung total user (kecuali yang soft delete)
// Support: filter role, filter public_id
export const countTotalUsers = async (role = null, public_id = null) => {
  let query = `SELECT COUNT(*) FROM users WHERE deleted_at IS NULL`;
  const values = [];
  let paramCount = 1;

  if (role) {
    query += ` AND role = $${paramCount++}`;
    values.push(role);
  }

  if (public_id) {
    query += ` AND public_id = $${paramCount++}`;
    values.push(public_id);
  }

  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count);
};

// 4. TASKS - GET ALL TASKS WITH PAGINATION + FILTER
// Mengambil semua task dari semua user (admin view)
// Support: pagination (limit, offset), filter status, search by title
// Join dengan users untuk mendapatkan username
export const findAllTaskPaginated = async (limit, offset, status = null, search = null, sort = 'created_at', order = 'desc') => {
  let query = `
    SELECT t.id, t.public_id, t.title, t.description, t.status, 
           t.user_id, t.created_at, t.updated_at, u.username
    FROM task t
    JOIN users u ON u.id = t.user_id 
    WHERE t.deleted_at IS NULL 
  `;
  const values = [];
  let paramCount = 1;

  // Filter by status (pending/in-progress/done)
  if (status) {
    query += ` AND t.status = $${paramCount++}`;
    values.push(status);
  }

  // Filter by search (title)
  if (search) {
    query += ` AND t.title ILIKE $${paramCount++}`;
    values.push(`%${search}%`);
  }

  const allowedSortColumns = ['created_at', 'title', 'status', 'deadline_at', 'updated_at']
  const sortColumn = allowedSortColumns.includes(sort) ? sort : 'created_at';
  const sortOrder =(order === 'asc' || order === 'desc') ? order : 'desc'


  // Pagination
  query += ` ORDER BY t.${sortColumn} ${sortOrder} LIMIT $${paramCount++} OFFSET $${paramCount}`;
  values.push(limit, offset);

  const result = await pool.query(query, values);
  return result.rows;
};


// 5. TASKS - COUNT TOTAL TASKS WITH FILTER
// Menghitung total task (kecuali yang soft delete)
// Support: filter status, search by title
export const countTotalTask = async (status = null, search = null) => {
  let query = `SELECT COUNT(*) FROM task WHERE 1=1`;
  const values = [];
  let paramCount = 1;

  if (status) {
    query += ` AND status = $${paramCount++}`;
    values.push(status);
  }

  if (search) {
    query += ` AND title ILIKE $${paramCount++}`;
    values.push(`%${search}%`);
  }

  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count);
};

// 6. DASHBOARD STATS
// Menghitung berbagai metric untuk admin dashboard
// countPendingTask   : jumlah task dengan status pending
// countInProgressTask: jumlah task dengan status in-progress
// countCompletedTask : jumlah task dengan status done
// countNewUsersLast7Days: user baru dalam 7 hari terakhir
// countActiveUsersToday: user yang membuat task hari ini
export const countPendingTask = async () => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM task WHERE status = 'pending'`
  );
  return parseInt(result.rows[0].count);
};

export const countInProgressTask = async () => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM task WHERE status = 'in-progress'`
  );
  return parseInt(result.rows[0].count);
};

export const countCompletedTask = async () => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM task WHERE status = 'done'`
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
    `SELECT COUNT(DISTINCT user_id) FROM task
     WHERE created_at >= CURRENT_DATE`
  );
  return parseInt(result.rows[0].count);
};

// 7. DELETE USER (HARD DELETE)
// Menghapus user secara permanen dari database
// Data akan hilang dan tidak bisa dikembalikan
export const deleteUserById = async (userId) => {
  const result = await pool.query(
    `DELETE FROM users 
     WHERE id = $1 
     RETURNING id, public_id, username, role`,
    [userId]
  );
  return result.rows[0] ?? null;
};

// 8. SOFT DELETE USER + TASKS
// Menandai user dan semua task-nya sebagai "dihapus" tanpa menghapus data
// Soft delete: set deleted_at = NOW() dan expires_at = NOW() + 30 days
// Menggunakan TRANSACTION agar user dan task terhapus bersamaan
export const softDeleteUserById = async (userId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Mulai transaksi
    
    // Soft delete task user (set deleted_at dan expires_at)
    await client.query(
      `UPDATE task SET 
        deleted_at = NOW(),
        expires_at = NOW() + INTERVAL '30 days'
       WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId]
    );
    
    // Soft delete user (set deleted_at dan expires_at)
    const result = await client.query(
      `UPDATE users SET 
        deleted_at = NOW(),
        expires_at = NOW() + INTERVAL '30 days'
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, public_id, username, role, deleted_at, expires_at`,
      [userId]
    );
    
    await client.query('COMMIT'); // Simpan perubahan
    return result.rows[0] ?? null;
    
  } catch (error) {
    await client.query('ROLLBACK'); // Batalkan jika error
    throw error;
  } finally {
    client.release(); // Lepas koneksi
  }
};

// 9. RESTORE USER + TASKS
// Mengembalikan user dan task yang sudah di soft delete
// Restore: set deleted_at = NULL dan expires_at = NULL
// Menggunakan TRANSACTION agar user dan task ter-restore bersamaan
export const restoreUserById = async (userId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Mulai transaksi
    
    // Restore task user (hapus tanda deleted)
    await client.query(
      `UPDATE task SET 
        deleted_at = NULL,
        expires_at = NULL
       WHERE user_id = $1 AND deleted_at IS NOT NULL`,
      [userId]
    );
    
    // Restore user (hapus tanda deleted)
    const result = await client.query(
      `UPDATE users SET 
        deleted_at = NULL,
        expires_at = NULL
       WHERE id = $1
       RETURNING id, public_id, username, role`,
      [userId]
    );
    
    await client.query('COMMIT'); // Simpan perubahan
    return result.rows[0] ?? null;
    
  } catch (error) {
    await client.query('ROLLBACK'); // Batalkan jika error
    throw error;
  } finally {
    client.release(); // Lepas koneksi
  }
};