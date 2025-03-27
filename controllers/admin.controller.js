import { clientDB } from "../config/db.connection.js";
import ADMIN from "../models/admin.model.js";
import "dotenv/config";
import mongoose from "mongoose";

const db = clientDB.useDb(process.env.CLIENT_DB_NAME);
const ALL_PLANS = db.collection("plans");

export const ADMIN_REGITSER = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role = "Administrator",
    phone,
  } = req.body;

  try {
    // CHECKING FOR REQUIRED FIELDS
    if (!firstName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // CHECKING FOR ALREADY EXISTING USER
    const user = await ADMIN.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // CREATING NEW USER IN DATABASE
    const newUser = await ADMIN.create({
      firstName,
      email,
      password,
      role,
    });

    // ADDING LAST NAME AND PHONE IF PROVIDED

    if (lastName) {
      newUser.lastName = lastName;
    }
    if (phone) {
      newUser.phone = phone;
    }

    // SENDING RESPONSE
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.log("Error while Registering User: ", error.message);
    res
      .status(500)
      .json({ message: "Error while registering user in register controller" });
  }
};

export const ADMIN_LOGIN = async (req, res) => {
  const { email, password } = req.body.data || req.body;

  try {
    // CHECKING REQUIRED FIELDS
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // CHECKING FOR NON-EXISTING USER
    const user = await ADMIN.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    // FINALLY VALIDATING USER
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    // CREATE COOKIE IF USER IS VALID
    const token = user.createToken();
    const tokenExpiry = 24 * 60 * 60 * 1000; // 24 hrs

    // RESPONS USER TO BE SENT TO USER
    const responseUser = {
      id: user._id,
      name: user.firstName + (user.lastName ? " " + user.lastName : ""),
      email: user.email,
    };

    // SENDING RESPONSE
    res.cookie("userToken", token, { httpOnly: true, maxAge: tokenExpiry });
    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      responseUser,
    });
  } catch (error) {
    console.log("Error while logging in user: ", error.message);
    return res.status(500).json({ message: "Error while logging in user" });
  }
};

export const GET_ADMIN_DETAILS = async (req, res) => {
  const admin = req.admin;

  try {
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin Not Found" });
    }

    return res.status(201).json({ admin });
  } catch (error) {
    console.log("Error while fetching admin: ", error.message);
    return res.status(500).json({ message: "Error while fetching admin" });
  }
};

export const CHECK_ADMIN_AUTH = async (req, res) => {
  const token = req.cookies.token; // ✅ Read HTTP-only cookie

  if (!token) {
    return res.status(401).json({ userLoggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({
      userLoggedIn: true, // ✅ Must return true if authenticated
      userId: decoded.id,
      userName: decoded.name,
      userEmail: decoded.email,
    });
  } catch (error) {
    return res.status(401).json({ userLoggedIn: false });
  }
};

export const ADMIN_LOGOUT = async (req, res) => {
  try {
    res.clearCookie("userToken");
    res
      .status(200)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    console.log("Error while logging out user: ", error.message);
    res.status(500).json({ message: "Error while logging out user" });
  }
};

export const GET_ALL_PLANS = async (req, res) => {
  try {
    const allPlans = await ALL_PLANS.find().toArray();
    return res.status(200).json({ success: true, allPlans });
  } catch (error) {
    console.log("Errors getting all plans for admin - ", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error while getting all plans" });
  }
};

// CREATE PLAN
export const CREATE_PLAN = async (req, res) => {
  try {
    const {
      name,
      price,
      duration,
      maxProperties,
      maxActiveProperties,
      maxSubUsers,
      features,
      featuresnotallowed,
    } = req.body;

    const newPlan = {
      name,
      price,
      duration,
      maxProperties,
      maxActiveProperties,
      maxSubUsers,
      features: features || [],
      featuresnotallowed: featuresnotallowed || [],
      isCustom: false,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ALL_PLANS.insertOne(newPlan);

    return res.status(201).json({
      success: true,
      plan: { _id: result.insertedId, ...newPlan },
    });
  } catch (error) {
    console.log("Internal Server error while creating plan -", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server error while creating plan",
    });
  }
};

// UPDATE PLAN
export const UPDATE_PLAN = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid Plan ID" });
  }

  const id_for_database_searching = new mongoose.Types.ObjectId(id);

  try {
    const plan = await ALL_PLANS.findOne({ _id: id_for_database_searching });

    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    const result = await ALL_PLANS.findOneAndUpdate(
      { _id: id_for_database_searching },
      { $set: updateData },
      { returnDocument: "after" } // MongoDB native option
    );

    return res.status(200).json({ success: true, plan: result.value });
  } catch (error) {
    console.log("Internal Server error while updating plan -", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server error while updating plan",
    });
  }
};

// DELETE PLAN
export const DELETE_PLAN = async (req, res) => {
  const { id } = req.params;
  const planID_for_database_searching = new mongoose.Types.ObjectId(id);

  try {
    const result = await ALL_PLANS.deleteOne({
      _id: planID_for_database_searching,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.log("Internal Server error while deleting plan -", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server error while deleting plan",
    });
  }
};
