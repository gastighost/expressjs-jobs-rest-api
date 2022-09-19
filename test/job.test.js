require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { connectDb, disconnectDb } = require("./test-db/test-db");
const app = require("../src/app");
const User = require("../src/models/user");
const Job = require("../src/models/job");
const { getToken, getToken2 } = require("./test-db/mock-login");

beforeAll(async () => {
  await connectDb();
});

afterEach(async () => {
  await User.deleteMany({});
  await Job.deleteMany({});
});

afterAll(async () => {
  await disconnectDb();
});

test("retrieve all jobs", async () => {
  const token = await getToken2();

  const firstJob = await request(app)
    .post("/api/jobs/")
    .send({
      company: "Krusty Krab",
      position: "Chef",
      status: "interview",
    })
    .set("Authorization", `Bearer ${token}`)
    .expect(201);

  await request(app)
    .post("/api/jobs/")
    .send({
      company: "The Wash",
      position: "Washer",
      status: "pending",
    })
    .set("Authorization", `Bearer ${token}`)
    .expect(201);

  await request(app)
    .post("/api/jobs/")
    .send({
      company: "The Chum Bucket",
      position: "Plankton's Assistant",
      status: "interview",
    })
    .set("Authorization", `Bearer ${token}`)
    .expect(201);

  const response = await request(app)
    .get("/api/jobs/")
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  expect(response.body.message).toMatch("Jobs successfully retrieved!");
  expect(response.body.jobs.length).toEqual(3);
  expect(response.body.jobs[0].company).toMatch(firstJob.body.job.company);
  expect(response.body.jobs[0].position).toMatch(firstJob.body.job.position);
  expect(response.body.jobs[0].status).toMatch(firstJob.body.job.status);
});

test("create a new job", async () => {
  const token = await getToken();
  const response = await request(app)
    .post("/api/jobs/")
    .send({
      company: "Malaya Rubber Group",
      position: "Rubber Tree Planter",
      status: "pending",
    })
    .set("Authorization", `Bearer ${token}`)
    .expect(201);

  expect(response.body.message).toMatch("Job successfully created!");
  expect(response.body.job.company).toMatch("Malaya Rubber Group");
  expect(response.body.job.position).toMatch("Rubber Tree Planter");
  expect(response.body.job.status).toMatch("pending");

  const user = await User.findById(response.body.job.userId);
  expect(user.username).toMatch("zhila");
});

test("incomplete fields causes error in create a new job", async () => {
  const token = await getToken();
  const response = await request(app)
    .post("/api/jobs/")
    .send({
      position: "Rubber Tree Planter",
      status: "pending",
    })
    .set("Authorization", `Bearer ${token}`)
    .expect(400);

  expect(response.body.error).toEqual(
    expect.stringContaining("Please enter a company and position.")
  );
});

test("get an individual job", async () => {
  const token = await getToken2();

  const job1 = {
    company: "Palmer Oil",
    position: "Accountant",
    status: "declined",
  };

  const response = await request(app)
    .post("/api/jobs/")
    .send(job1)
    .set("Authorization", `Bearer ${token}`)
    .expect(201);

  const response2 = await request(app)
    .get(`/api/jobs/${response.body.job._id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  expect(response2.body.message).toMatch("Job successfully retrieved!");
  expect(response2.body.job).toEqual(expect.objectContaining(job1));
});

test("invalid id results in no job", async () => {
  const token = await getToken2();
  const fakeJobId = mongoose.Types.ObjectId();

  const response = await request(app)
    .get(`/api/jobs/${fakeJobId}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(400);

  expect(response.body.error).toMatch(`No job with id ${fakeJobId} was found.`);
});

test("update a job", async () => {
  const token = await getToken();

  const firstJob = {
    company: "Monkey Eating Co.",
    position: "Monkey Eater",
    status: "interview",
  };
  const updatedJob = {
    company: "Gorilla Eating Co.",
    position: "Gorilla Cager",
    status: "declined",
  };

  const response = await request(app)
    .post("/api/jobs/")
    .send(firstJob)
    .set("Authorization", `Bearer ${token}`)
    .expect(201);

  const response2 = await request(app)
    .patch(`/api/jobs/${response.body.job._id}`)
    .send(updatedJob)
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  expect(response2.body.message).toMatch("Job successfully updated!");
  expect(response2.body.job.company).toMatch(updatedJob.company);
  expect(response2.body.job.position).toMatch(updatedJob.position);
  expect(response2.body.job.status).toMatch(updatedJob.status);

  const user = await User.findById(response2.body.job.userId);
  expect(user.username).toMatch("zhila");
});

test("non creator cannot update a job", async () => {
  const token = await getToken();

  const otherUser = new User({
    username: "lemonysnicket",
    email: "lemonysnicket@gmail.com",
    password: "passworditi",
  });
  await otherUser.save();

  const otherUserJob = new Job({
    userId: otherUser._id,
    company: "Hacienda and Sons Co.",
    position: "Hacienda Manager",
    status: "interview",
  });
  otherUserJob.save();

  const updatedJob = {
    company: "Hacienda and Sons Inc.",
    position: "Hacienda Farmer",
    status: "declined",
  };

  const response = await request(app)
    .patch(`/api/jobs/${otherUserJob._id}`)
    .send(updatedJob)
    .set("Authorization", `Bearer ${token}`)
    .expect(403);

  expect(response.body.error).toMatch(
    "You are not authorized to edit this job."
  );
});

test("delete a job", async () => {
  const token = await getToken();

  const firstJob = {
    company: "Banana Republic",
    position: "Banana Pealer!",
    status: "declined",
  };

  const response = await request(app)
    .post("/api/jobs/")
    .send(firstJob)
    .set("Authorization", `Bearer ${token}`)
    .expect(201);

  const response2 = await request(app)
    .delete(`/api/jobs/${response.body.job._id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  expect(response2.body.message).toMatch("Job successfully deleted!");
  expect(response2.body.job.company).toMatch(firstJob.company);
  expect(response2.body.job.position).toMatch(firstJob.position);
  expect(response2.body.job.status).toMatch(firstJob.status);

  const user = await User.findById(response2.body.job.userId);
  expect(user.username).toMatch("zhila");
});

test("unauthorized user cannot delete a job", async () => {
  const token = await getToken();

  const firstJob = {
    company: "Beer Brewery Corp.",
    position: "Beer mixer",
    status: "declined",
  };

  await request(app)
    .post("/api/users/")
    .send({
      username: "hamida",
      email: "hamida@gmail.com",
      password: "perfezania",
    })
    .expect(201);

  const userResponse = await request(app)
    .post("/api/users/login")
    .send({ username: "hamida", password: "perfezania" })
    .expect(200);

  const response = await request(app)
    .post("/api/jobs/")
    .send(firstJob)
    .set("Authorization", `Bearer ${userResponse.body.token}`)
    .expect(201);

  const response2 = await request(app)
    .delete(`/api/jobs/${response.body.job._id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(403);

  expect(response2.body.error).toMatch(
    "You are not authorized to delete this job."
  );
});
