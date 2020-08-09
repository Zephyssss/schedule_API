const joi = require("@hapi/joi");

//Validate data before CREATE SUBJECT
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

//Validate data before UPDATE SUBJECT
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

//Validate ID SUBJECT
const idSubjectValidation = (data) => {
  const schema = joi.object({
    id: joi.string().required(),
  });

  return schema.validate(data);
};

module.exports.updateSubjectValidation = updateSubjectValidation;
module.exports.createSubjectValidation = createSubjectValidation;
module.exports.idSubjectValidation = idSubjectValidation;
