const router = require("express").Router();

const Class = require("../model/Class");
const Subject = require("../model/Subject");
const Teacher = require("../model/Teacher");

//check class Lesson null
isLastRowNull = (arr) => {
  const last = arr.length - 1;
  for (let subject_i of arr[last]) {
    if (Object.keys(subject_i).length != 0) return false;
  }
  return true;
};

//optimize schedule
optimizeSchedule = (column, schedule) => {
  for (let current = 1; current < schedule.length - 1; current++) {
    if (Object.keys(schedule[current][column]).length != 0) continue;

    for (let right = schedule.length - 1; right > current; right--) {
      if (Object.keys(schedule[right][column]).length === 0) continue;

      let key = true;
      for (let left = 1; left < current; left++) {
        if (
          !isConflictTeacher(schedule[left], schedule[right][column]) &&
          !isConflictTeacher(schedule[current], schedule[left][column])
        ) {
          schedule[current][column] = schedule[left][column];
          schedule[left][column] = schedule[right][column];
          schedule[right][column] = {};
          key = false;
          break;
        }
      }
      if (!key) break;
    }
  }
};

//get list class
getListClass = (listClass) => {
  list = [];
  for (let class_i of listClass) {
    list.push({ name: class_i.name });
  }
  return list;
};

//Check conflict teacher
isConflictTeacher = (list, teacher) => {
  for (let i of list) {
    if (typeof i.teacher === undefined) continue;
    if (i.teacher === teacher) return true;
  }
  return false;
};

//PICK TEACHER for subject
pickTeacherForSubject = (listTeacher, subject) => {
  for (let i = 0; i < listTeacher.length; i++) {
    if (
      subject.grade === listTeacher[i].grade &&
      subject.sortName === listTeacher[i].subject &&
      subject.nLesson <= listTeacher[i].period_per_week
    ) {
      return i;
    }
  }
  return -1;
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
    res.status(500).json({ message: "Get data fail" });
  }

  //Picking teacher for subject
  for (let subjectOfClass_i of listSubject) {
    for (let subject_i = 0; subject_i < subjectOfClass_i.length; subject_i++) {
      const indexTeacher = await pickTeacherForSubject(
        listTeacher,
        subjectOfClass_i[subject_i]
      );
      if (indexTeacher != -1) {
        subjectOfClass_i[subject_i]["teacher"] = listTeacher[indexTeacher].teacher_id;
        listTeacher[indexTeacher].period_per_week -= subjectOfClass_i[subject_i].nLesson;
      } else {
        return res.status("500").json({
          message:
            subjectOfClass_i[subject_i].sortName + " don't have teacher!",
        });
      }
    }
  }

  //Scheduling school
  schedule.push(getListClass(listClass));
  while (!isLastRowNull(schedule)) {
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
        if (!isConflictTeacher(lesson_i, listSubject[j][k].teacher)) {
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
      if (key) lesson_i.push({});
    }
    schedule.push(lesson_i);
  }

  //optimal schedule
  for (let i = 0; i < listClass.length; i++) {
    optimizeSchedule(i, schedule);
  }
  //delete row null
  while (isLastRowNull(schedule)) schedule.splice(schedule.length - 1, 1);
  res.status(200).json(schedule);
});

module.exports = router;
