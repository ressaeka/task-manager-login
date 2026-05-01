/* eslint-disable no-useless-assignment */
import pool from "../config/db.js";

// CREATE TASK
// Membuat task baru untuk user tertentu
// Parameter: publicId (unik), title, description, deadline_at (opsional), userId
// Status default: 'pending'
export const createTask = async ({ publicId, title, description, deadline_at, userId }) => {
  const result = await pool.query(
    `INSERT INTO task (public_id, title, description, deadline_at, user_id, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, public_id, title, description, deadline_at, status, user_id, created_at, updated_at`,
    [publicId, title, description, deadline_at, userId, "pending"],
  );
  return result.rows[0];
};

// GET TASK BY USER (tanpa pagination)
// Mengambil semua task milik user tertentu tanpa pagination
// Hanya untuk keperluan internal, tidak di-expose ke API
export const getTaskByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT id, public_id, title, description, status,deadline_at, created_at, updated_at
     FROM task
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return result.rows;
};

// GET TASK BY USER WITH PAGINATION + FILTER STATUS + SEARCH
// Mengambil task milik user dengan:
// - Pagination (limit, offset)
// - Filter by status (pending, in-progress, done)
// - Search by title (ILIKE)
// Hanya task yang belum di-soft delete (deleted_at IS NULL)
export const getTaskByUserIdPaginated = async (userId, limit, offset, status = null, search = null, sort = 'createad_at', order = 'decs') => {
  let query = `
    SELECT id, public_id, title, description, status, deadline_at, created_at, updated_at
    FROM task
    WHERE user_id = $1 AND deleted_at IS NULL 
  `;
  const values = [userId];
  let paramCount = 2;

  // Filter by status
  if (status) {
    query += ` AND status = $${paramCount}`;
    values.push(status);
    paramCount++;
  }

  // Filter by search (title)
  if(search) {
    query += ` AND title ILIKE $${paramCount}`;
    values.push(`%${search}%`);
    paramCount++;
  }

  //sorting (validasi kolom yang boleh di sort)
  const allowedSortColumns = ['created_at', 'title', 'status', 'deadline_at', 'updated_at'];
  const sortColumn = allowedSortColumns.includes(sort) ? sort : 'created_at';

  //validasi order
  const sortOrder = (order === 'asc' || order === 'desc') ? order : 'desc';

  query += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limit, offset);
  
  const result = await pool.query(query, values);
  return result.rows;
};

// COUNT TASK BY USER WITH FILTERS
// Menghitung total task milik user dengan filter status dan search
// Digunakan untuk pagination
export const countTaskByUserId = async (userId, status=null, search = null) => {
  let query = `SELECT COUNT(*) FROM task WHERE user_id = $1 AND deleted_at IS NULL`;
  const values = [userId];
  let paramCount = 2;

  if(status){
    query += ` AND status = $${paramCount}`;
    values.push(status);
    paramCount++;
  }

  if(search) {
    query += ` AND title ILIKE $${paramCount}`;
    values.push(`%${search}%`);
    paramCount++;
  }

  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count);
};

// FIND TASK BY ID + USER
// Mencari task berdasarkan ID dan user_id (cek kepemilikan)
// Digunakan untuk operasi update, delete, soft delete, restore
export const findTaskById = async (taskId, userId) => {
  const result = await pool.query(
    `SELECT id, public_id, title, description, deadline_at, status, created_at, updated_at, deleted_at , expires_at
     FROM task
     WHERE id = $1 AND user_id = $2`,
    [taskId, userId],
  ); 
  return result.rows[0] ?? null;
};

// UPDATE TASK
// Mengupdate task berdasarkan ID dan user_id (cek kepemilikan)
// Menggunakan COALESCE agar field yang tidak dikirim tidak berubah
// Support update: title, description, status, deadline_at
export const updateTaskById = async (
  taskId,
  userId,
  { title, description, status, deadline_at },  
) => {
  const result = await pool.query(
    `UPDATE task
     SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       status = COALESCE($3, status),
       deadline_at = COALESCE($4, deadline_at),
       updated_at = NOW()
     WHERE id = $5 AND user_id = $6
     RETURNING id, public_id, title, description, status, deadline_at, created_at, updated_at`,
    [title, description, status, deadline_at, taskId, userId], 
  );
  return result.rows[0] ?? null;
};

