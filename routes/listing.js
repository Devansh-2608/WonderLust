const express = require("express");
const router = express.Router({mergeParams : true});

const wrapAsync = require("../utilitis/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const {isLoggedIn , isOwner , validateListing} = require("../middleWare.js");            //for authentication

const multer  = require('multer');  // to parse file.
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


// we can also make a conntroled file.
// we can use router.rout eevery where.

router
  .route("/")
  .get(wrapAsync( async (req,res)=>{
  let allListings = await Listing.find({});
  res.render("./listings/index.ejs",{allListings});
  }))
  .post(isLoggedIn,validateListing,upload.single('listing[image]'),wrapAsync(async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {url , filename};
  await newListing.save();
  req.flash("success","New Listing Created!");
  res.redirect("/listings");
  }))



// Index Route
// router.get("/",wrapAsync( async (req,res)=>{
//   let allListings = await Listing.find({});
//   res.render("./listings/index.ejs",{allListings});
// }));

//New Route
router.get("/new",isLoggedIn, (req, res) => {
  // console.log(req.user);
  //here we have use a middleWare isloggedin
  res.render("listings/new.ejs");
});

// Show Route 
router.get("/:id", wrapAsync(async (req,res)=>{
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({path :"review",populate :{path : "author"}}).populate("owner");
  if(!listing){  //flash error.
    req.flash("error","Listing does not exist");
    res.redirect("/listings");
  }else{
    //console.log(listing);
    res.render("./listings/show.ejs", { listing });
  }

}));

//Create Route
// router.post("/",isLoggedIn,validateListing, wrapAsync(async (req, res) => {
//   // if(!req.body.listing){
//   //   throw new ExpressError(400 , "Send valid data for listing")
//   // }
//   const newListing = new Listing(req.body.listing);
//   newListing.owner = req.user._id;
//   await newListing.save();
//   req.flash("success","New Listing Created!");
//   res.redirect("/listings");
// }));

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){  //flash error.
    req.flash("error","Listing does not exist");
    return res.redirect("/listings");
  }
    let originalImageUrl = listing.image.url; // this is for imge preview.
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", { listing,originalImageUrl });
}));

//Update Route
router.put("/:id",isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync( async (req, res) => {
  // if(!req.body.listing){
  //   throw new ExpressError(400 , "Send valid data for listing")
  // }
  let { id } = req.params;
  //let listing = await Listing.findById(id);
  // if(!listing.owner._id.equals(res.locals.currUser._id)){  // this code do that if the person is tryinh to edit other so they can't. better way is to make middleWare.
  //   req.flesh("error", " You don't have permission to Edit");
  //   return res.redirect(`/listings/${id}`)
  // }
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });   // The spread operator (...)
  
  // Only update image if a new file was uploaded
if (req.file) {   // Check if req.file exists
  listing.image = {
    url: req.file.path,
    filename: req.file.filename
  };
  await listing.save();
}

  req.flash("success","Listing Updated");
  res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id",isLoggedIn,isOwner, wrapAsync( async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  // console.log(deletedListing);
  req.flash("success","Listing Deleted");
  res.redirect("/listings");
}));


module.exports = router;


// for debuging..
// const schema = require("../schema.js");
// console.log("SCHEMA EXPORT IS:", schema);
