const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyparser = require("body-parser");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const app = express();

dotenv.config({ path: "config.env" });
const PORT = process.env.PORT || 8080;

//log requests
app.use(morgan("tiny"));

//bodyParser
app.use(bodyparser.urlencoded({ limit: "10mb", extended: true }));

// routes
const indexRouter = require("./routes/index");
const offerRouter = require("./routes/offers");

//view engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);

//load assets
app.use("/css", express.static(path.resolve(__dirname, "assets/css")));
app.use("/img", express.static(path.resolve(__dirname, "assets/img")));
app.use("/js", express.static(path.resolve(__dirname, "assets/js")));

// public folder
app.use(express.static("public"));

// mongoose
const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongoose"));

// using routes
app.use("/", indexRouter);
app.use("/offers", offerRouter);

app.get("/products", (req, res) => {
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
  res.render("product/product-list", { items });
});

app.get("/offers", (req, res) => {
  res.render("offer/offers");
});

app.listen(PORT, () => {
  console.log("server is running on " + PORT);
});
