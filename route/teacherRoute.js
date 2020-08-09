const router = require("express").Router();
const xlxs = require("xlsx");

const Teacher = require("../model/Teacher");
const validate = require("../verify/validateTeacher");

//CREATE NEW TEACHER
router.post("/", async (req, res) => {
  //validate data before save teacher
  const valid = await validate.createTeacherValidation({ ...req.body });
  if (valid.error)
    return res
      .status(400)
      .json({ error: "Bad request", message: valid.error.details[0].message });

  //check teacher id exist yet
  const find = await Teacher.findOne({ teacher_id: req.body.teacher_id });
  if (find)
    return res
      .status(409)
      .json({ error: "Conflict", message: "Teacher_id exist" });

  //init teacher
  const teacher = new Teacher({ id_user: req.user._id, ...req.body });
  try {
    //save teacher
    const save = await teacher.save();
    res.status(201).json(save);
  } catch (err) {
    res.status(400).json({ error: "Bad request", message: err });
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

//GET SPECIAL TEACHER
router.get("/:id", async (req, res) => {
  const valid = validate.idTeacherValidation({ id: req.params.id });
  if (valid.error)
    return res.status(400).json({ error: "Bad request", message: valid.error.details[0].message });

  try {
    const findTeacher = await Teacher.findById(req.params.id);
    res.status(200).json(findTeacher);
  } catch (err) {
    res.status(400).json({ error: "Bad request", message: err });
  }
});

module.exports = router;
