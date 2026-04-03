import request from "supertest";
import app from "../src/app.js";
import pool from "../src/config/db.js";

let token = "";
let taskId = "";

describe("TASKS TESTING", () => {

  beforeEach(async () => {
    await pool.query("DELETE FROM tasks");
    await pool.query("DELETE FROM users");
  });

  afterAll(async () => {
    await pool.query("DELETE FROM tasks");
    await pool.query("DELETE FROM users");
  });

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
    }

    return res;
  };

  const createTasks = async (
    title = "tasks pertama",
    description = "deskripsi tasks 1",
  ) => {
    return request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title, description });
  };

  // Create Tasks

  test("CREATE TASK SUCCESS", async () => {
    await registerUser();
    await loginUser();

    const res = await createTasks();
    console.log(res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Task berhasil dibuat");
    expect(res.body.data.task).toHaveProperty("id");

    taskId = res.body.data.task.id;
  });

  test("CREATE TASK FAILED - unauthorized", async () => {
    const res = await request(app)
    .post("/tasks")
    .send({ title: "tasks pertama", description: "deskripsi tasks 1" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Token wajib ada");
})
    test("CREATE TASK FAILED - title kosong", async () => {
        await registerUser();
        await loginUser();

        const res = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "", description: "deskripsi tasks 1" });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("title harus diisi");
})

    test("CREATE TASK FAILED - title kurang dari 3 karakter", async () => {
        await registerUser();
        await loginUser();

        const res = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "ab", description: "deskripsi tasks 1" });   

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("title minimal 5 karakter");
})

    test("CREATE TASK FAILED - description lebih dari 255 karakter", async () => {
        await registerUser();
        await loginUser();

        const longDescription = "a".repeat(256);

        const res = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "tasks pertama", description: longDescription });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("description maksimal 255 karakter");
    });

    test("GET TASKS SUCCESS", async () => {
    await registerUser();
    await loginUser();
    await createTasks();

    const res = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Berhasil mengambil tasks");
    expect(Array.isArray(res.body.data.tasks)).toBe(true);
    expect(res.body.data.tasks.length).toBeGreaterThan(0);

    });

    test("GET TASKS FAILED - unauthorized", async () => {
    const res = await request(app)
        .get("/tasks");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Token wajib ada");   
    });
})
