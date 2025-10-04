const { ref } = require("joi");
const mongoose = require("mongoose");
const reviewModel = require("./reviews.models")

let placelistingschema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: true,
    default:
      "https://images.unsplash.com/photo-1470165301023-58dab8118cc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    set: (v) =>
      v === ""
        ? "https://images.unsplash.com/photo-1470165301023-58dab8118cc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60"
        : v,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  reviews:[
  
  {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Review"
  }
  ]
});

placelistingschema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await reviewModel.deleteMany({_id: {$in: listing.reviews}})
    
  }
})

module.exports = mongoose.model("placelist", placelistingschema);
