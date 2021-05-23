const express = require("express");
const router = express.Router();
const { ItemDB } = require("../models/item");
const offer = require("../models/offer");
var LocalStorage = require("node-localstorage").LocalStorage;

// Shop Page
router.get("/", async (req, res) => {
  const items = await ItemDB.find();
  const bodyParts = items.filter(
    (item) => item.category.toLowerCase() === "body part"
  );
  const lights = items.filter(
    (item) => item.category.toLowerCase() === "lights"
  );
  const accessories = items.filter(
    (item) => item.category.toLowerCase() === "accessory"
  );
  const engines = items.filter(
    (item) => item.category.toLowerCase() === "engines"
  );
  const offers = await offer
    .find()
    .populate("offerItems")
    .populate("offerFreeItems");
  // console.log(offers);
  let featuredOffers = offers.sort((offerA, offerB) => {
    countA = offerA.cartCount;
    countB = offerB.cartCount;
    if (countA < countB) return 1;
    if (countA > countB) return -1;
    else return 0;
  });
  featuredOffers = featuredOffers.slice(0, 4);
  // console.log(featuredOffers);
  let latestOffers = offers.sort((offerA, offerB) => {
    dateA = new Date(offerA.issueDate);
    dateB = new Date(offerB.issueDate);
    if (dateA < dateB) return 1;
    if (dateA > dateB) return -1;
    else return 0;
  });
  // console.log(latestOffers);
  latestOffers = latestOffers.slice(0, 4);
  res.render("shop/shop", {
    items,
    featuredOffers,
    latestOffers,
    bodyParts,
    lights,
    accessories,
    engines,
  });
});

router.post("/addOfferToCart", async (req, res) => {
  try {
    const addedOffer = await offer.findById(req.body.id);
    addedOffer.cartCount++;
    // getting the cart from localstorage
    const cart = JSON.parse(localStorage.getItem("cart"));
    const offersArray = cart.offers;
    const offerSelected = offersArray.find(
      (offer) => offer.id == addedOffer.id
    );
    if (offerSelected) {
      offerSelected.numInCart++;
    } else {
      offersArray.push({ id: addedOffer.id, numInCart: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log(JSON.parse(localStorage.getItem("cart")));
    await addedOffer.save();
  } catch (error) {
    console.log(error);
  }
  res.status(200);
  res.redirect("/shop");
});

router.post("/addItemToCart", async (req, res) => {
  try {
    const addedItem = await ItemDB.findById(req.body.id);
    // getting the cart from localstorage
    const cart = JSON.parse(localStorage.getItem("cart"));
    const itemsArray = cart.items;
    const itemSelected = itemsArray.find((item) => item.id == addedItem.id);
    if (itemSelected) {
      itemSelected.numInCart++;
    } else {
      itemsArray.push({ id: addedItem.id, numInCart: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log(JSON.parse(localStorage.getItem("cart")));
    addedItem.cartCount++;
    await addedItem.save();
  } catch (error) {
    console.log(error);
  }
  res.status(200);
  res.redirect("/shop");
});

router.get("/cart", async (req, res) => {
  const cart = JSON.parse(localStorage.getItem("cart"));
  let cartOffers = [];
  for (const singleOffer of cart.offers) {
    const dbOffer = await offer.findById(singleOffer.id);
    dbOffer.cartCount = singleOffer.numInCart;
    cartOffers.push(dbOffer);
  }
  let cartItems = [];
  for (const singleItem of cart.items) {
    const dbItem = await ItemDB.findById(singleItem.id);
    dbItem.cartCount = singleItem.numInCart;
    cartItems.push(dbItem);
  }
  let total = 0;
  cartOffers.forEach(
    (selectedOffer) => (total += selectedOffer.cartCount * selectedOffer.price)
  );
  cartItems.forEach(
    (selectedItem) => (total += selectedItem.cartCount * selectedItem.price)
  );
  res.render("shop/cart", { cartOffers, cartItems, total });
});

module.exports = router;
