if (process.env.NODE_ENV != "production"){
  require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utilitis/expressError.js");
const path = require("path");
const methodOverride = require("method-override");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");   //express Router
const reviewsRouter = require("./routes/review.js");      //express Router
const userRouter = require("./routes/user.js");      //express Router

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');


app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"/public")));         // to use css and js files.
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs" ,ejsmate);

// const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";
const dbUrl = process.env.ATLASDB_URL ;

main()
  .then((res)=>{
    console.log("succesfull connection.");
  })
  .catch((err) => {
    console.log(err)
  });

async function main() {
  await mongoose.connect(dbUrl);
};

const store = MongoStore.create({
  mongoUrl : dbUrl,
  crypto :{
    secret : process.env.SECRET,
  },
  touchAfter : 24*60*60,
});

store.on("error",()=>{
  console.log("ERROR IN MONGO SESSION STORE",err);
})

const sessionOptions = {
  store,
  secret : process.env.SECRET ,
  resave : false,
  saveUninitialized : true,
}



// app.get("/",(req,res)=>{
//   res.send("HII, i am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));   

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);


// 404 handler (AFTER all routes)
app.use((req,res,next)=>{
  next(new ExpressError(404,"Page Not Found !"));
});

// Global error handler (LAST)
app.use((err,req,res,next)=>{
  let { statusCode = 500, message = " Globally Something went wrong" } = err;
  res.status(statusCode).render("./error.ejs", { err });
});


app.listen(8080,()=>{
  console.log("Server is listening on port : 8080");
});