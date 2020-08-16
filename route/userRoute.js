const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../model/User");
const validate = require("../verify/validateUser");

//REGISTER ACCOUNT
router.post("/register", async (req, res) => {
  //Validate data before save user
  const valid = await validate.registerValidation({ ...req.body });
  if (valid.error)
    return res.status(400).json({ error: "Bad request", message: valid.error.details[0].message });

  //Check email
  const emaiExist = await User.findOne({ email: req.body.email });
  if (emaiExist)
    return res.status(409).json({ error: "Conflict", message: "Email exist" });

  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  //Save user and return infor for client
  const user = User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
  });
  try {
    const savedUser = await user.save();
    res.status(201).send(savedUser);
  } catch (err) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  //Validate data before check login
  const valid = await validate.loginValidation({ ...req.body });
  if (valid.error)
    return res.status(400).json({ error: "Bad request", message: valid.error.details[0].message });

  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({ error: "Bad request", message: "Email or password wrong" });

  //Compare password
  const acceptLogin = await bcrypt.compare(req.body.password, user.password);
  if (!acceptLogin)
    return res.status(400).json({ error: "Bad request", message: "Email or password wrong" });

  //Send token
  const Token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", Token);
  res.status(200).json({ token: Token , username: user.name});
});

module.exports = router;
