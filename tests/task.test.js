import request from "supertest";
import app from "../src/app.js";
import pool from "../src/config/db.js";

describe("TASK TESTING", () => {
    let token = "";
    let taskId = "";
    let userId ="";

    beforeEach(async () => {
        await pool.query("TRUNCATE TABLE task RESTART IDENTITY CASCADE")
        await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
        
    });

    afterAll(async () => {
        await pool.end()
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


    test("CREATE TASK", async () => {
        await registerUser();
        await loginUser();

        const res = await request(app)
            .post("/task/task")
            .set("Authorization",  `Bearer ${token}`)
            .send({
                title: "Task testing",
                description: "Deskripsi task testing",
                deadline_at: "2027-05-26"
    })

        expect(res.statusCode).toBe(201)
        expect(res.body.data).toHaveProperty("task")

        taskId = res.body.data.task.id;

    })

    test("CREATE TASK FAILED", async () => {
        await registerUser();
        await loginUser();

        const res = await request(app)
            .post("/task/task")
            .send({
                title: "Task testing",
                description: "Deskripsi task testing",
                deadline_at:"2027-04-20"
            })

        expect(res.statusCode).toBe(401)
    })

    test("CREATE TASK FAILED - TITLE KOSONG", async () => {
        await registerUser();
        await loginUser();

        const res = await request(app)
            .post("/task/task")
            .set("Authorization", `Bearer ${token}`)
            .send({
                description:"Halo ini test",
                deadline_at:"2026-04-29"
            })

            expect(res.statusCode).toBe(400)
    })

    test("CREATE TASK FAILED - TASK KURANG DARI 5 KARAKTER", async () => {
        await registerUser()
        await loginUser()

        const res = await request(app)
            .post("/task/task")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title:"test",
                description:"ini adalah testing",
                deadline_at:"2027-06-08"
            })

        expect(res.statusCode).toBe(400)
    })

    test("GET TASK SUKSES", async () => {
        await registerUser();
        await loginUser();

        const res = await request(app)
            .get("/task/task")
            .set("Authorization", `Bearer ${token}`)


            expect(res.statusCode).toBe(200)
            expect(Array.isArray(res.body.data)).toBe(false)
    })
});
