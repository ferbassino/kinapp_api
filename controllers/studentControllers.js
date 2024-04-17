const Student = require("../models/studentModel");

exports.getStudents = async (req, res) => {
  const students = await Student.find({});
  res.json({ success: true, students: students });
};
exports.getStudent = async (request, response) => {
  const { id } = request.params;
  try {
    const student = await Student.findById(id);

    if (student) {
      response.json({
        success: true,
        student,
      });
    }
    if (!student) {
      console.log(error.message);
      response.status(400).end();
    }
  } catch (error) {
    console.log(error.message);
    response.status(400).end();
  }
};
// -----------------update
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Student.findByIdAndUpdate(
      id,
      {
        comision: req.body.comision,
        dni: req.body.dni,
        ingreso: req.body.ingreso,
        apellido: req.body.apellido,
        nombres: req.body.nombres,
        horarioComision: req.body.horarioComision,
        cursada: req.body.curdada,
        roles: req.body.roles,
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
