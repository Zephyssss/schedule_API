const router = require("express").Router();
const xlsx = require("xlsx");

const Subject = require("../model/Subject");
const Class = require("../model/Class");
const validate = require("../verify/validateData");

//GET SUBJECT
router.get("/", async (req, res) => {
  if (req.query.id != undefined) {
    try {
      const findSubject = await Subject.findById(req.query.id);
      if (!findSubject)
        return res.status(404).json({ message: "Not found subject" });
      res.status(200).json(findSubject);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    try {
      const listSubject = await Subject.find({ id_user: req.user._id });

      const func = (l) => {
        let data = new Set();
        for (let i of l) {
          let temp = {};
          temp["sortName"] = i.sortName;
          temp["grade"] = i.grade;
          if (!data.has(JSON.stringify(temp))) data.add(JSON.stringify(temp));
        }
        return Array.from(data).map((ob) => JSON.parse(ob));
      };

      const data = await func(listSubject);

      res.status(200).json({ total: data.length, data: data });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
});

//GET LIST REQUIRE
router.get("/require", async (req, res) => {
  const excel = await xlsx.readFile("./data/data.xlsx");
  const data = xlsx.utils.sheet_to_json(excel.Sheets["require_subject"]);
  res.status(200).json({ total: data.length, data: data });
});

//GET SUBJECT OF CLASS
router.get("/byclass", async (req, res) => {
  const valid = await validate.idClassValidation({ idClass: req.query.id });
  if (valid.error)
    return res.status(400).json({ message: valid.error.details[0].message });

  try {
    const findclass = await Subject.findOne({ id_class: req.query.id });
    if (!findclass) return res.status(404).json({ message: "Not found class" });
    const listSubject = await Subject.find({ id_class: req.query.id });
    res.status(200).json({ total: listSubject.length, data: listSubject });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//CREATE NEW SUBJECT
router.post("/", async (req, res) => {
  //validata date before create subject
  const valid = await validate.createSubjectValidation({ ...req.body });
  if (valid.error)
    return res.status(400).json({ message: valid.error.details[0].message });

  try {
    //check class exist yet
    const fclass = await Class.findById(req.body.idClass);
    if (!fclass) return res.status(404).json({ message: "Class not found" });

    //set default require
    let newRequire = "0000000000";
    if (req.body.require != undefined) newRequire = req.body.require;

    //check sort name
    const findclass = await Subject.findOne({
      id_class: req.body.idClass,
      sortName: req.body.sortName.trim(),
    });
    if (findclass)
      return res.status(400).json({ message: "Sort name is exist" });

    const subject = Subject({
      require: newRequire,
      id_user: req.user._id,
      id_class: fclass._id,
      name: req.body.name,
      sortName: req.body.sortName.trim(),
      grade: fclass.grade,
      nLesson: req.body.nLesson,
    });

    const save = await subject.save();
    res.status(200).json(save);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//UPDATE SUBJECT
router.put("/", async (req, res) => {
  const valid = await validate.updateSubjectValidation({ ...req.body });
  if (valid.error)
    return res.status(400).json({ message: valid.error.details[0].message });

  const findSub = await Subject.findById(req.body.id);
  if (!findSub) return res.status(404).json({ message: "Not found subjet" });

  if (req.body.name != undefined) findSub.name = req.body.name;
  if (req.body.nLesson != undefined) findSub.nLesson = req.body.nLesson;
  if (req.body.require != undefined) findSub.require = req.body.require;
  if (req.body.sortName != undefined) {
    if (req.body.sortName.trim() != findSub.sortName.trim()) {
      const cSubjectwithName = await Subject.findOne({
        id_class: findSub.id_class,
        sortName: req.body.sortName.trim(),
      });
      console.log(cSubjectwithName);
      if (cSubjectwithName)
        return res.status(400).json({ message: "Sort Name exist" });
      findSub.sortName = req.body.sortName.trim();
    }
  }

  try {
    const update = await Subject.findByIdAndUpdate(findSub._id, findSub);
    const find = await Subject.findById(findSub._id);
    res.status(200).json(find);
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

//DELETE SUBJECT BY ID
router.delete("/", async (req, res) => {
  //validate data before delete class
  const valid = await validate.idSubjectValidation({ ...req.body });
  if (valid.error)
    return res.status(400).json({ message: valid.error.details[0].message });

  try {
    const del = await Subject.findByIdAndDelete(req.body.idSubject);
    if (!del) return res.status(404).json({ message: "Not found" });
    res.status(200).json(del);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
