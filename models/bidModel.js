const mongoose= require("mongoose");

const bidSchema = new mongoose.Schema({
    provider:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true,
    },
    requirement:{
         type: mongoose.Schema.Types.ObjectId,
        ref: "Requirement",
        required:true,
    },
    amount:{
        type:Number,
        required: true,
    },
    proposal:{
        type:String,
    },
    deliveryTime:{
        type:Number,
        required:true,
    },
    status:{
        type:String,
        enum:["Accepted" , "Pending" , "Declined"],
        default : "Pending",
    },
},
{timestamps: true}
);

module.exports = mongoose.model('Bid', bidSchema);
