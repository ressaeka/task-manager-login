/* eslint-disable no-unused-vars */
import request from "supertest";
import app from "../src/app.js";
import pool from "../src/config/db.js";

describe("AUTH TESTING", () => {
  let token = "";
  let userId = "";

  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE task RESTART IDENTITY CASCADE");  
    await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
  });
  
  afterAll(async () => {
    await pool.end();
  }, 10000);

  const registerUser = async (
    username = "ressa",
    password = "Password123!",
  ) => {
    return request(app)
        .post("/auth/register")
        .send({ username, password });
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

  // GET PROFILE 

  test("GET PROFILE SUCCESS", async () => {
    await registerUser();
    await loginUser();

    const res = await request(app)
      .get("/auth/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("username");
    expect(res.body.data).not.toHaveProperty("password");
  });

  test("GET PROFILE FAILED - tanpa token", async () => {
    const res = await request(app).get("/auth/profile");

    expect(res.statusCode).toBe(401);
  });

});