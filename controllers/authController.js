const User = require("../models/User");

const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

module.exports = {
  createUser: async (req, res) => {
    try {
      const newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(
          req.body.password,
          process.env.SECRET
        ).toString(),
        phonenumber: req.body.phonenumber,
      });
      await newUser.save();
      res.status(201).json({
        message: "user created successfully",
        user: {
          _id: newUser._id, // Include the user's ID in the response
          firstname: newUser.firstname,
          lastname: newUser.lastname,
          email: newUser.email,
          phonenumber: newUser.phonenumber,
        },
      });
      // res.status(201).json("user created successfully");
    } catch (error) {
      console.error("Error creating user: ", error);
      res.status(500).json({ message: error });
      // res.status(500).json("failed to create the user");
    }
  },

  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ phonenumber: req.body.phonenumber });
      console.log(user);

      if (!user) {
        return res
          .status(401)
          .json("Wrong credentials, provide a valid phone number");
      }

      // const decryptedPassword = CryptoJS.AES.decrypt(
      //   user.password,
      //   process.env.SECRET
      // );
      // const decryptedpass = decryptedPassword.toString(CryptoJS.enc.Utf8);

      // if (decryptedpass !== req.body.password) {
      //   return res.status(401).json("Wrong password");
      // }

      // const userToken = jwt.sign(
      //   {
      //     id: user.id,
      //   },
      //   process.env.JWT_SEC,
      //   { expiresIn: "7d" }
      // );

      const { password, __v, createdAt, updatedAt, ...userData } = user._doc;

      // res.status(200).json({ ...userData, token: userToken });
      res.status(200).json({ ...userData });
      // res.status(200).json("Phone number exists");
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },
};
