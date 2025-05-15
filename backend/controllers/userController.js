const User = require("../models/userSchema");
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
    if (existingUser) return res.status(401).json({ message: "User already registered" });

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
      domain: "localhost",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      signed: true,
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
