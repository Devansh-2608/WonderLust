const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

main()
  .then((res)=>{
    console.log("succesfull connection.");
  })
  .catch((err) => {
    console.log(err)
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initdb = async ()=>{
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({...obj,owner : "694943ad464a57f51cddf953"}));
  await Listing.insertMany(initData.data);      // why ? initData.data and not only initData
  console.log("Saved Successfully");
}

initdb();