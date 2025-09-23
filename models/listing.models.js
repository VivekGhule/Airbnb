const mongoose = require('mongoose');

let placelistingschema = new mongoose.Schema({
    title : {
        type: String,
        required: true
    },
    description : {
        type: String,
        required: true
    },
     image: {
    filename: {
      type: String,
      default: "listingimage"
    },
    url: {
      type: String,
      required: true,
      default: "https://images.unsplash.com/photo-1755441172753-ac9b90dcd930?...",
      set: (v) =>
        v === ""
          ? "https://images.unsplash.com/photo-1755441172753-ac9b90dcd930?..."
          : v
    }
  },
    price : {
        type: Number,
        required: true
    },
    location : {
        type: String,
        required: true
    },
    country : {
        type: String,
        required: true
    },
})

module.exports = mongoose.model("placelist", placelistingschema)