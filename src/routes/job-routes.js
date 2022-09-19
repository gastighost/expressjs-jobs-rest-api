const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  getJobs,
  createJob,
  getJob,
  updateJob,
  deleteJob,
} = require("../controllers/job-controller");

router.use(auth);

router.get("/", getJobs);

router.post("/", createJob);

router.get("/:jobId", getJob);

router.patch("/:jobId", updateJob);

router.delete("/:jobId", deleteJob);

module.exports = router;
