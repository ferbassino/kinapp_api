const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/post");
const router = express.Router();

exports.getPosts = async (req, res) => {
  try {
    const Posts = await Post.find();

    res.status(200).json(Posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getPost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.createPost = async (req, res) => {
  const {
    corporalPart,
    segment,
    movement,
    maxAngle,
    minAngle,
    averageAngle,
    arthrology,
    myology,
    neurology,
    observations,
  } = req.body;

  const newPost = new Post({
    corporalPart,
    segment,
    movement,
    maxAngle,
    minAngle,
    averageAngle,
    arthrology,
    myology,
    neurology,
    observations,
  });

  try {
    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const {
    corporalPart,
    segment,
    movement,
    maxAngle,
    minAngle,
    averageAngle,
    arthrology,
    myology,
    neurology,
    observations,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No post with id: ${id}`);

  const updatedPost = {
    corporalPart,
    segment,
    movement,
    maxAngle,
    minAngle,
    averageAngle,
    arthrology,
    myology,
    neurology,
    observations,
    _id: id,
  };

  await Post.findByIdAndUpdate(id, updatedPost, { new: true });

  res.json(updatedPost);
};

exports.deletePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No post with id: ${id}`);

  await Post.findByIdAndRemove(id);

  res.json({ message: "Post deleted successfully." });
};

exports.likePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No post with id: ${id}`);

  const post = await Post.findById(id);

  const updatedPost = await Post.findByIdAndUpdate(
    id,
    { likeCount: post.likeCount + 1 },
    { new: true }
  );

  res.json(updatedPost);
};
