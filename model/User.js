const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 1,
      max: 255,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      min: 6,
      max: 255,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 1024,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "user",
  }
);

module.exports = mongoose.model("User", UserSchema);
