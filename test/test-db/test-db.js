const mongoose = require("mongoose");

exports.connectDb = async () => {
  try {
    await mongoose.connect(process.env.TEST_MONGODB_URI);
    console.log("Test db connected");
  } catch (error) {
    console.log(error);
  }
};

exports.disconnectDb = async () => {
  try {
    await mongoose.connection.close();
    console.log("Test db closed");
  } catch (error) {
    console.log(error);
  }
};
