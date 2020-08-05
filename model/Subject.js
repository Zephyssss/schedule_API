const mongoose = require("mongoose");

const Subject = new mongoose.Schema(
  {
    id_user: {
      type: String,
      required: true,
    },
    id_class: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    sortName: {
      type: String,
      required: true,
    },
    grade: {
      type: Number,
      require: true,
    },
    nLesson: {
      type: Number,
      required: true,
    },
    require: {
      type: String,
      default: "0000000000",
    },
  },
  {
    collection: "subject",
  }
);

module.exports = mongoose.model("subject", Subject);
