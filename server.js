const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyparser = require("body-parser");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");

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
const itemsRouter = require("./routes/items-router");
const usersRouter = require("./routes/users");
const staffRouter = require("./routes/staffs");
const interventionRouter = require("./routes/Interventions");
const carRouter = require("./routes/cars");
const shopRouter = require("./routes/shop");

//view engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(methodOverride("_method"));

//load assets
app.use("/css", express.static(path.resolve(__dirname, "assets/css")));
app.use("/img", express.static(path.resolve(__dirname, "assets/img")));
app.use("/js", express.static(path.resolve(__dirname, "assets/js")));

// public folder
app.use(express.static("public"));

app.use(methodOverride("_method"));

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
app.use("/items", itemsRouter);
app.use("/api/users", usersRouter);
app.use("/api/staff", staffRouter);
app.use("/interventions", interventionRouter);
app.use("/cars", carRouter);
app.use("/shop", shopRouter);

app.listen(PORT, () => {
  console.log("server is running on " + PORT);
});
