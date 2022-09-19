require("dotenv").config();

const app = require("./app");
const port = process.env.PORT;
const connectDb = require("./services/mongodb");

const start = async () => {
  try {
    await connectDb();
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
