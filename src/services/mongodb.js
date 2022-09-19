require("dotenv").config();
const mongoose = require("mongoose");

const connectDb = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Successully connected to db via mongoose!");
};

module.exports = connectDb;
