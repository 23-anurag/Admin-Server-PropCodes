import { salesCrmDb } from "../config/db.connection.js"; // Import DB connection
import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerEmployeeModel } from "../models/crm_employee.model.js";
import mongoose from "mongoose";

const db = salesCrmDb.useDb(process.env.SALES_CRM_DB_NAME);
const ALL_EMPLOYEES = db.collection("employees");

export const REGISTER_CRM_USER = async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone,
      employeeId,
      dateOfBirth,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
      password,
      role,
      images,
    } = req.body.formData;

    const { bankAccountHolderName, bankAccountNumber, bankIFSCCode, bankName } =
      req.body.bankFormData;

    console.log(bankAccountNumber);

    // Register the Employee model if it's not already registered
    let EMPLOYEE;
    try {
      EMPLOYEE = db.model("Employee"); //IF DATABASE DOESN'T EXISTS, CREATE DATABASE
    } catch (error) {
      EMPLOYEE = await registerEmployeeModel(db); // IF DATABASE EXISTS
    }

    // Check if the employee already exists
    const existingEmployee = await EMPLOYEE.findOne({
      $or: [{ emp_Email: email }, { emp_Id: employeeId }],
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email or ID already exists.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // console.log(password,hashedPassword);

    // Create a new Employee document
    const newEmployee = new EMPLOYEE({
      emp_Name: fullname,
      emp_Email: email,
      emp_Phone: phone,
      emp_Id: employeeId,
      dob: dateOfBirth,
      gender,
      marital_Status: maritalStatus,
      designation,
      department,
      salary: Number(salary), // Convert salary to number
      password: password, // Assign hashed password
      emp_Role: role,
      profile_Photo: images.length > 0 ? images[0] : "", // Store first image if available
      bank_Name: bankName,
      account_Holder_Name: bankAccountHolderName,
      account_Number: bankAccountNumber,
      IFSC: bankIFSCCode, // IFSC should be a string
      activity_Status: false,
    });

    //Save employee to MongoDB using the existing model
    await newEmployee.save();

    return res.status(201).json({
      success: true,
      message: "Employee registered successfully",
      employeeId: newEmployee._id,
    });
  } catch (error) {
    console.error("Error creating CRM Employee:", error);
    res.status(500).json({ message: "Error creating CRM Employee" });
  }
};

export const GET_ALL_CRM_USERS = async (req, res) => {
  const { page, limit } = req.query;
  console.log(page, limit);

  try {
    // Fetch the employees from the database
    const allEmployees = await ALL_EMPLOYEES.find()
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .toArray();

    const totalEmployees = await ALL_EMPLOYEES.countDocuments();

    return res.status(200).json({
      success: true,
      allEmployees,
      totalPages: Math.ceil(totalEmployees / limit),
    });
  } catch (error) {
    console.log("Error while fetching all CRM Employees");
    return res
      .status(500)
      .json({ message: "Error while fetching all CRM Employees" });
  }
};

export const GET_SINGLE_CRM_USER_DETAILS = async (req, res) => {
  const { emp_id } = req.params;

  try {
    if (!emp_id) {
      return res.status(501).json({
        success: false,
        message: "Error while fetching single crm user details",
      });
    }

    const crmEmployee = await ALL_EMPLOYEES.findOne(
      { _id: new mongoose.Types.ObjectId(emp_id) },
      { projection: { password: 0, createdAt: 0, updatedAt: 0 } } // Exclude password
    );

    if (!crmEmployee) {
      return res
        .status(404)
        .json({ succes: false, message: "No CRM User Found" });
    }

    return res.status(201).json({ success: true, crmEmployee });
  } catch (error) {
    console.log("Error while fetching single crm user details", error.message);
    return res.status(501).json({
      success: false,
      message: "Error while fetching single crm user details",
    });
  }
};

