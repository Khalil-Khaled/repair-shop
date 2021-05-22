const express = require("express");
const router = express.Router();
const { ItemDB } = require("../models/item");
const offer = require("../models/offer");

// Shop Page
router.get("/", async (req, res) => {
  const items = await ItemDB.find();
  const offers = await offer
    .find()
    .populate("offerItems")
    .populate("offerFreeItems");
  res.render("shop/shop", { items, offers });
});

module.exports = router;
