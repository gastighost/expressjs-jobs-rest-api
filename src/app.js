require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const app = express();

const notFound = require("./middleware/not-found");
const errorMiddleWare = require("./middleware/error-middleware");

const userRoutes = require("./routes/user-routes");
const jobRoutes = require("./routes/job-routes");

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);

app.use(notFound);
app.use(errorMiddleWare);

module.exports = app;
