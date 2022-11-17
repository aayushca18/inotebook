const express = require('express');
const User = require('../models/User');
const router =express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const JWT_SECRET= 'Aayushthegoodb@y'
//Route1:  Create a user using : POST "/api/auth/createuser". no login required
router.post('/createuser',[
    body('email', 'Enter a valid email').isEmail(),
    body('name', 'Enter a valid name').isLength({min:3}),
    body('password', 'Please enter a longer password').isLength({ min: 5 })
],async (req, res)=>{
    //  const user = User(req.body);
    //  user.save()
     // If there are errors return bad request and errors
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }
     // Check weather user with this email already exists
     try {
      let user =await User.findOne({email: req.body.email});
      if(user){
        return res.status(400).json({error: "Sorry user with this email address already exists"})
     }
     const salt = await bcrypt.genSalt(10);
     const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email
      })
      const data = {
        user: {
          id: user.id
        }
      }
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json(authToken);
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
  }
} )

//Route2: Authenticate a user using : POST "/api/auth/login". Doesn't require Auth

router.post('/login',[
body('email', 'Enter a valid email').isEmail(),
body('password', 'Please enter a longer password').exists()
], async(req,res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
}
const {email, password} = req.body;
try {
  let user = await User.findOne({email});
  if(!user){
    return res.status(400).json({error: "Email or password don't match"})
  }
  const passwordCompare = await bcrypt.compare(password,user.password);
  if(!passwordCompare){
    return res.status(400).json({error: "Email or password don't match"})
  }
  const data = {
    user: {
      id: user.id
    }
  }
  const authToken = jwt.sign(data, JWT_SECRET);
      res.json(authToken);
} catch (error) {
  console.error(error.message);
      res.status(500).send("Internal Server Error");
}})


//Route3: Get User details : POST "/api/auth/getuser".  requires login
router.post('/getuser',fetchuser, async(req,res) =>{
try {
  userId = req.user.id;
  const user = await User.findById(userId).select("-password")
  res.send(user);
} catch (error) {
  console.error(error.message);
      res.status(500).send("Internal Server Error");
}})
module.exports = router