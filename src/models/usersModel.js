import pool from "../config/db.js";

// CREATE USER
// Membuat user baru dengan role tertentu (user atau admin)
// Parameter: publicId (unik), username, password (sudah di-hash), role
// Return: data user tanpa password
export const createUser = async ({ publicId, username, password, role }) => {
  const result = await pool.query(
    `INSERT INTO users (public_id, username, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, public_id, username, role, created_at`,
    [publicId, username, password, role],
  );
  return result.rows[0];
};

// FIND USER BY USERNAME
// Digunakan untuk: login (verifikasi user), register (cek username unik)
// Return: semua data user termasuk password (untuk bcrypt compare)
export const findUserByUsername = async (username) => {
  const result = await pool.query(
    `SELECT id, public_id, username, password, role, created_at 
     FROM users 
     WHERE username = $1`,
    [username]
  );
  return result.rows[0] ?? null;
};

// FIND USER BY ID
// Digunakan untuk: profile user, admin detail user, soft delete, restore
// Return: semua data user termasuk deleted_at dan expires_at
export const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, public_id, username, password, role, created_at, deleted_at, expires_at
     FROM users 
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
};