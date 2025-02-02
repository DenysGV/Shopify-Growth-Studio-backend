import mongoose from "mongoose";
const Schema = mongoose.Schema;

const articleSchema = new mongoose.Schema({
   title: String,
   id: Number,
   content: Array,
});

const Article = mongoose.model("Article", articleSchema);

export default Article