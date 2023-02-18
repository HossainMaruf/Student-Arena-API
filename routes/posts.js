// core modules
const router = require('express').Router();

// custom modules
const User = require('../models/User');
const Post = require('../models/Post');

// create a post
router.post('/', async (req, res, next) => {
    const newPost = new Post(req.body);
    try {
        const createdPost = await newPost.save();
        res.status(200).json(createdPost);
    } catch(error) {
        res.status(500).json(error);
    }
});

// delete a post
router.delete('/:id', async (req, res, next) => {
        try {
            await Post.deleteOne({_id: req.params.id});
            res.status(200).json('Post has been deleted');
        } catch(error) {
            return res.status(500).json(error);
        }
});

// update a post
router.put('/:id', async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if(post.userID === req.body.userID) {
            await post.updateOne({$set: req.body});
            res.status(200).json('Post has been updated');
        } else {
            res.status(403).json('You can update only your post');
        }
    } catch(error) {
        res.json(error);
    }
});

// delete a post
router.delete('/:id', async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if(post.userID === req.body.userID) {
            await post.deleteOne();
            res.status(200).json('Post has been deleted');
        } else {
            res.status(403).json('You can delete only your post');
        }
    } catch(error) {
        res.json(error);
    }
});

// like dislike a post
router.put('/:id/like', async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userID)) {
            await post.updateOne({$push: {likes: req.body.userID}});
            res.status(200).json('Post has been liked');
        } else {
            await post.updateOne({$pull: {likes: req.body.userID}});
            res.status(200).json('Post has been disliked');
        }
    } catch(error) {

    }
});

// get a post
router.get('/:id', async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch(error) {
        res.status(500).json(error);
    }
});

//get newsfeed posts
router.get('/timeline/:userID', async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.params.userID);
        const userPosts = await Post.find({userID: currentUser._id});
        const friendPosts = await Promise.all(
            currentUser.followings.map(friendID => {
                return Post.find({userID: friendID});
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts));
    } catch(error) {
        res.status(500).json("Error");
    }
})


// get profile post
router.get('/profile/:username', async (req, res, next) => {
    try {
       const user = await User.findOne({username: req.params.username});
       const posts = await Post.find({userID: user._id});
       res.status(200).json(posts);
    } catch(error) {
        res.status(500).json("Error in profile post");
    }
})

module.exports = router;