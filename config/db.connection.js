import mongoose from "mongoose";
import "dotenv/config";

// Admin Database Connection
export const adminDB = mongoose.createConnection(process.env.ADMIN_MONGODB_URL);
adminDB.on("connected", () =>console.log("Admin Database Connected Successfully"));
adminDB.on("error", (err) =>console.error("Admin Database Connection Error:", err));

// Client Database Connection
export const clientDB = mongoose.createConnection(process.env.CLIENT_MONGODB_URL);
clientDB.on("connected", () =>console.log("Client Database Connected Successfully"));
clientDB.on("error", (err) =>console.error("Client Database Connection Error:", err));

export const salesCrmDb = mongoose.createConnection(process.env.SALES_CRM_MONGODB_URL)
salesCrmDb.on("connected", () =>console.log("Sales CRM Database Connected Successfully"));
salesCrmDb.on("error", (err) =>console.error("Sales CRM Database Connection Error:", err));


