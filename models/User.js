const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phonenumber: { type: String, required: true, unique: true },
    isEmailVerified: { type: Boolean },
    verificationCode: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
