const router = require("express").Router();

const Class = require("../model/Class");
const Subject = require("../model/Subject");
const Teacher = require("../model/Teacher");

//Find class have lesson MAX
maxLengthWithRows = (arr) => {
  let max = 0;
  for (let i of arr) {
    if (i.length > max) max = i.length;
  }
  return max;
};

//Check conflict teacher
isConflictTeacher = (list, teacher) => {
  for (let i of list) {
    if (typeof i.teacher === undefined) continue;
    if (i.teacher === teacher) return true;
  }
  return false;
};

//GENERATE SCHEDULING SCHOOL
router.get("/", async (req, res) => {
  //Declare variable
  let listSubject = [];
  let schedule = [];
  let listClass;
  let listTeacher;

  //Get data for database
  try {
    listClass = await Class.find({ id_user: req.user._id });
    listTeacher = await Teacher.find({ id_user: req.user._id });
    for (let class_i of listClass) {
      const subject = await Subject.find({ id_class: class_i._id });
      listSubject.push(subject);
    }
  } catch (err) {
    res.status(400).json({ message: "Get data fail" });
  }

  //Picking teacher for subject
  for (let subjectOfClass_i of listSubject) {
    for (let subject_i = 0; subject_i < subjectOfClass_i.length; subject_i++) {
      if (
        subjectOfClass_i[subject_i].sortName === "Chào cờ" ||
        subjectOfClass_i[subject_i].sortName === "SHCN"
      ) {
        subjectOfClass_i.splice(subject_i, 1);
        subject_i--;
        continue;
      }

      let key = true;
      for (let teacher_i of listTeacher) {
        if (
          subjectOfClass_i[subject_i].grade == teacher_i.grade &&
          subjectOfClass_i[subject_i].sortName == teacher_i.subject &&
          subjectOfClass_i[subject_i].nLesson <= teacher_i.period_per_week
        ) {
          subjectOfClass_i[subject_i]["teacher"] = teacher_i.teacher_id;
          teacher_i.period_per_week -= subjectOfClass_i[subject_i].nLesson;
          key = false;
          break;
        }
      }
      if (key)
        return res.status("400").json({
          message:
            subjectOfClass_i[subject_i].Name +
            " " +
            subjectOfClass_i[subject_i].grade +
            " don't have teacher!",
        });
    }
  }

  schedule.push(listClass);
  const max = await maxLengthWithRows(listSubject);
  for (let i = 0; i < max; i++) {
    let lesson_i = [];
    for (let j = 0; j < listSubject.length; j++) {
      if (listSubject[j].length === 0) {
        lesson_i.push({});
        continue;
      }

      if (lesson_i.length === 0) {
        lesson_i.push({
          subject: listSubject[0][0].sortName,
          teacher: listSubject[0][0].teacher,
        });
        listSubject[0][0].nLesson--;
        if (listSubject[0][0].nLesson === 0) listSubject[0].splice(0, 1);
        continue;
      }

      let key = true;
      for (let k = 0; k < listSubject[j].length; k++) {
        if (
          listSubject[j][k].nLesson > 0 &&
          !isConflictTeacher(lesson_i, listSubject[j][k].teacher)
        ) {
          lesson_i.push({
            subject: listSubject[j][k].sortName,
            teacher: listSubject[j][k].teacher,
          });
          key = false;
          listSubject[j][k].nLesson--;
          if (listSubject[j][k].nLesson === 0) listSubject[j].splice(k, 1);
          break;
        }
      }
      if (key) return res.status(400).json({ message: "Fail!" });
    }
    schedule.push(lesson_i);
  }

  res.status(200).json(schedule);
});

module.exports = router;
