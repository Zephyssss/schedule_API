const mongoose = require("mongoose");

const Class = new mongoose.Schema(
  {
    id_user: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    grade: {
      type: Number,
      require: true,
    },
  },
  {
    collection: "class",
  }
);

module.exports = mongoose.model("class", Class);
