const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server"); // export your Express app from server.js
const User = require("../models/User");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany();
});

describe("Auth API", () => {
  //register user test cases

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Khalil",
      email: "khalilkadri@example.com",
      password: "mypassword",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.msg).toBe("User registered");
  });

test("should fail to register if required fields are missing", async () => {
  const res = await request(app).post("/api/auth/register").send({
    name: "No Email",
    // email is missing
    password: "Test123!",
  });

expect(res.statusCode).toBe(400);
  expect(res.body).toHaveProperty("msg");
});


  test("should fail to register if email already exists", async () => {
    // First registration
    await request(app).post("/api/auth/register").send({
      name: "Khalil",
      email: "duplicate@example.com",
      password: "TestPass123!",
    });

    // Try to register again with the same email
    const res = await request(app).post("/api/auth/register").send({
      name: "Khalil Again",
      email: "duplicate@example.com",
      password: "AnotherPass456!",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("Email already exists");
  });

  //user login test cases

test("should login successfully with correct credentials", async () => {
  const testUser = {
    name: "Test Login User",
    email: "login.success@example.com",
    password: "StrongPass123!",
  };

  // Register the user first
  const registerRes = await request(app).post("/api/auth/register").send(testUser);
  expect(registerRes.statusCode).toBe(201);
  expect(registerRes.body).toHaveProperty("msg", "User registered");

  // Then attempt login
  const loginRes = await request(app).post("/api/auth/login").send({
    email: testUser.email,
    password: testUser.password,
  });

  expect(loginRes.statusCode).toBe(200);
  expect(loginRes.body).toHaveProperty("token");
  expect(loginRes.body.user).toMatchObject({
    name: testUser.name,
    email: testUser.email,
  });
});

test("should fail login with non-existent email", async () => {
  const res = await request(app).post("/api/auth/login").send({
    email: "notfound@example.com",
    password: "somepassword",
  });

  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty("msg", "Invalid email or password");
});


test("should fail login with wrong password", async () => {
  const email = "wrongpass@example.com";
  const correctPassword = "correct123";
  const wrongPassword = "incorrect456";

  // Register the user
  await request(app).post("/api/auth/register").send({
    name: "Wrong Password User",
    email,
    password: correctPassword,
  });

  // Try logging in with incorrect password
  const res = await request(app).post("/api/auth/login").send({
    email,
    password: wrongPassword,
  });

  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty("msg", "Invalid email or password");
});

//reset password test cases

test("should return error if forgot password is requested with non-existent email", async () => {
  const res = await request(app).post("/api/auth/forgot-password").send({
    email: "doesnotexist@example.com",
  });

  expect(res.statusCode).toBe(404);
  expect(res.body).toHaveProperty("msg", "User not found");
});

test("should return error if reset token is invalid or expired", async () => {
  const res = await request(app)
    .post("/api/auth/reset-password/invalidtoken123")
    .send({ password: "NewPass123!" });

  expect(res.statusCode).toBe(400);
  expect(res.body).toHaveProperty("msg", "Invalid or expired token");
});


  /*it("should send a password reset link if the email exists", async () => {
    // Create a user first using the registration API
    await request(app).post("/api/auth/register").send({
      name: "Khalil",
      email: "khalilkadri023@gmail.com",
      password: "mypassword123",
    });

    // Send forgot password request to the newly registered user
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "khalilkadri023@gmail.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe("Password reset link sent to email");
  });*/
});
