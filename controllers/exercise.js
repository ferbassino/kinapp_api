const Exercise = require("../models/exercise");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.createExercise = catchAsync(async (req, res, next) => {
  const {
    name,
    description,
    videoUrls,
    imageUrls,
    muscleGroups,
    difficulty,
    equipment,
    duration,
    calories,
    isPublic,
    creator,
    sensor,
  } = req.body;
  console.log("el sesnsor aqui ", sensor);

  // Validaciones básicas
  if (!name || !description) {
    return next(new AppError("Nombre y descripción son requeridos", 400));
  }

  // Validar URLs de videos
  if (videoUrls && videoUrls.length > 0) {
    if (videoUrls.length > 3) {
      return next(new AppError("No se pueden agregar más de 3 videos", 400));
    }
    for (const url of videoUrls) {
      if (!/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url)) {
        return next(
          new AppError(`${url} no es una URL válida de YouTube`, 400)
        );
      }
    }
  }

  // Validar URLs de imágenes
  if (imageUrls && imageUrls.length > 0) {
    if (imageUrls.length > 5) {
      return next(new AppError("No se pueden agregar más de 5 imágenes", 400));
    }
    for (const url of imageUrls) {
      if (!/\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url)) {
        return next(new AppError(`${url} no es una URL válida de imagen`, 400));
      }
    }
  }

  // Validar sensor si está presente
  if (sensor && sensor.useSensor) {
    if (!sensor.sensorType || !sensor.position || !sensor.description) {
      return next(
        new AppError(
          "Todos los campos del sensor son requeridos cuando useSensor es true",
          400
        )
      );
    }

    // Validar URLs de videos del sensor
    if (sensor.videoUrls && sensor.videoUrls.length > 0) {
      if (sensor.videoUrls.length > 2) {
        return next(
          new AppError(
            "No se pueden agregar más de 2 videos para el sensor",
            400
          )
        );
      }
      for (const url of sensor.videoUrls) {
        if (
          !/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url)
        ) {
          return next(
            new AppError(
              `${url} no es una URL válida de YouTube para el sensor`,
              400
            )
          );
        }
      }
    }

    // Validar URLs de imágenes del sensor
    if (sensor.imageUrls && sensor.imageUrls.length > 0) {
      if (sensor.imageUrls.length > 3) {
        return next(
          new AppError(
            "No se pueden agregar más de 3 imágenes para el sensor",
            400
          )
        );
      }
      for (const url of sensor.imageUrls) {
        if (!/\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url)) {
          return next(
            new AppError(
              `${url} no es una URL válida de imagen para el sensor`,
              400
            )
          );
        }
      }
    }
  }

  const newExercise = await Exercise.create({
    name,
    description,
    videoUrls: videoUrls || [],
    imageUrls: imageUrls || [],
    creator,
    muscleGroups: muscleGroups || [],
    difficulty,
    equipment: equipment || ["ninguno"],
    duration,
    calories,
    isPublic,
    sensor: sensor || {
      useSensor: false,
      sensorType: "accelerometer",
      description: "",
      position: "",
      videoUrls: [],
      imageUrls: [],
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      exercise: newExercise,
    },
  });
});

