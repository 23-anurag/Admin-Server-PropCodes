import mongoose from "mongoose";

// Define Employee Schema (should be same as the one in employee app)
const employeeSchema = new mongoose.Schema(
  {
    profile_Photo: { type: String, default: "" },
    emp_Name: { type: String, required: [true, "Missing Fullname"] },
    emp_Email: {
      type: String,
      required: [true, "Missing Email"],
      unique: true,
    },
    emp_Id: {
      type: String,
      required: [true, "Missing Employee ID"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Missing Password"],
      select: false,
    },
    emp_Role: {
      type: String,
      enum: ["CRM", "Broker", "Builder", "Owner", "Tenant"],
    },
    dob: { type: String },
    gender: { type: String, enum: ["Male", "Female"] },
    marital_Status: { type: String },
    designation: { type: String },
    department: { type: String },
    salary: { type: Number },
    bank_Name: { type: String },
    account_Holder_Name: { type: String },
    account_Number: { type: String, unique: true }, // ✅ IFSC & Account Number should be Strings
    IFSC: { type: String },
    status: {
      type: String,
      enum: ["Approved", "Disapproved", "Pending", "Follow Up"],
      default: "Pending",
    },
    activity_Status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Register the model, but do NOT export it directly
export const registerEmployeeModel = (db) => {
  return db.model("Employee", employeeSchema);
};
