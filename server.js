const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const userRoute = require("./route/userRoute");
const classRoute = require("./route/classRoute");
const verify = require("./verify/verifyToken");

//config with .env
dotenv.config();

//connect to Database
mongoose.connect(process.env.CONNECT_DB, { useNewUrlParser: true }, () => {
  console.log("Connect to DB");
});

//use middleware
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.get("/document", (req, res) =>
  res.send("<a href=" + process.env.DOC + ">Doccument</a>")
);
app.use("/user", userRoute);

//check token
app.use(verify);
app.use("/class", classRoute);

//listen request from port process.env.PORT
app.listen(process.env.PORT, () => {
  console.log("Server is running in port: ", process.env.PORT);
});
