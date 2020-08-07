const mongoose = require("mongoose");

const Teacher = new mongoose.Schema(
  {
    id_user: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    teacher_id: {
      type: String,
      required: true,
    },
    period_per_week: {
      type: Number,
      required: true,
    },
    grade: {
      type: Number,
      require: true,
    },
    subject: {
      type: String,
      required: true,
    },
    require: {
      type: String,
      default: "0000000000",
    },
  },
  {
    collection: "teacher",
  }
);

module.exports = mongoose.model("teacher", Teacher);
