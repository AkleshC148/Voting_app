const jwt=require('jsonwebtoken');

const jwtAuthMiddleware=(req,res,next)=>{
    //Extracting token from request header
    // Check if Authorization header exists
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Unauthorized - No Token Provided' });
    }

    const authHeader = req.headers.authorization;
    const token=req.headers.authorization.split(' ')[1];
    if(!token){
        res.status(401).json({error:'Unauthorized'});
    }
    try{
        
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded; //User payload
        next();
    }catch(err){
        console.log(err);
        res.status(401).json({error:'Invalid Token'});
    }
}



//Generating token
const generateToken=(userData)=>{
    return jwt.sign(userData,process.env.JWT_SECRET,{ expiresIn: "30d" });
};

module.exports= {jwtAuthMiddleware,generateToken};
