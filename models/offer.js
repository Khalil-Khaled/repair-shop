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
    required: false,
  },
  offerImage: {
    type: Buffer,
    required: false,
  },
  offerImageType: {
    type: String,
    required: false,
  },
  issueDate: {
    type: Date,
    required: false,
  },
  expirationDate: {
    type: Date,
    required: false,
  },
  offerItems: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "item",
      required: true,
    },
  ],
  offerFreeItems: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "item",
      required: false,
    },
  ],
  cartCount: {
    type: Number,
    required: false,
    default: 0,
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
