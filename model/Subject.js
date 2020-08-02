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
    nLession: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "subject",
  }
);

module.exports = mongoose.model("subject", Subject);
