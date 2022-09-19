const { Schema, model } = require("mongoose");

const jobSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  company: {
    type: String,
    required: [true, "Please provide a company name."],
    maxlength: 50,
  },
  position: {
    type: String,
    required: [true, "Please provide a position."],
    maxlength: 100,
  },
  status: {
    type: String,
    enum: ["interview", "declined", "pending"],
    default: "pending",
  },
});

module.exports = model("Job", jobSchema);
