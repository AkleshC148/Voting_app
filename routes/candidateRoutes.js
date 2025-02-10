const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate');
const User = require('../models/user');
const mongoose=require('mongoose');
const { generateToken, jwtAuthMiddleware } = require('../jwt'); // Correct path

const jwt = require('jsonwebtoken');

//ensuring only admin access
const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        return (user.role === 'admin');
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server error" });
    }
};


//adding a candidate

router.post('/', jwtAuthMiddleware, async (req, res) => {

    if (! await checkAdminRole(req.user.id)) {
        return res.status(403).json({ message: "Only authorized for the admin" });
    }
    try {
        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();
        console.log("Data saved");

        res.status(200).json({ response: response });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });

    }
})



router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {

        if (! await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: "Only authorized for the admin" });
        }
        const candidateID = req.params.candidateID;
        const updatedCandidate = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidate, {
            new: true,
            runValidators: true
        })

        if (!response) return res.status(404).json("Candidate not found");
        console.log("Candidate data updated");
        res.status(200).json({ response });


    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server error" });
    }
})


router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: "Only authorized for the admin" });
        }
        const candidateID = req.params.candidateID;
        const response = await User.findByIdAndDelete(candidateID);
        if (!response) return res.status(404).json("Candidate not found");
        console.log("Candidate data deleted");
        res.status(200).json({ response });



    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server error" });
    }
})

router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    // no admin can vote
    // user can only vote once
    
    candidateID = req.params.candidateID;
    userId = req.user.id;

    try{
        // Find the Candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: 'user not found' });
        }
        if(user.role == 'admin'){
            return res.status(403).json({ message: 'admin is not allowed'});
        }
        if(user.isVoted){
            return res.status(400).json({ message: 'You have already voted' });
        }

        
        // Update the Candidate document to record the vote
        candidate.votes.push({ user: new mongoose.Types.ObjectId(userId) });
        candidate.voteCount++;
        await candidate.save();

        // update the user document
        user.isVoted = true
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    }catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
});


router.get('/vote/count',async(req,res)=>{
    try{
        const candidate=await Candidate.find().sort({voteCount:-1});
        const voterecord=candidate.map((data)=>{
            return {
                party:data.party,
                count:data.voteCount
            }
        });
        return res.status(200).json(voterecord);


    }catch(err){
        console.log(err);
        res.status(500).json({ error: "Internal Server error" });
    }
})

router.get('/candidatelist',async(req,res)=>{
    try{
        const candidate=await Candidate.find();
        const candidatelist=candidate.map((data)=>{
            return {
                name:data.name,
                party:data.party,
                age:data.age
            }
        });
        return res.status(200).json(candidatelist);


    }catch(err){
        console.log(err);
        res.status(500).json({ error: "Internal Server error" });
    }
})

module.exports = router;