const router = require("express").Router();
const xlsx = require("xlsx");

const Class = require("../model/Class");
const Subject = require("../model/Subject");
const validate = require("../verify/validateClass");

//CREATE A LIST CLASS WITH THE SAME GRADE
router.post("/", async (req, res) => {
  //validate data before create class
  const valid = await validate.createClassValidation({ ...req.body });
  if (valid.error)
    return res.status(400).json({ error: "Bad request", message: valid.error.details[0].message });

  //read list subject form excel
  const excel = await xlsx.readFile("./data/data.xlsx");
  const data = xlsx.utils.sheet_to_json(excel.Sheets["suggest"]);

  //count class equal grade for set name
  const start = await (await Class.find({ id_user: req.user._id, grade: req.body.grade })).length;

  //create list class include req.body.number class
  for (let i = 1; i <= req.body.number; i++) {
    const class_new = new Class({
      id_user: req.user._id,
      name: String(req.body.grade) + "A" + String(i + start),
      grade: req.body.grade,
    });

    try {
      //save class
      const save_class = await class_new.save();

      //create list
      for (let i = 0; i < data.length; i++) {
        if (data[i].grade == req.body.grade) {
          //define new object subject
          const subject = new Subject({
            id_user: req.user._id,
            id_class: save_class._id,
            name: data[i].name,
            sortName: data[i].sortName,
            grade: data[i].grade,
            nLesson: data[i].nLesson,
          });

          try {
            //Save subject
            subject.save();
          } catch (err) {
            res.status(400).json({ message: err.message });
          }
        }
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
  res.status(201).json({ message: "success" });
});

//GET CLASS BY ID
router.get("/:id", async (req, res) => {
  //validate id in params
  const valid = await validate.idClassValidation({ id: req.params.id });
  if (valid.error)
    return res.status(400).json({ error: "Bad request", message: valid.error.details[0].message });

  try {
    const getclass = await Class.findById(req.params.id);
    if (!getclass)
      return res.status(404).json({ error: "Not found", message: "Class not found" });
    res.status(200).json(getclass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//GET LIST CLASS
router.get("/", async (req, res) => {
  try {
    const list_class = await Class.find({ id_user: req.user._id });
    res.status(200).json({ total: list_class.length, data: list_class });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//DELETE CLASS BY ID
router.delete("/:id", async (req, res) => {
  //validate data before delete class
  const valid = await validate.idClassValidation({ id: req.params.id });
  if (valid.error)
    return res.status(400).json({ error: "Not found", message: valid.error.details[0].message });

  try {
    const del = await Class.findByIdAndDelete(req.params.id);
    if (!del)
      return res.status(404).json({ error: "Not found", message: "Class not found" });
    const delSub = await Subject.deleteMany({ id_class: del._id });
    res.status(200).json(del);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//UPDATE NAME OF CLASS BY ID
router.put("/:id", async (req, res) => {
  //validate id in params
  const valid = await validate.updateClassValidation({id: req.params.id, name: req.body.name });
  if (valid.error)
    return res.status(400).json({ error: "Bad request", message: valid.error.details[0].message });

  //check name before update
  const findbyName = await Class.findOne({ name: req.body.name });
  if (findbyName)
    return res.status(409).json({ error: "Conflict", message: "name is exist" });

  try {
    const update = await Class.findByIdAndUpdate(req.params.id, {name: req.body.name});
    const find = await Class.findOne({ _id: req.params.id });
    if (!find)
      return res.status(404).json({ error: "Not found", message: "Class not found" });
    res.status(200).json(find);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
