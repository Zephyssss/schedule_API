const router = require("express").Router();
const xlsx = require("xlsx");

const Teacher = require("../model/Teacher");
const Subject = require("../model/Subject");
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

  //check grade subject
  const checkGradeSubject = await Subject.findOne({
    id_user: req.user._id,
    sortName: req.body.subject.trim(),
    grade: req.body.grade,
  });
  if (!checkGradeSubject)
    return res
      .status(409)
      .json({ error: "Conflict", message: "Grade-Subject don't exist" });

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

//CREATE TEACHER BY EXCEL FOR TEST
// router.post("/byexcel", async (req, res) => {
//   const excel = await xlsx.readFile("./data/data.xlsx");
//   const data = xlsx.utils.sheet_to_json(excel.Sheets["teacher"]);
//   for (let i in data) {
//     const teacher = new Teacher({ id_user: req.user._id, ...data[i] });
//     try {
//       const save = await teacher.save();
//     } catch (err) {
//       res.status(400).json({ error: "Bad request", message: err });
//     }
//   }
//   res.status(201).send("success");
// });

//GET LIST TEACHER OF USER
router.get("/", async (req, res) => {
  try {
    const findTeacher = await Teacher.find({ id_user: req.user._id });
    res.status(200).json({ total: findTeacher.length, data: findTeacher });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

//GET LIST REQUIRE
router.get("/requires", async (req, res) => {
  const excel = await xlsx.readFile("./data/data.xlsx");
  const data = xlsx.utils.sheet_to_json(excel.Sheets["require_teacher"]);
  res.status(200).json({ total: data.length, data: data });
});

//GET SPECIAL TEACHER
router.get("/:id", async (req, res) => {
  const valid = validate.idTeacherValidation({ id: req.params.id });
  if (valid.error)
    return res
      .status(400)
      .json({ error: "Bad request", message: valid.error.details[0].message });

  try {
    const findTeacher = await Teacher.findOne({ _id: req.params.id });
    if (!findTeacher)
      res
        .status(404)
        .json({ error: "Not found", message: "Teacher not found" });
    res.status(200).json(findTeacher);
  } catch (err) {
    res.status(400).json({ error: "Bad request", message: err });
  }
});

router.put("/:id", async (req, res) => {
  //Validate data before update
  const valid = await validate.updateTeacherValidation({
    id: req.params.id,
    ...req.body,
  });
  if (valid.error)
    return res
      .status(400)
      .json({ error: "Bad request", message: valid.error.details[0].message });

  //Find teacher
  const findTeacher = await Teacher.findOne({ _id: req.params.id });
  if (!findTeacher)
    return res
      .status(404)
      .json({ error: "Not found", message: "Teacher not found" });

  //Check teacher_id
  if (req.body.teacher_id != undefined) {
    if (req.body.teacher_id.trim() != findTeacher.teacher_id.trim()) {
      const find = await Teacher.findOne({
        id_user: req.user._id,
        teacher_id: req.body.teacher_id.trim(),
      });
      if (find)
        return res
          .status(409)
          .json({ error: "Conflict", message: "Teacher_id is exist" });
      findTeacher.teacher_id = req.body.teacher_id.trim();
    }
  }

  //update
  if (req.body.name != undefined) findTeacher.name = req.body.name;
  if (req.body.period_per_week != undefined)
    findTeacher.period_per_week = req.body.period_per_week;
  if (req.body.grade != undefined) findTeacher.grade = req.body.grade;
  if (req.body.subject != undefined)
    findTeacher.subject = req.body.subject.trim();
  if (req.body.require != undefined) findTeacher.require = req.body.require;

  //check grade subject
  const checkGradeSubject = await Subject.findOne({
    id_user: req.user._id,
    sortName: findTeacher.subject,
    grade: findTeacher.grade,
  });
  if (!checkGradeSubject)
    return res
      .status(409)
      .json({ error: "Conflict", message: "Grade-Subject don't exist" });

  //update on database
  try {
    const update = await Teacher.findByIdAndUpdate(req.params.id, findTeacher);
    res.status(201).json(findTeacher);
  } catch (err) {
    res.status(400).json({ error: "Bad request", message: err });
  }
});

router.delete("/:id", async (req, res) => {
  const valid = await validate.idTeacherValidation({ id: req.params.id });
  if (valid.error)
    return res
      .status(400)
      .json({ error: "Bad request", message: valid.error.details[0].message });

  try {
    const del = await Teacher.findByIdAndDelete(req.params.id);
    if (!del)
      res
        .status(404)
        .json({ error: "Not found", message: "Teacher not found" });
    res.status(200).json(del);
  } catch (err) {
    res.status(400).json({ error: "Bad request", message: err });
  }
});

module.exports = router;
