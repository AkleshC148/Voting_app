const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const { generateToken , jwtAuthMiddleware} = require('../jwt'); // Correct path

const jwt = require('jsonwebtoken');

//signup route


router.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        const checkAdminExists= await User.findOne({role:"admin"});
        if(checkAdminExists && req.body.role==="admin") return res.status(403).json({message: "Admin already registered,no more new admin registration"});
        const newUser = new User(data);
       

        const response = await newUser.save();
        console.log("Data saved");
        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is:", token);
        res.status(200).json({ response: response, token: token });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });

    }
})


// Login Route

router.post('/login', async (req, res) => {
    //token will be verified
    try {
        //extract aadharnumber and password
        const { aadharNumber, password } = req.body;
        const user = await User.findOne({ aadharNumber: aadharNumber });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid Username or Password' });
        }
        const payload = {
            id: user.id
        }
        const token=generateToken(payload);
        res.json({token})


    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "User not found" });
    }
})


//Profile route
router.get('/profile',jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(201).json({ user });


    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "User not found" });
    }
})

//password profile
router.put('/profile/password',jwtAuthMiddleware, async (req, res) => {
    try {
        //extractingId from token
        const userId=req.user.id;
        const{currentPassword,newPassword}=req.body;

        //finding user using userID
        const user = await User.findById(userId);
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Incorrect Password' });
        }


        user.password=newPassword;
        await user.save();
        console.log("Password Updated");
        res.status(201).json({message:"Password updated successfully"});


    } catch(err){
        console.log(err);
        res.status(500).json({ error: "User not found" });
    }
})





module.exports = router;