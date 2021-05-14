const mongoose = require("mongoose");

const categoryEnum = ["engines", "lights", "body part", "accessory"];
const carBrands = [
  "Abarth",
  "Alfa Romeo",
  "Aston Martin",
  "Audi",
  "Bentley",
  "BMW",
  "Bugatti",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Citroën",
  "Dacia",
  "Daewoo",
  "Daihatsu",
  "Dodge",
  "Donkervoort",
  "DS",
  "Ferrari",
  "Fiat",
  "Fisker",
  "Ford",
  "Honda",
  "Hummer",
  "Hyundai",
  "Infiniti",
  "Iveco",
  "Jaguar",
  "Jeep",
  "Kia",
  "KTM",
  "Lada",
  "Lamborghini",
  "Lancia",
  "Land Rover",
  "Landwind",
  "Lexus",
  "Lotus",
  "Maserati",
  "Maybach",
  "Mazda",
  "McLaren",
  "Mercedes-Benz",
  "MG",
  "Mini",
  "Mitsubishi",
  "Morgan",
  "Nissan",
  "Opel",
  "Peugeot",
  "Porsche",
  "Renault",
  "Rolls-Royce",
  "Rover",
  "Saab",
  "Seat",
  "Skoda",
  "Smart",
  "SsangYong",
  "Subaru",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
];
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  category: {
    type: String,

    enum: categoryEnum,
  },
  itemImage: {
    type: Buffer,
    required: false,
  },
  itemImageType: {
    type: String,
    required: false,
  },
  compatibility: [
    {
      type: String,
      enum: carBrands,
    },
  ],
  discount: Number,
});

itemSchema.virtual("itemImagePath").get(function () {
  if (this.itemImage != null && this.itemImageType != null) {
    return `data:${
      this.itemImageType
    };charset=utf-8;base64,${this.itemImage.toString("base64")}`;
  }
});

module.exports = {
  ItemDB: mongoose.model("item", itemSchema),
  carBrands: carBrands,
  categoryEnum: categoryEnum,
};
