const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// CORS Configuration
const corsOptions = {
    origin: ["http://192.168.238.60:5500", "http://localhost:5500"], // Allow frontend access
    methods: "GET,POST,PUT,DELETE",
    credentials: true
};
app.use(cors(corsOptions));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true // Use createIndex to avoid deprecation warning
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// User Model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" } // Default role is "user"
});
const User = mongoose.model("User", userSchema);

// Admin Credentials (hardcoded for simplicity)
const adminCredentials = {
    email: "admin@gmail.com",  // Set the admin email
    password: "321"    // Set the admin password
};

// Middleware to authenticate and extract user ID from JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || "mysecretkey", (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.sendStatus(403);
    }
    next();
};

// Signup Route
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log("Signup request received:", req.body);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("❌ Error in signup:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login Route
app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login request received:", req.body);

        // Check if the login is for admin
        if (email === adminCredentials.email && password === adminCredentials.password) {
            const token = jwt.sign(
                { userId: "admin", role: "admin" },
                process.env.JWT_SECRET || "mysecretkey",
                { expiresIn: "1h" }
            );
            return res.status(200).json({ token, role: "admin", message: "Admin login successful" });
        }

        // Check if user exists for regular users
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Check if password matches
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || "mysecretkey",
            { expiresIn: "1h" }
        );

        res.status(200).json({ token, role: user.role, message: "Login successful" });
    } catch (error) {
        console.error("❌ Error in login:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
module.exports = app;

app.use("/uploads", express.static("uploads"));

// Define Mongoose Schema
const userprofile = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: String,
    fatherName: String,
    phone: String,
    email: String,
    address: String,
    mealType: String,
    startDate: String,
    photo: String,
});

const Userprofiles = mongoose.model("Userdeshbord", userprofile);

// Multer for file uploads
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// API: Fetch User Profile
app.get("/profile", authenticateToken, async (req, res) => {
    try {
        const user = await Userprofiles.findOne({ userId: req.user.userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// API: Update User Profile
app.post("/profile", authenticateToken, upload.single("photo"), async (req, res) => {
    try {
        const { fullName, fatherName, phone, email, address, mealType, startDate } = req.body;
        const photo = req.file ? `/uploads/${req.file.filename}` : null;

        let user = await Userprofiles.findOne({ userId: req.user.userId });
        if (user) {
            user.fullName = fullName;
            user.fatherName = fatherName;
            user.phone = phone;
            user.email = email;
            user.address = address;
            user.mealType = mealType;
            user.startDate = startDate;
            if (photo) user.photo = photo; // Only update if a new file is uploaded
            await user.save();
        } else {
            user = new Userprofiles({ userId: req.user.userId, fullName, fatherName, phone, email, address, mealType, startDate, photo });
            await user.save();
        }

        res.json({ message: "Profile updated successfully!", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// API: Delete User Profile
app.delete("/profile", authenticateToken, async (req, res) => {
    try {
        const result = await Userprofiles.deleteOne({ userId: req.user.userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "Profile deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin API: Fetch All User Profiles
app.get("/admin/profiles", authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await Userprofiles.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin API: Update Any User Profile
app.put("/admin/profile/:id", authenticateToken, isAdmin, upload.single("photo"), async (req, res) => {
    try {
        const { fullName, fatherName, phone, email, address, mealType, startDate } = req.body;
        const photo = req.file ? `/uploads/${req.file.filename}` : null;

        let user = await Userprofiles.findById(req.params.id);
        if (user) {
            user.fullName = fullName;
            user.fatherName = fatherName;
            user.phone = phone;
            user.email = email;
            user.address = address;
            user.mealType = mealType;
            user.startDate = startDate;
            if (photo) user.photo = photo; // Only update if a new file is uploaded
            await user.save();
            res.json({ message: "Profile updated successfully!", user });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin API: Delete Any User Profile
app.delete("/admin/profile/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await Userprofiles.deleteOne({ _id: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "Profile deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin API: Create New User
// Admin API: Create New User
app.post("/admin/create-user", authenticateToken, isAdmin, upload.none(), async (req, res) => {
    try {
        const { fullName, fatherName, phone, email, address, mealType, startDate } = req.body;
        const password = email || phone; // Use email or phone as password

        if (!fullName || !email || !phone) {
            return res.status(400).json({ error: "Name, email, and phone are required." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const newUser = new User({ name: fullName, email, password });
        await newUser.save();

        const newUserProfile = new Userprofiles({
            userId: newUser._id,
            fullName,
            fatherName,
            phone,
            email,
            address,
            mealType,
            startDate
        });
        await newUserProfile.save();

        res.status(201).json({ message: "User created successfully", newUser, newUserProfile });
    } catch (error) {
        console.error("❌ Error in creating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
