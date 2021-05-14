const express = require("express");
const router = express.Router();
const { ItemDB } = require("../models/item");
const imageMimeTypes = ["image/jpeg", "image/png"];
const { carBrands } = require("../models/item");
const { categoryEnum } = require("../models/item");

//products page
router.get("/", (req, res) => {
  const items = [
    {
      id: 1,
      name: "car part 1",
      price: 90,
      quantity: 50,
      type: "car part",
      compatibility: ["BMW", "Mercedes"],
      discount: 0,
    },
    {
      id: 2,
      name: "car part 2",
      price: 40,
      quantity: 4,
      type: "car part",
      compatibility: ["BMW", "Mercedes"],
      discount: 0,
    },
    {
      id: 3,
      name: "accessory 1",
      price: 10,
      quantity: 100,
      type: "accessory",
      compatibility: ["ALL"],
      discount: 0,
    },
  ];
  res.render("item/item-list", { items });
});

//create item page
router.get("/create", (req, res) => {
  res.render("item/add-item", { item: new ItemDB(), carBrands, categoryEnum });
});

// update page
router.get("/update/:id", async (req, res) => {
  let item = await ItemDB.findById(req.params.id);
  res.render("item/update-item", {
    item: item,
    carBrands,
    categoryEnum,
  });
});

//show item page
router.get("/show/:id", async (req, res) => {
  const item = await ItemDB.findById(req.params.id);
  console.log(item);
  res.render("item/item-show", { item });
});

//admin get items page
router.get("/admin", async (req, res) => {
  let query = ItemDB.find();
  let searchOptions = {};
  if (req.query.name && req.query.name != "") {
    searchOptions.name = new RegExp(req.query.name, "i");
    query = query.where("name", searchOptions.name);
  }
  if (req.query.min && req.query.min != "") {
    searchOptions.min = req.query.min;
    query = query.gte("price", searchOptions.min);
  }
  if (req.query.max && req.query.max != "") {
    searchOptions.max = req.query.max;
    query = query.lte("price", searchOptions.max);
  }
  if (req.query.category && req.query.category != "") {
    searchOptions.category = req.query.category;
    query = query.where("category", searchOptions.category);
  }
  const items = await query.exec();

  res.render("item/items-admin", {
    items,
    categoryEnum,
    searchOptions: req.query,
  });
});

// create item
router.post("/", async (req, res) => {
  const item = new ItemDB({
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity,
    category: req.body.category,
    compatibility: req.body.compatibility,
    discount: req.body.discount,
  });
  console.log(item);
  if (req.body.image) {
    saveImage(item, req.body.image);
  }
  await item
    .save()
    .then((data) => {
      console.log(data);
      res.redirect("items/admin");
    })
    .catch((err) =>
      res.status(500).send({
        message: err.message || "an error occured while creating an item",
      })
    );
});

// update item
router.put("/:id", async (req, res) => {
  const item = await ItemDB.findById(req.params.id);

  if (req.body.name != null && req.body.name != "") item.name = req.body.name;

  if (req.body.price != null && req.body.price != "")
    item.price = req.body.price;

  if (req.body.quantity != null && req.body.quantity != "")
    item.quantity = req.body.quantity;

  if (req.body.category != null && req.body.category != "")
    item.category = req.body.category;

  if (req.body.cars != null && req.body.cars != "") item.cars = req.body.cars;

  if (req.body.discount != null && req.body.discount != "")
    item.discount = req.body.discount;

  if (req.body.image) {
    saveImage(item, req.body.image);
  }

  if (req.body.compatibility && req.body.compatibility.length > 0) {
    item.compatibility = req.body.compatibility;
  }

  await item
    .save()
    .then(() => {
      res.redirect("admin");
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
});

router.delete("/:id", async (req, res) => {
  const item = await ItemDB.findById(req.params.id);
  await item.remove();
  res.redirect("admin");
});

function saveImage(item, imageEncoded) {
  if (imageEncoded == null) return;
  const image = JSON.parse(imageEncoded);
  if (image != null && imageMimeTypes.includes(image.type)) {
    item.itemImage = new Buffer.from(image.data, "base64");
    item.itemImageType = image.type;
  }
}
module.exports = router;
