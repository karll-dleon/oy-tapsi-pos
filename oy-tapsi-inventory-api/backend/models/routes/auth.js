const express = require("express");
const bcrypt = require("bcryptjs");
const {
  getAllUsers,
  getUserById,
  findUserForLogin,
  createUser
} = require("../../../data/authStore");

const router = express.Router();

// SIGNUP: Register a new user
router.post("/signup", async (req, res) => {
  try {
    const { fullName, username, email, password, role } = req.body || {};

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        message: "fullName, username, email, and password are required."
      });
    }

    const result = await createUser({ fullName, username, email, password, role });
    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    return res.status(201).json({
      message: "Signup successful. User registered.",
      data: result.user
    });
  } catch (err) {
    return res.status(500).json({
      message: "Signup failed.",
      error: err.message
    });
  }
});

// LOGIN: Verify user credentials
router.post("/login", async (req, res) => {
  try {
    const { email, username, password } = req.body || {};
    const identifier = email || username;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Email/username and password are required."
      });
    }

    const user = findUserForLogin(identifier);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const validPassword = await bcrypt.compare(String(password), user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    return res.status(200).json({
      message: "Login successful.",
      data: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({
      message: "Login failed.",
      error: err.message
    });
  }
});

// FETCH ALL USERS: View registered signup records
router.get("/users", (req, res) => {
  const users = getAllUsers();
  return res.status(200).json({
    count: users.length,
    data: users
  });
});

// FETCH SINGLE USER BY ID: View one registered user
router.get("/users/:id", (req, res) => {
  const user = getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  return res.status(200).json({ data: user });
});

module.exports = router;