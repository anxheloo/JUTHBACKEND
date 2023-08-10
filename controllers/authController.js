const User = require("../models/User");

const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

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

      // Generate a random 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000);

      // Store the verification code for the user
      user.verificationCode = verificationCode;
      await user.save();

      // Send the verification code via email
      const transporter = nodemailer.createTransport({
        service: "Gmail", // e.g., Gmail
        auth: {
          user: "nixhinixhi1@gmail.com",
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: "nixhinixhi1@gmail.com",
        to: user.email,
        subject: "Email Verification Code",
        text: `Hello,

Your verification code is: ${verificationCode}

Best regards,
Anxhelo Cenollari
Email: nixhinixhi1@gmail.com`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
          return res.status(500).json({ message: "Failed to send email" });
        } else {
          console.log("Email sent:", info.response);
          res.status(200).json({ message: "Verification code sent" });
        }
      });

      const { password, __v, createdAt, updatedAt, ...userData } = user._doc;

      // res.status(200).json({ ...userData, token: userToken });
      res.status(200).json({ ...userData });
      // res.status(200).json("Phone number exists");
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { phonenumber, verificationCode } = req.body;

      // Find the user by phone number
      const user = await User.findOne({ phonenumber });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the verification code matches
      if (user.verificationCode !== verificationCode) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      // Mark the user's email as verified (you can add a field in the User model for email verification status)
      user.isEmailVerified = true;
      await user.save();

      res.status(200).json({ message: "Email verification successful" });
    } catch (error) {
      console.error("Error verifying email: ", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  },
};
