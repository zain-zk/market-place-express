const mongoose=require("mongoose");

const messageSchema = new mongoose.Schema({
    sender:{type:mongoose.Schema.Types.ObjectId , ref:"User" , required:true},
    receiver:{type:mongoose.Schema.Types.ObjectId , ref:"User" , required:true},
    text:{type:String , required:true},
    bid:{type:mongoose.Schema.Types.ObjectId , ref:"Bid" , required:true},
    isRead:{type:Boolean , default:false},
},{timestamps:true} // ads createdAt and updatedAt
);

module.exports =mongoose.model("Message", messageSchema);