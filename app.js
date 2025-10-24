const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const engine = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/expressErrors");
const Session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const PassportLocalMongoose = require('passport-local-mongoose')
const passportLocal = require('passport-local')
// Routes
const listingRoutes = require("./routes/listings.routes");
const reviewRoutes = require("./routes/reviews.routes");
const userRoutes = require("./routes/users.routes");

// DB connection
main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("Failed to connect DB : ", err.message));

async function main() {
  await mongoose.connect(`mongodb://127.0.0.1:27017/Airbnb`);
}

// Middlewares
app.set("view engine", "ejs");
app.engine("ejs", engine);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

const sessionOption = {
  secret : "mysecretcode",
  resave : false,
  saveUninitialized: true,
  cookie : {
    expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly : true,

  },
}

app.use(Session(sessionOption))
app.use(flash())
app.use((req,res,next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();

})

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ================= ROUTES =================
app.use("/", userRoutes);                      
app.use("/listing", listingRoutes);           
app.use("/listing/:id/review", reviewRoutes);  

// Error Handling
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => console.log("Server running on port 8080"));
