const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(__dirname);
const USERS_FILE = path.join(DATA_DIR, "users.json");

function seedUsers() {
  const defaultPasswordHash = bcrypt.hashSync("Admin123!", 10);
  return [
    {
      id: 1,
      fullName: "OY TAPSI Admin",
      username: "admin",
      email: "admin@oytapsi.local",
      password: defaultPasswordHash,
      role: "admin",
      createdAt: new Date().toISOString()
    }
  ];
}

function readUsers() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    const initial = seedUsers();
    fs.writeFileSync(USERS_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }

  const raw = fs.readFileSync(USERS_FILE, "utf8").trim();
  if (!raw) {
    const initial = seedUsers();
    fs.writeFileSync(USERS_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }

  return JSON.parse(raw);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

function getAllUsers() {
  return readUsers().map(sanitizeUser);
}

function getUserById(id) {
  const numericId = Number(id);
  const found = readUsers().find((u) => u.id === numericId);
  return found ? sanitizeUser(found) : null;
}

function findUserForLogin(identifier) {
  const normalized = String(identifier || "").trim().toLowerCase();
  return (
    readUsers().find(
      (u) =>
        u.email.toLowerCase() === normalized ||
        u.username.toLowerCase() === normalized
    ) || null
  );
}

async function createUser({ fullName, username, email, password, role }) {
  const users = readUsers();
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedUsername = String(username).trim().toLowerCase();

  const duplicate = users.find(
    (u) =>
      u.email.toLowerCase() === normalizedEmail ||
      u.username.toLowerCase() === normalizedUsername
  );

  if (duplicate) {
    return { error: "An account with that email or username already exists.", status: 409 };
  }

  const nextId =
    users.length > 0 ? Math.max(...users.map((u) => Number(u.id) || 0)) + 1 : 1;

  const hashedPassword = await bcrypt.hash(String(password), 10);

  const newUser = {
    id: nextId,
    fullName: String(fullName).trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    role: role === "admin" ? "admin" : "staff",
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  return { user: sanitizeUser(newUser), status: 201 };
}

module.exports = {
  getAllUsers,
  getUserById,
  findUserForLogin,
  createUser
};