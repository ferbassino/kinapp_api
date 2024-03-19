const Student = require("../models/studentModel");

exports.getStudents = async (req, res) => {
  const students = await Student.find({});
  res.json({ success: true, students: students });
};
// -----------------update
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Student.findByIdAndUpdate(
      id,
      {
        comision: req.body.comision,
      },
      { new: true }
    );
    res.json({ success: true, student: result });
  } catch (error) {
    console.log(error);
  }
};

exports.createStudent = async (request, response) => {
  const {
    dni,
    ingreso,
    apellido,
    nombres,
    comision,
    horarioComision,
    cursada,
  } = request.body;
  const studentDni = await Student.findOne({ dni });
  if (studentDni)
    return response.json({
      success: false,
      message: "Alumno ya registrado",
    });
  const student = await Student({
    dni,
    ingreso,
    apellido,
    nombres,
    comision,
    horarioComision,
    cursada,
  });
  await student.save();
  response.json({
    success: true,
    student: student,
  });
};
// ---------------------------------create

exports.deleteStudent = async (req, res) => {
  try {
    const response = await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true, response });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};
