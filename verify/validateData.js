const joi = require("@hapi/joi");

//Validate data of req.body before REGISTER account
const registerValidation = (data) => {
  const schema = joi
    .object({
      name: joi.string().min(3).max(30).required(),
      email: joi.string().email(),
      password: joi.string().pattern(new RegExp("^[a-zA-Z0-9]{6,30}$")),
      repeat_password: joi.ref("password"),
    })
    .with("password", "repeat_password");

  return schema.validate(data);
};

//Validate data of req.body before LOGIN
const loginValidation = (data) => {
  const schema = joi.object({
    email: joi.string().email(),
    password: joi.string().pattern(new RegExp("^[a-zA-Z0-9]{6,30}$")),
  });

  return schema.validate(data);
};

//Create list class include grade and number
const createClassValidation = (data) => {
  const schema = joi.object({
    grade: joi.number().integer().max(12).min(10),
    number: joi.number().integer().max(25).min(1),
  });

  return schema.validate(data);
};

//Update class
const updateClassValidation = (data) => {
  const schema = joi.object({
    idClass: joi.string().required(),
    name: joi.string().min(1).max(10).required(),
  });

  return schema.validate(data);
};

//id class
const idClassValidation = (data) => {
  const schema = joi.object({
    idClass: joi.string().required(),
  });

  return schema.validate(data);
};

module.exports.idClassValidation= idClassValidation,
module.exports.updateClassValidation= updateClassValidation,
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.createClassValidation = createClassValidation;
