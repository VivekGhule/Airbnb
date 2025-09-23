const express = require("express");
const app = express();
const mongoose = require("mongoose");
const user = require("./models/user.models.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");
const engine = require("ejs-mate");
const listingModel = require("./models/listing.models");
const methodOverride = require('method-override')
const wrapAsync = require('./utils/wrapAsync.js')
const ExpressError = require('./utils/expressErrors.js')
const listingSchema = require('./schema.js');


// DB connection

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("Failed to connect DB : ", err.message);
  });

async function main() {
  await mongoose.connect(`mongodb://127.0.0.1:27017/Airbnb`);
}

// Set And Middlewares

app.set("view engine", "ejs");
app.engine("ejs", engine);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"))

const validatelisting = (req,res,next) => {
  let {error} = listingSchema.validate(req.body)
  if(error){
    let errmsg = error.details.map((er) => er.message).join(",")
   throw new ExpressError(400,error)
    
  }else{
    next();
  }

}

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const data = jwt.verify(token, "shhh");
    req.user = data;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
}

app.get("/", function (req, res) {
  res.render("index");
});

// Login
app.get("/login", function (req, res) {
  res.render("login");
});
app.post("/login", async function (req, res) {
  let { email, password } = req.body;
  let fetchuser = await user.findOne({ email: email });
  if (!fetchuser) return res.redirect("/registration");
  bcrypt.compare(password, fetchuser.password, (err, result) => {
    if (result) {
      let token = jwt.sign(
        { id: fetchuser._id },
        process.env.JWT_SECRET || "shhh"
      );

      res.cookie("token", token, { httpOnly: true });
      res.redirect("listing");
    } else {
      res.send("Somthing Was Wrong");
    }
  });
});

// registration

app.get("/registration", function (req, res) {
  res.render("registration");
});

app.post("/user", async function (req, res) {
  try {
    let { name, email, password } = req.body;

    // Check if user already exists
    let checkUser = await user.findOne({ email });
    if (checkUser) {
      return res
        .status(400)
        .render("registration", { error: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    let createUser = await user.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT with user id
    let token = jwt.sign(
      { id: createUser._id },
      process.env.JWT_SECRET || "shhh",
      {
        expiresIn: "1h",
      }
    );

    // Set token in cookie
    res.cookie("token", token, { httpOnly: true });

    return res.redirect("/home");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// home

app.get("/home", isLoggedIn, function (req, res) {
  res.render("home");
});

// Logout
app.get("/logout", function (req, res) {
  res.cookie("token", "");
  res.redirect("login");
});

app.get("/listing", isLoggedIn, async function (req, res) {
  const allListings = await listingModel.find({});
  res.render("home", { allListings });
});

// Create Listings

app.get("/listings/new", function (req, res) {
  res.render("createlisting");
});
app.post("/listing/new",validatelisting,wrapAsync( async function (req, res) {
  
  
   let newListings = new listingModel(req.body.listing)
  await newListings.save();
  res.redirect("/listing")
  
 
})
);


//Read list

app.get("/listings/:id", isLoggedIn,wrapAsync( async function (req, res) {
  let {id} = req.params;
  let readlisting = await listingModel.findById(id);
  res.render("viewlisting", {readlisting})
}));

/listings/

// update

// edit route

app.get("/listing/edit/:id", wrapAsync(async function (req,res){
  let {id} = req.params;
   let readlisting = await listingModel.findById(id);
  res.render("editlisting", {readlisting})
}))

//update route

app.put("/listing/update/:id",validatelisting, wrapAsync(async function (req, res) {
  
  let {id} = req.params;
  await listingModel.findByIdAndUpdate(id,{...req.body.listing})
  res.redirect(`/listings/${id}`)
  
}));




// Delete
// delete route

app.post("/listing/delete/:id", wrapAsync(async function (req,res){
  let {id} = req.params;
   let readlisting = await listingModel.findById(id);
  res.render("editlisting", {readlisting})
}))



// Error Handling 
app.all(/.*/,(req,res,next) => {
  next(new ExpressError(404, "Page Not Found! "))

})

app.use((err,req,res,next) => {
  let {statusCode = 500, message = "Something Went Wrong"} = err;
  res.status(statusCode).render('error.ejs',{message})
  // res.status(statusCode).send(message)
})



app.listen(8080);
