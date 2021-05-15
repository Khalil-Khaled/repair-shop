const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  brand: {
    type: String,
    enum: ["Mercedes", "Bmw", "scoda", "volvo", "peugeot"],
    default: "Mercedes",
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  platesNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  year: {
    type: Number,
  },
  color: {
    type: String,
  },
  carStatus: {
    type: String,
    enum: [
      "Completely broken",
      "works but need some fixing",
      "Need a checkup",
      "fixed",
    ],
    default: ["Completely broken"],
    required: true,
  },
});

const car = mongoose.model("car", carSchema);
module.exports = car;
