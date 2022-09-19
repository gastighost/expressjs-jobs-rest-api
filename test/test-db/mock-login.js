const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/models/user");

exports.getToken = async () => {
  await request(app)
    .post("/api/users/")
    .send({
      username: "zhila",
      email: "zhila@gmail.com",
      password: "gorbanifar",
    })
    .expect(201);

  const response2 = await request(app)
    .post("/api/users/login")
    .send({ username: "zhila", password: "gorbanifar" })
    .expect(200);

  return response2.body.token;
};

exports.getToken2 = async () => {
  await request(app)
    .post("/api/users/")
    .send({
      username: "patrick",
      email: "patrick@gmail.com",
      password: "krustykrab",
    })
    .expect(201);

  const response2 = await request(app)
    .post("/api/users/login")
    .send({ username: "patrick", password: "krustykrab" })
    .expect(200);

  return response2.body.token;
};