exports.updateExercise = catchAsync(async (req, res, next) => {
  const exercise = await Exercise.findById(req.params.id);
  if (!exercise) {
    return next(new AppError("No se encontró el ejercicio con ese ID", 404));
  }

  // Filtrar y validar campos
  const filteredBody = filterObj(
    req.body,
    "name",
    "description",
    "videoUrls",
    "imageUrls",
    "muscleGroups",
    "difficulty",
    "equipment",
    "duration",
    "calories",
    "isPublic",
    "sensor"
  );

  // Validaciones para videos principales
  if (filteredBody.videoUrls) {
    if (filteredBody.videoUrls.length > 3) {
      return next(new AppError("No se pueden agregar más de 3 videos", 400));
    }
    for (const url of filteredBody.videoUrls) {
      if (!/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url)) {
        return next(
          new AppError(`${url} no es una URL válida de YouTube`, 400)
        );
      }
    }
  }

  // Validaciones para imágenes principales
  if (filteredBody.imageUrls) {
    if (filteredBody.imageUrls.length > 5) {
      return next(new AppError("No se pueden agregar más de 5 imágenes", 400));
    }
    for (const url of filteredBody.imageUrls) {
      if (!/\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url)) {
        return next(new AppError(`${url} no es una URL válida de imagen`, 400));
      }
    }
  }

  // Validaciones para el sensor
  if (filteredBody.sensor) {
    if (filteredBody.sensor.useSensor) {
      if (
        !filteredBody.sensor.sensorType ||
        !filteredBody.sensor.position ||
        !filteredBody.sensor.description
      ) {
        return next(
          new AppError(
            "Todos los campos del sensor son requeridos cuando useSensor es true",
            400
          )
        );
      }

      // Validar videos del sensor
      if (filteredBody.sensor.videoUrls) {
        if (filteredBody.sensor.videoUrls.length > 2) {
          return next(
            new AppError(
              "No se pueden agregar más de 2 videos para el sensor",
              400
            )
          );
        }
        for (const url of filteredBody.sensor.videoUrls) {
          if (
            !/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url)
          ) {
            return next(
              new AppError(
                `${url} no es una URL válida de YouTube para el sensor`,
                400
              )
            );
          }
        }
      }

      if (filteredBody.sensor.imageUrls) {
        if (filteredBody.sensor.imageUrls.length > 3) {
          return next(
            new AppError(
              "No se pueden agregar más de 3 imágenes para el sensor",
              400
            )
          );
        }
        for (const url of filteredBody.sensor.imageUrls) {
          if (!/\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url)) {
            return next(
              new AppError(
                `${url} no es una URL válida de imagen para el sensor`,
                400
              )
            );
          }
        }
      }
    } else {
      // Si useSensor es false, resetear los campos del sensor
      filteredBody.sensor = {
        useSensor: false,
        sensorType: "accelerometer",
        description: "",
        position: "",
        videoUrls: [],
        imageUrls: [],
      };
    }
  }

  // Actualizar el ejercicio
  const updatedExercise = await Exercise.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      exercise: updatedExercise,
    },
  });
});

exports.getAllExercises = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Exercise.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const exercises = await features.query.populate(
    "creator",
    "name email photo"
  );

  res.status(200).json({
    status: "success",
    results: exercises.length,
    data: {
      exercises,
    },
  });
});

// Obtener un ejercicio específico
exports.getExercise = async (req, res, next) => {
  console.log("lo que llega", req.params.id);

  const exercise = await Exercise.findById(req.params.id)
    .populate("creator", "name email photo")
    .populate("likes", "name photo")
    .populate("favorites", "name photo");

  if (!exercise) {
    return next(new AppError("No se encontró el ejercicio con ese ID", 404));
  }

  // Verificar permisos
  if (!exercise.isPublic && !exercise.creator.equals(req.user.id)) {
    return next(new AppError("No tienes permiso para ver este ejercicio", 403));
  }

  res.status(200).json({
    status: "success",
    data: {
      exercise,
    },
  });
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// exports.updateExercise = catchAsync(async (req, res, next) => {
//   const exercise = await Exercise.findById(req.params.id);
//   console.log(exercise);
//   if (!exercise) {
//     return next(new AppError("No se encontró el ejercicio con ese ID", 404));
//   }

//   // 3) Filtrar campos permitidos
//   const filteredBody = filterObj(
//     req.body,
//     "name",
//     "description",
//     "videoUrls",
//     "imageUrls",
//     "muscleGroups",
//     "difficulty",
//     "equipment",
//     "duration",
//     "calories",
//     "isPublic"
//   );

//   // 4) Validaciones específicas para videos e imágenes
//   if (filteredBody.videoUrls) {
//     // Validar que no exceda el límite
//     if (filteredBody.videoUrls.length > 3) {
//       return next(
//         new AppError("No se pueden agregar más de 3 videos por ejercicio", 400)
//       );
//     }
//     // Validar cada URL de video
//     for (const url of filteredBody.videoUrls) {
//       if (!/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url)) {
//         return next(
//           new AppError(`${url} no es una URL válida de YouTube`, 400)
//         );
//       }
//     }
//   }

//   if (filteredBody.imageUrls) {
//     // Validar que no exceda el límite
//     if (filteredBody.imageUrls.length > 5) {
//       return next(
//         new AppError(
//           "No se pueden agregar más de 5 imágenes por ejercicio",
//           400
//         )
//       );
//     }
//     // Validar cada URL de imagen
//     for (const url of filteredBody.imageUrls) {
//       if (!/\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url)) {
//         return next(new AppError(`${url} no es una URL válida de imagen`, 400));
//       }
//     }
//   }

//   // 5) Actualizar el ejercicio
//   const updatedExercise = await Exercise.findByIdAndUpdate(
//     req.params.id,
//     filteredBody,
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   res.status(200).json({
//     status: "success",
//     data: {
//       exercise: updatedExercise,
//     },
//   });
// });

// Eliminar un ejercicio
exports.deleteExercise = catchAsync(async (req, res, next) => {
  const exercise = await Exercise.findByIdAndDelete(req.params.id);

  if (!exercise) {
    return next(new AppError("No se encontró el ejercicio con ese ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
