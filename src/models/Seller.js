import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  url: String,
  keywords: [],
  products: [{}],
});

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;
