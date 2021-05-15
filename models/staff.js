const mongoose = require("mongoose");

var staffMember = new mongoose.Schema({
  cin: {
    type: String,
    required: true,
    unique: true,
  },

  first_name: {
    type: String,
    required: true,
  },

  last_name: {
    type: String,
    required: true,
  },

  phone_number: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  job: {
    type: String,
  },

  gender: String,
  status: String,
});

const Staffdb = mongoose.model("staffdb", staffMember);

module.exports = Staffdb;
