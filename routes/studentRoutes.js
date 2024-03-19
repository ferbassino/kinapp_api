const router = require("express").Router();

const {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentControllers");

router.get("/api/student", getStudents);
router.post("/api/student", createStudent);
router.put("/api/student/:id", updateStudent);
router.delete("/api/student/:id", deleteStudent);
module.exports = router;
