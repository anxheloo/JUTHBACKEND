const User = require("../models/User");

const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//function to create token based on the user Id
const createToken = (userId) => {
  const payload = {
    userId: userId,
  };

  // Read the secret key from the environment variable
  const secretKey = process.env.JWT_SECRET;

  // Generate the token with the secret key and expiration time
  const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

  return token;
};

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

  /*
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

      console.log("THIS IS USER EMAIL:   ", user.email);

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

  */

  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ phonenumber: req.body.phonenumber });
      // console.log(user);

      if (!user) {
        return res
          .status(401)
          .json("Wrong credentials, provide a valid phone number");
      }

      /*
            const decryptedPassword = CryptoJS.AES.decrypt(
              user.password,
              process.env.SECRET
            );
            const decryptedpass = decryptedPassword.toString(CryptoJS.enc.Utf8);

            if (decryptedpass !== req.body.password) {
              return res.status(401).json("Wrong password");
            }

            */

      // Generate a random 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000);

      // Store the verification code for the user
      user.verificationCode = verificationCode;
      await user.save();

      // Send the verification code via email
      const msg = {
        // to: "anxhelocenollari@gmail.com",
        to: user.email,
        from: "anxhelocenollari@gmail.com", // Replace with your verified sender email
        subject: "Email Verification Code",
        text: `Hello,

        Your verification code is: ${verificationCode}

        Best regards,
        Anxhelo Cenollari
        Email: anxhelocenollari@gmail.com`,
      };

      console.log("THIS IS USER EMAIL:   ", user.email);

      /*
            const userToken = jwt.sign(
              {
                id: user.id,
              },
              process.env.JWT_SEC,
              { expiresIn: "1d" }
            );
*/

      const { password, __v, createdAt, updatedAt, ...userData } = user._doc;

      await sgMail.send(msg);
      console.log("Email sent");
      res.status(200).json({ userData, message: "Verification code sent" });
    } catch (error) {
      console.error("Error sending email:", error);
      // res.status(500).json({ message: "Failed to send email" });
      if (error.response) {
        console.error(error.response.body);
      }
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { phonenumber, verificationCode } = req.body;

      console.log(phonenumber, verificationCode);

      // Find the user by phone number
      const user = await User.findOne({
        phonenumber,
      });
      console.log(phonenumber);
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

      const { password, __v, createdAt, updatedAt, ...userData } = user._doc;

      const token = createToken(user._id);

      console.log("THIS IS TOKEN:", token);

      return res.status(200).json({
        userData,
        message: "Email verification successful",
        token: token,
      });
    } catch (error) {
      console.error("Error verifying email: ", error);
      return res.status(500).json({ message: "Failed to verify email" });
    }
  },
};
