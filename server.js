const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const userRoute = require("./route/userRoute");
const classRoute = require("./route/classRoute");
const subjectRoute = require("./route/subjectRoute");
const teacherRoute = require("./route/teacherRoute");
const verify = require("./verify/verifyToken");

//config with .env and app
dotenv.config();
const app = express();

//connect to Database
mongoose.connect(process.env.CONNECT_DB, { useNewUrlParser: true }, () => {
  console.log("Connect to DB");
});

//use middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.get("/document", (req, res) => res.send("<a href=" + process.env.DOC + ">Doccument</a>"));
app.use("/users", userRoute);

//check token
app.use(verify);
app.use("/classes", classRoute);
app.use("/subjects",subjectRoute);
app.use("/teachers",teacherRoute);

//listen request from port process.env.PORT
app.listen(process.env.PORT, () => {
  console.log("Server is running in port: ", process.env.PORT);
});
