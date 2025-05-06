const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del ejercicio es requerido"],
      trim: true,
      maxlength: [100, "El nombre no puede exceder los 100 caracteres"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "La descripción no puede exceder los 1000 caracteres"],
    },
    videoUrls: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(
              v
            );
          },
          message: (props) => `${props.value} no es una URL válida de YouTube!`,
        },
      },
    ],
    imageUrls: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(v);
          },
          message: (props) => `${props.value} no es una URL válida de imagen!`,
        },
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El creador del ejercicio es requerido"],
    },
    muscleGroups: [
      {
        type: String,
        enum: [
          "pecho",
          "espalda",
          "hombros",
          "brazos",
          "piernas",
          "abdominales",
          "glúteos",
          "cardio",
        ],
      },
    ],
    difficulty: {
      type: String,
      enum: ["principiante", "intermedio", "avanzado"],
      default: "intermedio",
    },
    equipment: [
      {
        type: String,

        default: "ninguno",
      },
    ],
    duration: {
      type: Number, // Duración en minutos
      min: [1, "La duración mínima es 1 minuto"],
    },
    calories: {
      type: Number, // Calorías aproximadas quemadas
      min: [0, "Las calorías no pueden ser negativas"],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    sensor: {
      type: Object,
      default: {
        useSensor: false,
        sensorType: "accelerometer",
        description: "",
        position: "",
        videoUrls: [],
        imageUrls: [],
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Esto actualizará automáticamente createdAt y updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices para búsquedas más eficientes
exerciseSchema.index({ name: "text", description: "text" });
exerciseSchema.index({ creator: 1 });
exerciseSchema.index({ muscleGroups: 1 });
exerciseSchema.index({ difficulty: 1 });

// Método para agregar un video
exerciseSchema.methods.addVideoUrl = function (url) {
  if (this.videoUrls.length >= 3) {
    throw new Error("No se pueden agregar más de 3 videos por ejercicio");
  }
  this.videoUrls.push(url);
  return this.save();
};

// Método para agregar una imagen
exerciseSchema.methods.addImageUrl = function (url) {
  if (this.imageUrls.length >= 5) {
    throw new Error("No se pueden agregar más de 5 imágenes por ejercicio");
  }
  this.imageUrls.push(url);
  return this.save();
};

// Virtual para contar likes
exerciseSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual para contar favoritos
exerciseSchema.virtual("favoriteCount").get(function () {
  return this.favorites.length;
});

// Middleware para actualizar updatedAt antes de guardar
exerciseSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;
