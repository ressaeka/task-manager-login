import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database:
    process.env.NODE_ENV === "test"
      ? process.env.DB_NAME_TEST
      : process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  idleTimeoutMillis: 1000,
  connectionTimeoutMillis: 2000,
});

if (process.env.NODE_ENV !== "test") {
  pool
    .connect()
    .then(() => console.log("DB Connected"))
    .catch((err) => console.log(err));
}

export default pool;