export const UPDATE_CRM_USER = async (req, res) => {
  const { emp_id } = req.params;

  try {
    const updatedEmployeeDetails = req.body;

    if (!emp_id) {
      res
        .status(501)
        .json({ success: false, message: "Internal Server Error" });
    }

    const crmUser = await ALL_EMPLOYEES.findOne({
      _id: new mongoose.Types.ObjectId(emp_id),
    });

    if (!crmUser) {
      return res.status(501).json({
        success: false,
        message: "Error while fetching single crm user details",
      });
    }

    const updatedData = {
      emp_Name: updatedEmployeeDetails.emp_Name,
      emp_Email: updatedEmployeeDetails.emp_Email,
      emp_Id: updatedEmployeeDetails.emp_Id,
      emp_Role: updatedEmployeeDetails.emp_Role,
      dob: updatedEmployeeDetails.dob,
      gender: updatedEmployeeDetails.gender,
      marital_Status: updatedEmployeeDetails.marital_status,
      designation: updatedEmployeeDetails.designation,
      department: updatedEmployeeDetails.department,
      salary: updatedEmployeeDetails.salary,
      bank_Name: updatedEmployeeDetails.bank_Name,
      account_Holder_Name: updatedEmployeeDetails.account_Holder_Name,
      account_Number: updatedEmployeeDetails.account_Number,
      IFSC: updatedEmployeeDetails.IFSC,
      updatedAt: new Date(),
    };

    const updatedCrmUser = await ALL_EMPLOYEES.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(emp_id) },
      { $set: updatedData },
      { returnDocument: "after" } // Returns updated document
    );

    return res.status(201).json({ success: true, updatedCrmUser });
  } catch (error) {
    console.log("Error while updating CRM User:", error.message);
    res.status(501).json({ success: false, message: "Internal Server Error" });
  }
};

export const UPDATE_CRM_USER_PASSWORD = async (req, res) => {
  const { emp_id } = req.params;

  try {
    const newPassword = req.body.data;

    if (!emp_id) {
      res
        .status(501)
        .json({ success: false, message: "Internal Server Error" });
    }

    const crmUser = await ALL_EMPLOYEES.findOne({
      _id: new mongoose.Types.ObjectId(emp_id),
    });

    if (!crmUser) {
      return res.status(501).json({
        success: false,
        message: "Error while updating crm user password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedData = {
      password: hashedPassword,
    };

    const updatedCrmUser = await ALL_EMPLOYEES.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(emp_id) },
      { $set: updatedData },
      { returnDocument: "after" } // Returns updated document
    );

    return res.status(201).json({ success: true, updatedCrmUser });
  } catch (error) {
    console.log("Error while updating CRM User Password:", error.message);
    res.status(501).json({ success: false, message: "Internal Server Error" });
  }
};

export const UPDATE_CRM_USER_STATUS = async (req, res) => {
  const { emp_id } = req.params;

  try {
    const newStatus = req.body.newStatus;

    if (!emp_id) {
      res
        .status(501)
        .json({ success: false, message: "Internal Server Error" });
    }

    const crmUser = await ALL_EMPLOYEES.findOne({
      _id: new mongoose.Types.ObjectId(emp_id),
    });

    if (!crmUser) {
      return res.status(501).json({
        success: false,
        message: "Error while fetching single crm user details",
      });
    }

    const updatedData = {
      status: newStatus,
    };

    const updatedCrmUser = await ALL_EMPLOYEES.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(emp_id) },
      { $set: updatedData },
      { returnDocument: "after" } // Returns updated document
    );

    return res.status(201).json({ success: true, updatedCrmUser });
  } catch (error) {
    console.log("Error while updating CRM User Status:", error.message);
    res.status(501).json({ success: false, message: "Internal Server Error" });
  }
};

export const DELETE_CRM_USER = async (req, res) => {
  const { emp_id } = req.params;

  try {
    if (!emp_id) {
      res
        .status(501)
        .json({ success: false, message: "Internal Server Error" });
    }

    const crmUser = await ALL_EMPLOYEES.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(emp_id),
    });

    return res
      .status(201)
      .json({ success: true, message: "CRM User deleted successfully" });
  } catch (error) {
    console.log("Error while deleting CRM User", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
