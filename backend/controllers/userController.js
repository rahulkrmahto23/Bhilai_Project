const User = require("../models/userSchema");
const Permit = require("../models/addPermitSchema");
const { hash, compare } = require("bcrypt");
const { createToken } = require("../utils/token-manager");
const { COOKIE_NAME } = require("../utils/constrants");
const mongoose = require("mongoose");

// Auth Controllers
exports.userSignup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role === "ADMIN") {
      const existingAdmin = await User.findOne({ role: "ADMIN" });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: "An Admin is already registered. You cannot register another Admin.",
        });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ 
        success: false,
        message: "User already registered" 
      });
    }

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
      success: true,
      message: "User Registered",
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "ERROR", 
      error: error.message 
    });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not registered" 
      });
    }

    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ 
        success: false,
        message: "Incorrect Password" 
      });
    }

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
      success: true,
      message: "Login Successful",
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "ERROR", 
      error: error.message 
    });
  }
};

exports.userLogout = (req, res) => {
  res.clearCookie(COOKIE_NAME);
  return res.status(200).json({ 
    success: true,
    message: "Successfully Logged Out" 
  });
};

// Permit Controllers
exports.createPermit = async (req, res) => {
  try {
    const userId = res.locals.jwtData.id;
    
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

    if (!permitNumber || !employeeName || !permitType) {
      return res.status(400).json({
        success: false,
        message: "Permit number, employee name, and permit type are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newPermit = new Permit({
      _id: new mongoose.Types.ObjectId(),
      permitNumber,
      poNumber,
      employeeName,
      permitType,
      permitStatus: permitStatus || "PENDING",
      location,
      remarks: remarks || "",
      issueDate: issueDate || new Date(),
      expiryDate,
      createdBy: userId,
      createdAt: new Date(),
    });

    await newPermit.save();

    res.status(201).json({
      success: true,
      message: "Permit created successfully",
      data: newPermit,
    });
  } catch (error) {
    console.error("Error creating permit:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getAllPermits = async (req, res) => {
  try {
    const userId = res.locals.jwtData.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // For ADMIN, get all permits
    // For others, get only their permits
    const query = user.role === "ADMIN" ? {} : { createdBy: userId };
    const permits = await Permit.find(query).populate("createdBy", "name email role");

    res.status(200).json({
      success: true,
      message: "Permits fetched successfully",
      data: permits,
    });
  } catch (error) {
    console.error("Error fetching permits:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getPermitById = async (req, res) => {
  try {
    const userId = res.locals.jwtData.id;
    const { permitId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(permitId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid permit ID",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // For ADMIN, can view any permit
    // For others, can only view their own permits
    const query = user.role === "ADMIN" 
      ? { _id: permitId } 
      : { _id: permitId, createdBy: userId };

    const permit = await Permit.findOne(query).populate("createdBy", "name email role");

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: "Permit not found or unauthorized access",
      });
    }

    res.status(200).json({
      success: true,
      message: "Permit fetched successfully",
      data: permit,
    });
  } catch (error) {
    console.error("Error fetching permit:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updatePermit = async (req, res) => {
  try {
    const userId = res.locals.jwtData.id;
    const { permitId } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(permitId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid permit ID",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // For ADMIN, can update any permit
    // For others, can only update their own permits
    const query = user.role === "ADMIN" 
      ? { _id: permitId } 
      : { _id: permitId, createdBy: userId };

    // Prevent changing createdBy and _id
    if (updateData.createdBy || updateData._id) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify createdBy or permit ID",
      });
    }

    const updatedPermit = await Permit.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email role");

    if (!updatedPermit) {
      return res.status(404).json({
        success: false,
        message: "Permit not found or unauthorized access",
      });
    }

    res.status(200).json({
      success: true,
      message: "Permit updated successfully",
      data: updatedPermit,
    });
  } catch (error) {
    console.error("Error updating permit:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.deletePermit = async (req, res) => {
  try {
    const userId = res.locals.jwtData.id;
    const { permitId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(permitId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid permit ID",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // For ADMIN, can delete any permit
    // For others, can only delete their own permits
    const query = user.role === "ADMIN" 
      ? { _id: permitId } 
      : { _id: permitId, createdBy: userId };

    const deletedPermit = await Permit.findOneAndDelete(query);

    if (!deletedPermit) {
      return res.status(404).json({
        success: false,
        message: "Permit not found or unauthorized access",
      });
    }

    res.status(200).json({
      success: true,
      message: "Permit deleted successfully",
      data: deletedPermit,
    });
  } catch (error) {
    console.error("Error deleting permit:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.searchPermits = async (req, res) => {
  try {
    const userId = res.locals.jwtData.id;
    const { 
      poNumber, 
      permitNumber, 
      permitStatus, 
      startDate, 
      endDate,
      employeeName,
      permitType 
    } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build the search query dynamically
    const searchQuery = user.role === "ADMIN" ? {} : { createdBy: userId };
    
    if (poNumber) searchQuery.poNumber = { $regex: poNumber, $options: 'i' };
    if (permitNumber) searchQuery.permitNumber = { $regex: permitNumber, $options: 'i' };
    if (employeeName) searchQuery.employeeName = { $regex: employeeName, $options: 'i' };
    if (permitType) searchQuery.permitType = { $regex: permitType, $options: 'i' };
    
    if (permitStatus && permitStatus !== 'ALL') {
      searchQuery.permitStatus = { $regex: permitStatus, $options: 'i' };
    }
    
    // Date range handling
    if (startDate || endDate) {
      searchQuery.issueDate = {};
      if (startDate) searchQuery.issueDate.$gte = new Date(startDate);
      if (endDate) searchQuery.issueDate.$lte = new Date(endDate);
    }

    const permits = await Permit.find(searchQuery)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: permits.length > 0 
        ? "Search results fetched successfully" 
        : "No permits found matching your criteria",
      data: permits,
    });
  } catch (error) {
    console.error("Error searching permits:", error);
    res.status(500).json({
      success: false,
      message: "Error searching permits",
      error: error.message,
    });
  }
};

// Additional utility endpoints
exports.getPermitStats = async (req, res) => {
  try {
    const userId = res.locals.jwtData.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const query = user.role === "ADMIN" ? {} : { createdBy: userId };
    
    const totalPermits = await Permit.countDocuments(query);
    const pendingPermits = await Permit.countDocuments({ ...query, permitStatus: 'PENDING' });
    const approvedPermits = await Permit.countDocuments({ ...query, permitStatus: 'APPROVED' });
    const rejectedPermits = await Permit.countDocuments({ ...query, permitStatus: 'REJECTED' });
    const expiredPermits = await Permit.countDocuments({ 
      ...query, 
      expiryDate: { $lt: new Date() } 
    });

    res.status(200).json({
      success: true,
      message: "Permit statistics fetched successfully",
      data: {
        totalPermits,
        pendingPermits,
        approvedPermits,
        rejectedPermits,
        expiredPermits
      }
    });
  } catch (error) {
    console.error("Error fetching permit stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching permit statistics",
      error: error.message,
    });
  }
};