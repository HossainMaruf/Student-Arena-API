// core modules
const router = require('express').Router();
const bcrypt = require('bcrypt');

// custom modules
const User = require("../models/User");

// update user
router.put('/:id', async (req, res, next) => {
            // console.log((req.body.userID));
            // console.log((req.body.userID));
            // console.log(req.body.userID == req.params.id);
    if(req.body.userID === req.params.id) {
        if(req.body.userID) {
            if(req.body.password) {
                try {
                    const salt = await bcrypt.genSalt(10);
                    req.body.password = await bcrypt.hash(req.body.password, salt);
                } catch(error) {
                    return res.status(500).json("Error From Password Encryption");
                }
            }
            // update the user info
            try {
                //console.log(req.body.userID);
                const currentUser = await User.findByIdAndUpdate(req.body.userID, {$set: req.body});
                if(currentUser) {
                    const updateUser = await User.findById(currentUser._id);
                    return res.status(200).json(updateUser);
                } else {
                    return res.status(403).json('User is not there');
                }
            } catch(error) {
                return res.status(500).json(error);
            }
        }
    } else {
        return res.status(403).json('You can update only your account');
    }
});

// delete a user
router.delete('/:id', async (req, res, next) => {
    if(req.body.userID === req.params.id || req.body.isAdmin) {
        try {
            await User.deleteOne({_id: req.params.id});
            res.status(200).json('Account has been deleted');
        } catch(error) {
            return res.status(500).json(error);
        }
    } else {
        return res.status(403).json('You can delete only your account');
    }
});

// get a user
router.get('/', async (req, res, next) => {
    const userID = req.query.userId;
    const username = req.query.username;
    try {
        const user = userID ? await User.findById(userID) : await User.findOne({username: username});
        const result = user._doc;
        res.status(200).json(result);
    } catch(error) {
        res.status(500).json("Some Error");
    }
});

// get friends
router.get("/friends/:userId", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followings.map(friendId => {
                return User.findById(friendId);
            })
            )
        let friendList = [];
        friends.map(friend => {
            const {_id, username, profilePicture} = friend;
            friendList.push({_id, username, profilePicture});
        })
        //console.log(friendList);
        res.status(200).json(friendList);
    } catch(error) {
        res.status(500).json(err);
    }
});


// follow a user
router.put('/:id/follow', async (req, res, next) => {
    if(req.body.userID !== req.params.id) {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userID);
        if(!user.followers.includes(req.body.userID)) {
            await user.updateOne({$push: {followers: req.body.userID}});
            await currentUser.updateOne({$push: {followings: req.params.id}});
            res.status(200).json('User has been followed');
        } else {
            res.status(403).json('You already follow this user');
        }
    } else {
        res.status(403).json('You can not follow yourself');
    }
});


// unfollow a user
router.put("/:id/unfollow", async (req, res, next) => {
  if (req.body.userID !== req.params.id) {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userID);
    if (user.followers.includes(req.body.userID)) {
      await user.updateOne({ $pull: { followers: req.body.userID } });
      await currentUser.updateOne({ $pull: { followings: req.params.id } });
      res.status(200).json("User has been unfollowed");
    } else {
      res.status(403).json("you dont follow this user");
    }
  } else {
    res.status(403).json("You can not unfollow yourself");
  }
});


// get all users

router.get("/all", async (req, res, next) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
  } catch(error) {
      res.status(500).json("Something went wrong");
  }
});

module.exports = router;