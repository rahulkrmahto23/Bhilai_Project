const User = require("../models/userSchema");
const Permit = require("../models/addPermitSchema");
const { hash, compare } = require("bcrypt");
const { createToken } = require("../utils/token-manager");
const { COOKIE_NAME } = require("../utils/constrants");

exports.userSignup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role === "ADMIN") {
      const existingAdmin = await User.findOne({ role: "ADMIN" });
      if (existingAdmin) {
        return res.status(400).json({
          message: "An Admin is already registered. You cannot register another Admin.",
        });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(401).json({ message: "User already registered" });

    const hashedPassword = await hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "CLIENT",
    });

    await user.save();

    const token = createToken(user._id.toString(), user.email, user.role, "7d");

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      signed: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(201).json({
      message: "User Registered",
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not registered" });

    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(403).json({ message: "Incorrect Password" });

    const token = createToken(user._id.toString(), user.email, user.role);

    res.cookie(COOKIE_NAME, token, {
      path: "/",
      httpOnly: true,
      signed: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      message: "Login Successful",
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};

exports.userLogout = (req, res) => {
  res.clearCookie(COOKIE_NAME);
  return res.status(200).json({ message: "Successfully Logged Out" });
};

exports.createPermit = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user context" });
    }

    const {
      permitNumber,
      poNumber,
      employeeName,
      permitType,
      permitStatus,
      location,
      remarks,
      issueDate,
      expiryDate,
    } = req.body;

    const createdBy = req.user.id; // ✅ FIXED (was _id)

    const permit = new Permit({
      permitNumber,
      poNumber,
      employeeName,
      permitType,
      permitStatus,
      location,
      remarks,
      issueDate,
      expiryDate,
      createdBy,
    });

    await permit.save();

    return res.status(201).json({
      message: "Permit created successfully",
      permit,
    });
  } catch (error) {
    console.error("🚨 Permit Creation Error:", error);
    return res.status(500).json({ message: "Error creating permit", error: error.message });
  }
};

exports.getAllPermits = async (req, res) => {
  try {
    const permits = await Permit.find().populate("createdBy", "name email role");

    return res.status(200).json({
      message: "All permits fetched successfully",
      permits,
    });
  } catch (error) {
    console.error("🚨 Error fetching permits:", error);
    return res.status(500).json({ message: "Error fetching permits", error: error.message });
  }
};

exports.editPermit = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Validate user access (e.g., only the creator or admin can edit)
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user context" });
    }

    const updatedData = req.body;

    const updatedPermit = await Permit.findByIdAndUpdate(id, updatedData, {
      new: true, // returns the updated document
      runValidators: true, // ensure validation rules apply
    });

    if (!updatedPermit) {
      return res.status(404).json({ message: "Permit not found" });
    }

    return res.status(200).json({
      message: "Permit updated successfully",
      permit: updatedPermit,
    });
  } catch (error) {
    console.error("🚨 Error updating permit:", error);
    return res.status(500).json({ message: "Error updating permit", error: error.message });
  }
};
exports.deletePermit = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Validate user access (e.g., only the creator or admin can delete)
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user context" });
    }

    const deletedPermit = await Permit.findByIdAndDelete(id);

    if (!deletedPermit) {
      return res.status(404).json({ message: "Permit not found" });
    }

    return res.status(200).json({
      message: "Permit deleted successfully",
      permit: deletedPermit,
    });
  } catch (error) {
    console.error("🚨 Error deleting permit:", error);
    return res.status(500).json({ message: "Error deleting permit", error: error.message });
  }
};

exports.searchPermits = async (req, res) => {
  try {
    const { query } = req.query; // expects: /api/permits/search?query=someValue

    if (!query) {
      return res.status(400).json({ message: "No search query provided" });
    }

    const searchRegex = new RegExp(query, "i"); // case-insensitive search

    const permits = await Permit.find({
      $or: [
        { permitNumber: searchRegex },
        { poNumber: searchRegex },
        { employeeName: searchRegex },
        { permitType: searchRegex },
        { permitStatus: searchRegex },
        { location: searchRegex },
        { remarks: searchRegex },
        { issueDate: searchRegex },
        { expiryDate: searchRegex },
      ],
    }).populate("createdBy", "name email role");

    return res.status(200).json({
      message: "Search results fetched successfully",
      permits,
    });
  } catch (error) {
    console.error("🚨 Error searching permits:", error);
    return res.status(500).json({ message: "Error searching permits", error: error.message });
  }
};