// DELETE TASK (HARD DELETE)
// Menghapus task secara permanen dari database
// Data akan hilang dan tidak bisa dikembalikan
export const deleteTaskById = async (taskId, userId) => {
  const result = await pool.query(
    `DELETE FROM task
     WHERE id = $1 AND user_id = $2
     RETURNING id, public_id, title`,
    [taskId, userId],
  );
  return result.rows[0] ?? null;
};

// SOFT DELETE TASK (individual)
// Menandai task sebagai "dihapus" tanpa menghapus data
// Set deleted_at = NOW() dan expires_at = NOW() + 30 days
// Task bisa direstore dalam 30 hari
export const softDeleteTaskById = async (taskId, userId) => {
  const result = await pool.query(
    `UPDATE task SET 
      deleted_at = NOW(),
      expires_at = NOW() + INTERVAL '30 days'
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
     RETURNING id, public_id, title, description, deadline_at, status, user_id, created_at, updated_at, deleted_at, expires_at`,
    [taskId, userId]
  );
  return result.rows[0] ?? null;
};

// RESTORE TASK (individual)
// Mengembalikan task yang sudah di-soft delete
// Set deleted_at = NULL dan expires_at = NULL
export const restoreTaskById = async (taskId, userId) => {
  const result = await pool.query(
    `UPDATE task SET 
      deleted_at = NULL,
      expires_at = NULL
     WHERE id = $1 AND user_id = $2
     RETURNING id, public_id, title, description, status, deadline_at, user_id, created_at, updated_at, deleted_at, expires_at`,
    [taskId, userId]
  );
  return result.rows[0] ?? null;
};

// GET DELETED TASK (tong sampah user)
// Mengambil semua task milik user yang sudah di-soft delete
// Urut dari yang paling baru dihapus (deleted_at DESC)
export const getDeleteTaskByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT id, public_id, title, description, deadline_at, status, user_id, created_at, updated_at, deleted_at, expires_at
     FROM task
     WHERE user_id = $1 AND deleted_at IS NOT NULL
     ORDER BY deleted_at DESC`,
    [userId]
  );
  return result.rows;
};

// SET DEADLINE TASK
// Mengatur atau mengupdate deadline task
// Menggunakan COALESCE agar deadline_at hanya berubah jika dikirim
export const setDeadlineTask = async (taskId, userId, deadline_at) => {
  const result = await pool.query(
    `UPDATE task
     SET deadline_at = COALESCE($1, deadline_at),
         updated_at = NOW()
     WHERE id = $2 AND user_id = $3 AND deleted_at IS NULL
     RETURNING id, public_id, title, description, status, deadline_at, created_at, updated_at`,
    [deadline_at, taskId, userId]
  );
  return result.rows[0] ?? null;
};

// GET TASK BY DEADLINE (URUT TERDEKAT)
// Mengambil semua task milik user yang memiliki deadline
// Urut dari deadline terdekat (ASC) untuk prioritas
export const getTaskByDeadline = async (userId, limit, offset) => {
  const result = await pool.query(
    `SELECT id, public_id, title, description, status, deadline_at, created_at, updated_at
     FROM task
     WHERE user_id = $1 AND deleted_at IS NULL AND deadline_at IS NOT NULL
     ORDER BY deadline_at ASC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
};

// GET TASK DEADLINE TODAY
// Mengambil task milik user yang deadline-nya hari ini
// Menambahkan jam untuk menyesuaikan zona waktu WIB (UTC)
export const getTaskDeadlineToday = async (userId) => {
  const result = await pool.query(
    `SELECT id, public_id, title, description, status, deadline_at, created_at, updated_at
     FROM task
     WHERE user_id = $1
       AND deleted_at IS NULL
       AND DATE(deadline_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') = CURRENT_DATE
     ORDER BY deadline_at ASC`,
    [userId]
  );
  return result.rows;
};

// COUNT TASK WITH DEADLINE
// Menghitung total task milik user yang memiliki deadline
// Digunakan untuk pagination di endpoint deadline
export const countTaskWithDeadline = async (userId) => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM task
     WHERE user_id = $1 AND deleted_at IS NULL AND deadline_at IS NOT NULL`,
    [userId]
  );
  return parseInt(result.rows[0].count);
};