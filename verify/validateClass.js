const joi = require("@hapi/joi");

//Validate data before CREATE LIST CLASS
const createClassValidation = (data) => {
  const schema = joi.object({
    grade: joi.number().integer().max(12).min(10).required(),
    number: joi.number().integer().max(25).min(1).required(),
  });

  return schema.validate(data);
};

//Validate data before UPDATE CLASS
const updateClassValidation = (data) => {
  const schema = joi.object({
    id: joi.string().required(),
    name: joi.string().min(1).max(10).required(),
  });

  return schema.validate(data);
};

//Validate ID CLASS
const idClassValidation = (data) => {
  const schema = joi.object({
    id: joi.string().required(),
  });

  return schema.validate(data);
};

module.exports.idClassValidation = idClassValidation;
module.exports.updateClassValidation = updateClassValidation;
module.exports.createClassValidation = createClassValidation;
