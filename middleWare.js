const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utilitis/expressError.js");
const { listingSchema } = require("./schema.js");

let isLoggedIn = (req,res,next)=>{
  //console.log(req.user);    //re.user if object that means you are looged in. and if it is undefined.
  // console.log(req.path ,"..",req.originalUrl);   // {/new .. /listings/new} 2nd url is where we want to go
  if(!req.isAuthenticated()){
    req.session.redirectUrl = req.originalUrl;   // if we do this then after loginin the passport will autometically delete the session file but this if we store in local then it cat delete that file.
    
    req.flash("error","You Must be looged in");

    // console.log("Redirecting unauthenticated user from:", req.originalUrl);  //debug

    return res.redirect("/login");
  }
  next();
}

let saveRedirectUrl = (req,res,next)=>{
  if(req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
} 

// work is to check if the person belongs to the listing they are del. or edit
let isOwner = async (req,res,next)=>{
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if(!listing.owner._id.equals(res.locals.currUser._id)){  // this code do that if the person is tryinh to edit other so they can't. better way is to make middleWare.
    req.flesh("error", " You don't have permission to Edit");
    return res.redirect(`/listings/${id}`)
  }
  next();
};

const validateListing = (req,res,next)=>{
  // console.log("listingSchema exists:", !!listingSchema);
  // console.log(listingSchema); // should not be undefined
  //console.log(req.body);       // check if req.body.listing exists

  //joi error handling.
  let{error} = listingSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400,errMsg);
  }else{
    next();
  }
};

const isReviewAuthor = async (req,res,next)=>{
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if(!review.author._id.equals(res.locals.currUser._id)){  // this code do that if the person is tryinh to edit other so they can't. better way is to make middleWare.
    req.flash("error", " You did not the author of this review");
    return res.redirect(`/listings/${id}`)
  }
  // ✅ AUTHOR CHECK (THIS IS THE CODE YOU ASKED ABOUT)
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You are not allowed to do that");
    return res.redirect(`/listings/${reviewId}`);
  }
  next();
};

module.exports = {saveRedirectUrl , isLoggedIn , isOwner, validateListing , isReviewAuthor};