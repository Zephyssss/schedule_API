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

//Create subject
const createSubjectValidation = (data) => {
  const schema = joi.object({
    idClass: joi.string().required(),
    name: joi.string().min(1).max(30).required(),
    sortName: joi.string().min(1).max(10).required(),
    nLesson: joi.number().integer().min(1).max(30).required(),
    require: joi.string().length(10).pattern(new RegExp("^[0-1]*$")),
  });

  return schema.validate(data);
};

//Update subject
const updateSubjectValidation = (data) => {
  const schema = joi.object({
    id: joi.string().required(),
    name: joi.string().min(1).max(30),
    sortName: joi.string().min(1).max(10),
    nLesson: joi.number().integer().min(1).max(30),
    require: joi.string().length(10).pattern(new RegExp("^[0-1]*$")),
  });

  return schema.validate(data);
};

//id subject
const idSubjectValidation = (data) => {
  const schema = joi.object({
    idSubject: joi.string().required(),
  });

  return schema.validate(data);
};

//Create teacher
const createTeacherValidation = (data) => {
  const schema = joi.object({
    name: joi.string().required(),
    teacher_id: joi.string().min(1).max(10).required(),
    period_per_week: joi.number().integer().min(1).max(30).required(),
    grade: joi.number().integer().min(10).max(12).required(),
    subject: joi.string().min(1).max(10).required(),
    require: joi.string().length(10).pattern(new RegExp("^[0-1]*$")),
  });

  return schema.validate(data);
};

module.exports.createTeacherValidation = createTeacherValidation;
module.exports.updateSubjectValidation = updateSubjectValidation;
module.exports.createSubjectValidation = createSubjectValidation;
module.exports.idSubjectValidation = idSubjectValidation;
module.exports.idClassValidation = idClassValidation;
module.exports.updateClassValidation = updateClassValidation;
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.createClassValidation = createClassValidation;
