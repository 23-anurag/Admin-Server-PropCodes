import { clientDB } from "../config/db.connection.js";
import "dotenv/config";
import mongoose from "mongoose";

const db = clientDB.useDb(process.env.CLIENT_DB_NAME);
const ALL_CLIENTS = db.collection("users");
const ALL_PROPERTIES = db.collection("properties");
export const UPDATE_CLIENT = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Example: Change user status

    const clientDatabase = clientDB.useDb(process.env.CLIENT_DB_NAME);

    const result = await clientDatabase.collection("users").updateOne(
      { _id: new mongoose.Types.ObjectId(id) }, // Match by ID
      { $set: { status: status } } // Update the status field
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "User not found or no change made" });
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user in client DB" });
  }
};

export const GET_ALL_CLIENTS = async (req, res) => {
  const { page, limit } = req.query;

  try {
    // Ensure the Client Database connection is established before querying
    if (!clientDB.readyState) {
      return res.status(500).json({ message: "Client Database Not Connected" });
    }

    const userData = await clientDB
      .useDb(process.env.CLIENT_DB_NAME)
      .collection("users")
      .find()
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .toArray();

    const totalClients = await clientDB
      .useDb(process.env.CLIENT_DB_NAME)
      .collection("users")
      .countDocuments();

    return res.status(200).json({
      success: true,
      clients: userData,
      totalPages: Math.ceil(totalClients / limit),
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return res
      .status(500)
      .json({ message: "Error retrieving client collections" });
  }
};

export const GET_ALL_CLIENT_PROPERTIES = async (req, res) => {
  const { page, limit } = req.query;
  try {
    const allProperties = await ALL_PROPERTIES.find()
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .toArray();

    const totalProperties = await ALL_PROPERTIES.countDocuments();
    return res
      .status(200)
      .json({
        success: true,
        allProperties,
        totalPages: Math.ceil(totalProperties / limit),
      });
  } catch (error) {
    console.log("Error while fetching client properties");
    return res.status(500).json({ message: error.message, success: false });
  }
};
