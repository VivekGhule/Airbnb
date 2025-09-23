const mongoose = require('mongoose');
const initData = require("./data.js");
const listdb = require("../models/listing.models.js");


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


async function datainstrations() {
    await listdb.deleteMany()
    await listdb.insertMany(initData.data)
    console.log("Data Stored Successfully to DB");
    
}

datainstrations()