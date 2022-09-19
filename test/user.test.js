require("dotenv").config();
const request = require("supertest");
const { connectDb, disconnectDb } = require("./test-db/test-db");
const app = require("../src/app");
const User = require("../src/models/user");

beforeAll(async () => {
  await connectDb();
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await disconnectDb();
});

test("retrieve all users", async () => {
  const newUser = new User({
    username: "gestolinii",
    email: "gestolinii@gmail.com",
    password: "passwordii",
  });
  await newUser.save();

  const newUser2 = new User({
    username: "gestolinoo",
    email: "gestolinoo@gmail.com",
    password: "passwordio",
  });
  await newUser2.save();

  const newUser3 = new User({
    username: "gestolinaa",
    email: "gestolinaa@gmail.com",
    password: "passwordia",
  });
  await newUser3.save();

  const response = await request(app).get("/api/users/").expect(200);

  expect(response.body.message).toMatch("Users successfully retrieved!");
  expect(response.body.users.length).toEqual(3);
});

describe("user creation tests", () => {
  test("create a new user", async () => {
    const response = await request(app)
      .post("/api/users/")
      .send({
        username: "gastoncastro",
        email: "gastoncastro@gmail.com",
        password: "thisisapassword",
      })
      .expect(201);

    expect(response.body.message).toMatch("User successfully created!");
    expect(response.body.user.username).toMatch("gastoncastro");
    expect(response.body.user.email).toMatch("gastoncastro@gmail.com");
    expect(response.body.token).toBeDefined();
  });

  test("should not accept duplicate user", async () => {
    const newUser = {
      username: "pedrocalungsod",
      email: "pedro@gmail.com",
      password: "iamasaint",
    };

    await request(app)
      .post("/api/users/")
      .send({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
      })
      .expect(201);

    await request(app)
      .post("/api/users/")
      .send({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
      })
      .expect(500);
  });
});

test("get a user", async () => {
  const response1 = await request(app)
    .post("/api/users/")
    .send({
      username: "moammer",
      email: "moammer@gmail.com",
      password: "kleptomaniac",
    })
    .expect(201);

  const response2 = await request(app)
    .get(`/api/users/${response1.body.user._id}`)
    .expect(200);

  expect(response2.body.user.username).toMatch(response1.body.user.username);
  expect(response2.body.user.email).toMatch(response1.body.user.email);
});

test("login a user", async () => {
  await request(app)
    .post("/api/users/")
    .send({
      username: "bartok",
      email: "bartok@gmail.com",
      password: "barzalani",
    })
    .expect(201);

  const response2 = await request(app)
    .post("/api/users/login")
    .send({ username: "bartok", password: "barzalani" })
    .expect(200);

  expect(response2.body.message).toMatch("User successfully logged in!");
  expect(response2.body.token).toBeDefined();
});

test("update a user", async () => {
  const response = await request(app)
    .post("/api/users/")
    .send({
      username: "bartok",
      email: "bartok@gmail.com",
      password: "barzalani",
    })
    .expect(201);

  const response2 = await request(app)
    .patch(`/api/users/${response.body.user._id}`)
    .send({
      username: "balyena",
      email: "balyena@gmail.com",
      password: "dumangi",
    })
    .expect(200);

  expect(response2.body.message).toMatch("User successfully updated!");
  expect(response2.body.user.username).toMatch("balyena");
  expect(response2.body.user.email).toMatch("balyena@gmail.com");
  expect(response2.body.user.password).toMatch("dumangi");
});

test("delete a user", async () => {
  const response = await request(app)
    .post("/api/users/")
    .send({
      username: "carmella",
      email: "carmella@gmail.com",
      password: "fahadina",
    })
    .expect(201);

  const response2 = await request(app)
    .delete(`/api/users/${response.body.user._id}`)
    .expect(200);

  expect(response2.body.message).toMatch("User successfully deleted!");
  expect(response2.body.user.username).toMatch(response.body.user.username);
  expect(response2.body.user.email).toMatch(response.body.user.email);
});

describe("authentication tests", () => {
  test("login and authenticate user", async () => {
    const response1 = await request(app)
      .post("/api/users/")
      .send({
        username: "karina",
        email: "karina@gmail.com",
        password: "quintero",
      })
      .expect(201);

    const response2 = await request(app)
      .post("/api/users/login")
      .send({ username: "karina", password: "quintero" })
      .expect(200);

    const response3 = await request(app)
      .get("/api/users/user-info")
      .set("Authorization", `Bearer ${response2.body.token}`)
      .expect(200);

    expect(response3.body.message).toMatch("User info successfully retrieved!");

    expect(response3.body.user).toMatchObject({
      userId: response1.body.user._id,
      userEmail: response1.body.user.email,
      username: response1.body.user.username,
    });
  });

  test("should not authenticate logged out user", async () => {
    const response = await request(app).get("/api/users/user-info").expect(401);

    expect(response.body).toMatchObject({ error: "Token must be provided" });
  });

  test("invalid token should not authenticate user", async () => {
    await request(app)
      .post("/api/users/")
      .send({
        username: "marga",
        email: "marga@gmail.com",
        password: "filotino",
      })
      .expect(201);

    const response2 = await request(app)
      .post("/api/users/login")
      .send({ username: "marga", password: "filotino" })
      .expect(200);

    const response3 = await request(app)
      .get("/api/users/user-info")
      .set("Authorization", `Bearer ${response2.body.token}d`)
      .expect(401);

    expect(response3.body).toMatchObject({
      error: "Session is expired or invalid",
    });
  });
});
