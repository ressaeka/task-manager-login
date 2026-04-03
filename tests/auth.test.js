import request from "supertest";
import app from "../src/app.js";
import pool from "../src/config/db.js";

describe("AUTH TESTING", () => {
  let token = "";
  let userId = "";

  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE tasks RESTART IDENTITY CASCADE");
    await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
  });
  
  afterAll(async () => {
    await pool.end();
  }, 10000);

  const registerUser = async (
    username = "ressa",
    password = "Password123!",
  ) => {
    return request(app).post("/auth/register").send({ username, password });
  };

  const loginUser = async (
    username = "ressa",
    password = "Password123!",
  ) => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username, password });

    if (res.body.data?.token) {
      token = res.body.data.token;
      const decoded = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString(),
      );
      userId = decoded.id;
    }

    return res;
  };

  // ===================== REGISTER =====================

  test("REGISTER SUCCESS", async () => {
    const res = await registerUser();

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/register berhasil/i);
  });

  test("REGISTER FAILED - username sudah terdaftar", async () => {
    await registerUser();
    const res = await registerUser(); // register lagi dengan username sama

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/sudah terdaftar/i);
  });

  test("REGISTER FAILED - username kurang dari 3 karakter", async () => {
    const res = await registerUser("re", "Password123!");

    expect(res.statusCode).toBe(400);
  });

  test("REGISTER FAILED - password kurang dari 8 karakter", async () => {
    const res = await registerUser("ressa", "Pass1!");

    expect(res.statusCode).toBe(400);
  });

  test("REGISTER FAILED - password tidak memenuhi format", async () => {
    const res = await registerUser("ressa", "password123"); // tanpa huruf besar & simbol

    expect(res.statusCode).toBe(400);
  });

  test("REGISTER FAILED - username kosong", async () => {
    const res = await registerUser("", "Password123!");

    expect(res.statusCode).toBe(400);
  });

  test("REGISTER FAILED - password kosong", async () => {
    const res = await registerUser("ressa", "");

    expect(res.statusCode).toBe(400);
  });

  // ===================== LOGIN =====================

  test("LOGIN SUCCESS", async () => {
    const registerRes = await registerUser();
    expect(registerRes.statusCode).toBe(201);

    const res = await loginUser();
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("token");
  });

  test("LOGIN FAILED - password salah", async () => {
    await registerUser();
    const res = await loginUser("ressa", "WrongPass999!");

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/salah/i);
  });

  test("LOGIN FAILED - username tidak terdaftar", async () => {
    const res = await loginUser("tidakada", "Password123!");

    expect(res.statusCode).toBe(400);
  });

  test("LOGIN FAILED - username kosong", async () => {
    const res = await loginUser("", "Password123!");

    expect(res.statusCode).toBe(400);
  });

  test("LOGIN FAILED - password kosong", async () => {
    const res = await loginUser("ressa", "");

    expect(res.statusCode).toBe(400);
  });

  // ===================== GET USER =====================

  test("GET USER SUCCESS", async () => {
    await registerUser();
    await loginUser();

    const res = await request(app)
      .get(`/auth/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("username");
    expect(res.body.data).not.toHaveProperty("password");
  });

  test("GET USER FAILED - tanpa token", async () => {
    await registerUser();
    await loginUser();

    const res = await request(app).get(`/auth/${userId}`);

    expect(res.statusCode).toBe(401);
  });

  test("GET USER FAILED - id tidak valid", async () => {
    await registerUser();
    await loginUser();

    const res = await request(app)
      .get("/auth/users/abc")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  // ===================== LOGOUT =====================

  test("LOGOUT SUCCESS", async () => {
    await registerUser();
    await loginUser();

    const res = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/logout berhasil/i);
  });

  test("LOGOUT FAILED - tanpa token", async () => {
    const res = await request(app).post("/auth/logout");

    expect(res.statusCode).toBe(401);
  });
});