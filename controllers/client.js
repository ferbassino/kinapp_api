const MotionTest = require("../models/motion");
const User = require("../models/user");
const Client = require("../models/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");

exports.getClients = async (request, response) => {
  try {
    const clients = await Client.find();

    if (clients) {
      response.json({
        success: true,
        clients,
      });
    }
    if (!clients) {
      console.log(error.message);
      response.status(400).end();
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.getClient = async (request, response) => {
  const { id } = request.params;
  try {
    const client = await Client.findById(id);

    if (client) {
      response.json({
        success: true,
        client,
      });
    }
    if (!client) {
      console.log(error.message);
      response.status(400).end();
    }
  } catch (error) {
    console.log(error.message);
    response.status(400).end();
  }
};

exports.signInClient = async (request, response) => {
  try {
    const { email, password } = request.body;
    if (!email.trim() || !password.trim())
      return sendError(response, "email / password missing");

    const clients = await Client.find();

    if (!clients) {
      console.log(error.message);
      response.status(400).end();
    }

    const client = await clients.find((el) => el.email === email);

    const isMatch = await bcrypt.compare(password, client.password);

    if (!isMatch)
      return response.json({
        success: false,
        message: "password does not match",
      });

    const token = jwt.sign({ clientId: client._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    response.json({
      success: true,
      client: {
        id: client._id,
        // userName: client.userName,
        email: client.email,
        password: client.password,
        // avatar: client.avatar ? user.avatar : "",
        token,
        roles: client.roles,
      },
      // user: userInfo,
      // token,
    });

    if (!client) {
      console.log(error.message);
      response.status(400).end();
    }
  } catch (error) {
    console.log(error.message);
    response.status(400).end();
  }
};

exports.createClient = async (request, response) => {
  try {
    const { email, password, birthDate, size, gender, userId, roles, data } =
      request.body;
    console.log(
      "bodie",
      email,
      password,
      birthDate,
      size,
      gender,
      userId,
      roles,
      data
    );

    const user = await User.findById(userId);
    console.log("user", user);

    const newClient = await Client({
      email,
      password,
      birthDate,
      size,
      gender,
      roles,
      data,
      user: user._id,
    });
    console.log("newclient", newClient);
    const savedClient = await newClient.save();
    user.client = user.client.concat(savedClient._id);
    user.save();
    response.json({ success: true, savedClient });
  } catch (error) {
    response.json({ success: false, error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const response = await Client.findByIdAndDelete(req.params.id);
    res.json({ success: true, response });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Client.findByIdAndUpdate(
      id,
      {
        email: req.body.email,
        birthDate: req.body.birthDate,
        size: req.body.size,
        gender: req.body.gender,
        roles: req.body.roles,
      },
      { new: true }
    );

    res.json({ updatedClient: result });
  } catch (error) {
    console.log(error);
  }
};
