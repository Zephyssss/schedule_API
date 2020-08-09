const joi = require("@hapi/joi");
const { idSubjectValidation, updateSubjectValidation } = require("./validateSubject");

//Validate data before CREATE TEACHER
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

//Validate data before UPDATE TEACHER
const updateTeacherValidation = (data) => {
  const schema = joi.object({
    id: joi.string().required(),
    name: joi.string(),
    teacher_id: joi.string().min(1).max(10),
    period_per_week: joi.number().integer().min(1).max(30),
    grade: joi.number().integer().min(10).max(12),
    subject: joi.string().min(1).max(10),
    require: joi.string().length(10).pattern(new RegExp("^[0-1]*$")),
  });

  return schema.validate(data);
};

//Validate ID TEACHER
const idTeacherValidation = (data) => {
  const schema = joi.object({
    id: joi.string().required(),
  });

  return schema.validate(data);
};

module.exports.updateTeacherValidation = updateTeacherValidation;
module.exports.idTeacherValidation = idTeacherValidation;
module.exports.createTeacherValidation = createTeacherValidation;
