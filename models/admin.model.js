import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { adminDB } from "../config/db.connection.js";

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    trim: true,
    select: false,
  },
  role: {
    type: String,
    enum: ["Administrator", "User"],
    default: "Administrator",
  },
  phone: {
    type: Number,
    trim: true,
  },
}, { timestamps: true });

// TOKEN FUNCTION
adminSchema.methods.createToken = function () {
  const payload = {
    id: this._id,
    role: this.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET);
};

const ADMIN = adminDB.model("ADMIN", adminSchema);

export default ADMIN;
