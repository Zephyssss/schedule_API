const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../model/User");
const validate = require("../verify/validateData");

//REGISTER ACCOUNT
router.post("/register", async (req, res) => {
  //Validate data before save user
  const valid = await validate.registerValidation({...req.body});
  if (valid.error)
    return res.status(400).json({ message: valid.error.details[0].message });

  const emaiExist = await User.findOne({ email: req.body.email });
  if (emaiExist) return res.status(400).json({ message: "Email exist" });

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
    res.status(200).send(savedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  //Validate data before check login
  const valid= await validate.loginValidation({...req.body})
  if (valid.error)
    return res.status(400).json({ message: valid.error.details[0].message });

  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({ message: "Email or password wrong" });

  //Compare password
  const acceptLogin = await bcrypt.compare(req.body.password, user.password);
  if (!acceptLogin) return res.json({ message: "Email or password wrong" });

  //Send token
  console.log(process.env.TOKEN_SECRET);
  const Token = jwt.sign({ _id: user._id },process.env.TOKEN_SECRET);
  res.header("auth-token", Token);
  res.json({ token: Token });
});

module.exports = router;
