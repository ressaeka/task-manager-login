import pool from "../config/db.js";

// CREATE USER
export const createUser = async ({ publicId, username, password, role }) => {
  const result = await pool.query(
    `INSERT INTO users (public_id, username, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, public_id, username, role, created_at`,
    [publicId, username, password, role],
  );
  return result.rows[0];
};

// FIND USER BY USERNAME (untuk login & register)
export const findUserByUsername = async (username) => {
  const result = await pool.query(
    `SELECT id, public_id, username, password, role, created_at 
     FROM users 
     WHERE username = $1`,
    [username]
  );
  return result.rows[0] ?? null;
};

// FIND USER BY ID (untuk profile & admin)
export const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, public_id, username, password, role, created_at 
     FROM users 
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
};