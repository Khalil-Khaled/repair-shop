const mongoose = require("mongoose");

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
  offerImage: {
    type: Buffer,
    required: true,
  },
  offerImageType: {
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
  if (this.offerImage != null && this.offerImageType != null) {
    return `data:${
      this.offerImageType
    };charset=utf-8;base64,${this.offerImage.toString("base64")}`;
  }
});

module.exports = mongoose.model("Offer", offerSchema);
