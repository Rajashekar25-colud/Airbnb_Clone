require("dotenv").config(); // MUST be first

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewShema } = require("./schema.js");

const listingsRoute = require("./routes/listing");
const reviewsRoute = require("./routes/review");
const userRoute = require("./routes/user");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const port = process.env.PORT || 1300;

/* =======================
   DATABASE
======================= */

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/stayease";

mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* =======================
   SESSION STORE
======================= */
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET || "stayease_fallback_secret",
  },
  touchAfter: 24 * 3600, // seconds
});

store.on("error", (err) => {
  console.error("SESSION STORE ERROR:", err);
});

const sessionOptions = {
  store,
  name: "stayease-session",
  secret: process.env.SESSION_SECRET || "stayease_fallback_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

/* =======================
   APP CONFIG
======================= */

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

/* =======================
   PASSPORT CONFIG
======================= */

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* =======================
   LOCALS MIDDLEWARE
======================= */

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

/* =======================
   ROUTES
======================= */

app.get("/", (req, res) => {
  res.send("home page");
});

app.use("/listings", listingsRoute);
app.use("/listings/:id/reviews", reviewsRoute);
app.use("/", userRoute);

/* =======================
   ERROR HANDLING
======================= */

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

/* =======================
   SERVER
======================= */

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
