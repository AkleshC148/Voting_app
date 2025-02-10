
const mongoose=require('mongoose');
const User = require('../models/user');
const candidateSchema=new mongoose.Schema({
   name: {
    type: String,
    required : true
},
party:{
    type:String,
    required: true
},
age:{
    type:Number,
    required:true
},
votes: {
    type: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            votedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    default: []  // ✅ Ensures that new documents always initialize `votes` as an array
},
voteCount:{
    type:Number,
    default:0
}

});

const Candidate=mongoose.model('Candidate',candidateSchema);
module.exports=Candidate;