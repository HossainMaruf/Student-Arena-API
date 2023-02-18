const router = require("express").Router();
const bcrypt = require("bcrypt");
// custom modules
const User = require("../models/User");



// Register
router.post("/register", async (req, res, next) => {
  try {
    // generate new hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    // create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    // save new user
    const  user = await newUser.save();
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
    try {
        const user = await User.findOne({email: req.body.email});
        !user && res.status(400).json('user not found');

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        !validPassword && res.status(400).json('password is incorrect');
        
        res.status(200).send(user);
    } catch(error) {
        console.log(error);
    }
});

module.exports = router;
