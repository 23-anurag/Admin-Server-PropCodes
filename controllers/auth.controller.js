import ADMIN from "../models/admin.model.js";

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
