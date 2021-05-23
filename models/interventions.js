const mongoose = require("mongoose");

var interventionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  estimatedTime: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  status: String,
  discount: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: "userdb" },
  car: { type: mongoose.Schema.Types.ObjectId, ref: "car" },
  staffs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "staffdb",
    },
  ],
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "item",
    },
  ],
});

const intervention = mongoose.model("Intervention", interventionSchema);

module.exports = intervention;
