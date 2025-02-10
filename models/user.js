const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const userSchema=new mongoose.Schema({
   name: {
    type: String,
    required : true
},
age: {
    type: Number,
    required: true
},
phone:{
    type: String,
},
email:{
    type: String,
},
aadharNumber:{
    type: String,
    required: true,
    unique: true
},
password:{
    type: String,
    required: true
},
role:{
    type: String,
    enum:["admin","voter"],
    default: "voter"
},
isVoted:{
    type: Boolean,
    default:false
}

});

userSchema.pre('save',async function(next){
    //hash only if it has been modified or new
    if(!this.isModified('password')) return next();
    try{
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(this.password,salt);
        this.password=hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
});

userSchema.methods.comparePassword=async function(candidatePassword){
    return await bcrypt.compare(candidatePassword,this.password);
}

//creating user model
const User=mongoose.model('User',userSchema);
module.exports=User;