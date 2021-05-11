const mongoose = require("mongoose");
const offerImageBasePath = "uploads/offerImages";
const path = require("path");

// creating the schema
const offerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  offerImageName: {
    type: String,
    required: true,
  },
  issueDate: {
    type: Date,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
});

offerSchema.virtual("offerImagePath").get(function () {
  if (this.offerImageName != null) {
    return path.join("/", offerImageBasePath, this.offerImageName);
  }
});

module.exports = mongoose.model("Offer", offerSchema);
module.exports.offerImageBasePath = offerImageBasePath;
