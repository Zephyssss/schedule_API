const router = require("express").Router();
const xlsx = require("xlsx");

const Subject = require("../model/Subject");
const Class = require("../model/Class");
const validate = require("../verify/validateSubject");

//GET ALL SUBJECT
router.get("/", async (req, res) => {
  try {
    const listSubject = await Subject.find({ id_user: req.user._id });

    const func = (listSubject) => {
      let data = new Set();
      for (let i of listSubject) {
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
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

//GET LIST REQUIRE
router.get("/requires", async (req, res) => {
  const excel = await xlsx.readFile("./data/data.xlsx");
  const data = xlsx.utils.sheet_to_json(excel.Sheets["require_subject"]);
  res.status(200).json({ total: data.length, data: data });
});

//GET SPECIAL SUBJECT
router.get("/:id", async (req, res) => {
  //Validate id before get
  const valid = await validate.idSubjectValidation({ id: req.params.id });
  if (valid.error)
    return res.status(400).json({ error: "Bad request", message: valid.error.details[0].message });

  try {
    const findSubject = await Subject.findById(req.params.id);
    if (!findSubject)
      return res.status(404).json({ error: "Not found", message: "Subject not found" });
    res.status(200).json(findSubject);
  } catch (err) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

//GET SUBJECT OF CLASS
router.get("/byclass/:id", async (req, res) => {
  const valid = await validate.idSubjectValidation({ id: req.params.id });
  if (valid.error)
    return res.status(400).json({error:"Bad request", message: valid.error.details[0].message });

  try {
    const findclass = await Subject.findOne({ id_class: req.params.id });
    if (!findclass) return res.status(404).json({error:"Not found", message: "Class not found" });
    const listSubject = await Subject.find({ id_class: req.params.id });
    res.status(200).json({ total: listSubject.length, data: listSubject });
  } catch (err) {
    res.status(400).json({error:"Bad request", message: err.message });
  }
});

//CREATE NEW SUBJECT
router.post("/", async (req, res) => {
  //validata date before create subject
  const valid = await validate.createSubjectValidation({ ...req.body });
  if (valid.error)
    return res.status(400).json({error:"Bad request", message: valid.error.details[0].message });

  try {
    //check class exist yet
    const fclass = await Class.findById(req.body.idClass);
    if (!fclass) return res.status(404).json({error:"Not found", message: "Class not found" });

    //set default require
    let newRequire = "0000000000";
    if (req.body.require != undefined) newRequire = req.body.require;

    //check sort name
    const findclass = await Subject.findOne({
      id_class: req.body.idClass,
      sortName: req.body.sortName.trim(),
    });
    if (findclass)
      return res.status(409).json({error:"Conflict", message: "Sort name is exist" });

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
    res.status(201).json(save);
  } catch (err) {
    res.status(400).json({error:"Bad request", message: err.message });
  }
});

//UPDATE SUBJECT
router.put("/:id", async (req, res) => {
  //Validate data before update
  const valid = await validate.updateSubjectValidation({id:req.params.id, ...req.body });
  if (valid.error)
    return res.status(400).json({error:"Bad request", message: valid.error.details[0].message });

  const findSub = await Subject.findById(req.params.id);
  if (!findSub) return res.status(404).json({error:"Not found", message: "Subject not found" });

  if (req.body.name != undefined) findSub.name = req.body.name;
  if (req.body.nLesson != undefined) findSub.nLesson = req.body.nLesson;
  if (req.body.require != undefined) findSub.require = req.body.require;
  if (req.body.sortName != undefined) {
    if (req.body.sortName.trim() != findSub.sortName.trim()) {
      const cSubjectwithName = await Subject.findOne({
        id_class: findSub.id_class,
        sortName: req.body.sortName.trim(),
      });
      if (cSubjectwithName)
        return res.status(409).json({ error:"Conflict", message: "sortName exist" });
      findSub.sortName = req.body.sortName.trim();
    }
  }

  try {
    const update = await Subject.findByIdAndUpdate(findSub._id, findSub);
    const find = await Subject.findById(findSub._id);
    res.status(200).json(find);
  } catch (err) {
    res.status(400).json({error:"Bad request", message: err });
  }
});

//DELETE SUBJECT BY ID
router.delete("/:id", async (req, res) => {
  //validate data before delete class
  const valid = await validate.idSubjectValidation({ id: req.params.id});
  if (valid.error)
    return res.status(400).json({error:"Bad request", message: valid.error.details[0].message });

  try {
    const del = await Subject.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({error:"Not found", message: "Subject not found" });
    res.status(200).json(del);
  } catch (err) {
    res.status(400).json({error:"Bad request", message: err.message });
  }
});

module.exports = router;
