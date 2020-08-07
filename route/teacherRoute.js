const router = require("express").Router();
const xlxs = require("xlsx");

const Teacher = require("../model/Teacher");
const validate = require("../verify/validateData");

//CREATE NEW TEACHER
router.post("/", async (req, res) => {
  //validate data before save teacher
  const valid = await validate.createTeacherValidation({ ...req.body });
  if (valid.error)
    return res.status(400).json({ message: valid.error.details[0].message });

  //check teacher id exist yet
  const find = await Teacher.findOne({ teacher_id: req.body.teacher_id });
  if (find) return res.status(400).json({ message: "Teacher_id exist" });

  //init teacher
  const teacher = new Teacher({ id_user: req.user._id, ...req.body });
  try {
    //save teacher
    const save = await teacher.save();
    res.status(200).json(save);
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

//GET LIST TEACHER OF USER
router.get("/", async (req, res) => {
  try {
    const findTeacher = await Teacher.find({ id_user: req.user._id });
    res.status(200).json({ total: findTeacher.length, data: findTeacher });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

module.exports = router;
