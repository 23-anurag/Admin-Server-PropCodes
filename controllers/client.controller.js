import { clientDB } from "../config/db.connection.js";
import "dotenv/config";
import mongoose from "mongoose";

// const clientDatabase = clientDB.useDb(process.env.CLIENT_DB_NAME);

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
  
  try {
    // Ensure the Client Database connection is established before querying
    if (!clientDB.readyState) {
      return res.status(500).json({ message: "Client Database Not Connected" });
    }

    const userData = await clientDB.useDb(process.env.CLIENT_DB_NAME).collection("users").find().toArray();
    res.status(200).json({success:true, clients:userData});
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ message: "Error retrieving client collections" });
  }
};
