const mongoose=require('mongoose');
require('dotenv').config();

//defining the mongodb url
const mongoURL= process.env.MONGODB_URL_LOCAL


//setting mongoDB conn...
mongoose.connect(mongoURL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

//mongoose deafult connection object
const db=mongoose.connection;


//event listeners
db.on('connected',()=>{
    console.log("Connected to MongoDB server....");
});

db.on('disconnected',()=>{
    console.log("MongoDB server disconnected....");
});

db.on('error',(err)=>{
    console.log("Connection error",err);
});


//exporting db conn....
module.exports=db;

