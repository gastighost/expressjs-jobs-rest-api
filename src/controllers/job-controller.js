const asyncWrapper = require("../utils/async");
const Job = require("../models/job");
const createError = require("../utils/custom-error");

exports.getJobs = asyncWrapper(async (req, res) => {
  const jobs = await Job.find({ userId: req.user.userId });
  res.status(200).json({ message: "Jobs successfully retrieved!", jobs: jobs });
});

exports.createJob = asyncWrapper(async (req, res, next) => {
  const { company, position, status } = req.body;

  if (!company || !position) {
    return next(createError("Please enter a company and position.", 400));
  }

  const job = new Job({ userId: req.user.userId, company, position, status });
  await job.save();

  res.status(201).json({ message: "Job successfully created!", job: job });
});

exports.getJob = asyncWrapper(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await Job.findOne({ userId: req.user.userId, _id: jobId });

  if (!job) {
    return next(createError(`No job with id ${jobId} was found.`, 400));
  }

  res.status(200).json({ message: "Job successfully retrieved!", job: job });
});

exports.updateJob = asyncWrapper(async (req, res, next) => {
  const { jobId } = req.params;
  const { company, position, status } = req.body;

  const job = await Job.findOneAndUpdate(
    { _id: jobId, userId: req.user.userId },
    { company, position, status },
    { new: true }
  );

  if (!job) {
    return next(createError("You are not authorized to edit this job.", 403));
  }

  res.status(200).json({ message: "Job successfully updated!", job: job });
});

exports.deleteJob = asyncWrapper(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await Job.findOneAndDelete({
    _id: jobId,
    userId: req.user.userId,
  });

  if (!job) {
    return next(createError("You are not authorized to delete this job.", 403));
  }

  res.status(200).json({ message: "Job successfully deleted!", job: job });
});
