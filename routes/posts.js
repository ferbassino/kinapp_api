const express = require("express");

const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  likePost,
  deletePost,
} = require("../controllers/posts.js");

const router = express.Router();

router.get("/api/posts", getPosts);
router.post("/api/posts", createPost);
router.get("api/posts/:id", getPost);
router.patch("/api/posts/:id", updatePost);
router.delete("/api/posts/:id", deletePost);
router.patch("/api/posts/:id/likePost", likePost);

module.exports = router;
