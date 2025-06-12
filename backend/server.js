const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const corsOptions = {
    origin: ["https://my-backend-cedd.onrender.com", "http://localhost:5500", "http://localhost:3000"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true
};
app.use(cors(corsOptions));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// ============= SCHEMAS =============

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user", enum: ["user", "admin"] },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User = mongoose.model("User", userSchema);

// User Profile Schema (Extended)
const userProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    fatherName: String,
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    mealType: {
        type: String,
        enum: ['Premium', 'Executive', 'Half Executive', 'Regular'],
        default: 'Regular'
    },
    startDate: Date,
    photo: String,
    balance: { type: Number, default: 0 },
    mealStatus: {
        status: { type: String, enum: ['on', 'off', 'tna'], default: 'on' },
        offFrom: Date,
        offTo: Date,
        reason: String
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

// Payment Schema
const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true, unique: true },
    upiId: String,
    paymentDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    rejectionReason: String
});

const Payment = mongoose.model("Payment", paymentSchema);

// Meal Delivery Schema
const mealDeliverySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    mealType: String,
    delivered: { type: Boolean, default: false },
    deliveryTime: Date,
    cost: Number,
    status: {
        type: String,
        enum: ['scheduled', 'delivered', 'cancelled', 'missed'],
        default: 'scheduled'
    }
});

const MealDelivery = mongoose.model("MealDelivery", mealDeliverySchema);

// Meal Plan Schema
const mealPlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    items: [String],
    isActive: { type: Boolean, default: true }
});

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);

// ============= MIDDLEWARE =============

// Authenticate Token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET || "mysecretkey", (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
};

// Admin Middleware
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

app.use("/uploads", express.static("uploads"));

// ============= AUTH ROUTES =============

// Signup Route
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();

        // Create default profile
        const profile = new UserProfile({
            userId: newUser._id,
            fullName: name,
            email: email,
            phone: '',
            address: '',
            mealType: 'Regular'
        });
        await profile.save();

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

        // Check for admin (you should store this in DB in production)
        if (email === "admin@gmail.com" && password === "321") {
            const token = jwt.sign(
                { userId: "admin", email: email, name: "Admin", role: "admin" },
                process.env.JWT_SECRET || "mysecretkey",
                { expiresIn: "24h" }
            );
            return res.status(200).json({ token, role: "admin", message: "Admin login successful" });
        }

        // Regular user login
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name, role: user.role },
            process.env.JWT_SECRET || "mysecretkey",
            { expiresIn: "24h" }
        );

        res.status(200).json({ token, role: user.role, message: "Login successful" });
    } catch (error) {
        console.error("❌ Error in login:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ============= USER ROUTES =============

// Get User Profile
app.get("/profile", authenticateToken, async (req, res) => {
    try {
        const profile = await UserProfile.findOne({ userId: req.user.userId })
            .populate('userId', 'name email createdAt');

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update User Profile
app.post("/profile", authenticateToken, upload.single("photo"), async (req, res) => {
    try {
        const updateData = { ...req.body, updatedAt: new Date() };
        if (req.file) {
            updateData.photo = `/uploads/${req.file.filename}`;
        }

        const profile = await UserProfile.findOneAndUpdate(
            { userId: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json({ message: "Profile updated successfully!", profile });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get User Dashboard Data
app.get("/user/dashboard", authenticateToken, async (req, res) => {
    try {
        const profile = await UserProfile.findOne({ userId: req.user.userId });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // Calculate daily cost based on meal type
        const mealPrices = {
            'Premium': 150,
            'Executive': 120,
            'Half Executive': 80,
            'Regular': 60
        };
        const dailyCost = mealPrices[profile.mealType] || 0;

        // Get meals this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const mealsThisMonth = await MealDelivery.countDocuments({
            userId: req.user.userId,
            date: { $gte: startOfMonth },
            status: 'delivered'
        });

        // Get total stats
        const totalMeals = await MealDelivery.countDocuments({
            userId: req.user.userId,
            status: 'delivered'
        });

        const totalSpent = await MealDelivery.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(req.user.userId), status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$cost' } } }
        ]);

        // Calculate active days
        const firstMeal = await MealDelivery.findOne({ userId: req.user.userId }).sort({ date: 1 });
        const activeDays = firstMeal ? Math.floor((new Date() - firstMeal.date) / (1000 * 60 * 60 * 24)) : 0;

        res.json({
            balance: profile.balance,
            dailyCost,
            mealsThisMonth,
            totalMeals,
            totalSpent: totalSpent[0]?.total || 0,
            activeDays,
            avgPerDay: activeDays > 0 ? ((totalSpent[0]?.total || 0) / activeDays).toFixed(2) : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Meal Status
app.post("/user/meal-status", authenticateToken, async (req, res) => {
    try {
        const { status, fromDate, toDate, days } = req.body;

        const profile = await UserProfile.findOne({ userId: req.user.userId });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        profile.mealStatus = {
            status: status === 'on' ? 'on' : days > 3 ? 'tna' : 'off',
            offFrom: fromDate,
            offTo: toDate
        };

        await profile.save();

        // Cancel scheduled meals if turning off
        if (status === 'off') {
            await MealDelivery.updateMany(
                {
                    userId: req.user.userId,
                    date: { $gte: new Date(fromDate), $lte: new Date(toDate) },
                    status: 'scheduled'
                },
                { status: 'cancelled' }
            );
        }

        res.json({ message: "Meal status updated successfully", mealStatus: profile.mealStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Submit Payment
app.post("/user/payment", authenticateToken, async (req, res) => {
    try {
        const { amount, transactionId, upiId } = req.body;

        // Check if transaction ID already exists
        const existingPayment = await Payment.findOne({ transactionId });
        if (existingPayment) {
            return res.status(400).json({ message: "Transaction ID already exists" });
        }

        const payment = new Payment({
            userId: req.user.userId,
            amount: parseFloat(amount),
            transactionId,
            upiId
        });

        await payment.save();

        res.json({ message: "Payment submitted successfully. Waiting for admin approval.", payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Payment History
app.get("/user/payments", authenticateToken, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user.userId })
            .sort({ paymentDate: -1 })
            .limit(10);

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Change Meal Plan
app.put("/user/meal-plan", authenticateToken, async (req, res) => {
    try {
        const { mealType } = req.body;

        const profile = await UserProfile.findOneAndUpdate(
            { userId: req.user.userId },
            { mealType, updatedAt: new Date() },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json({ message: "Meal plan updated successfully", profile });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ============= ADMIN ROUTES =============

// Get Admin Dashboard Stats
app.get("/admin/stats", authenticateToken, isAdmin, async (req, res) => {
    try {
        // Get user counts
        const totalUsers = await User.countDocuments({ role: 'user' });
        const activeUsers = await UserProfile.countDocuments({ 'mealStatus.status': 'on' });

        // Get today's meals
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaysMeals = await MealDelivery.countDocuments({
            date: { $gte: today, $lt: tomorrow },
            status: 'scheduled'
        });

        // Get pending payments
        const pendingActions = await Payment.countDocuments({ status: 'pending' });

        res.json({
            totalUsers,
            activeUsers,
            todaysMeals,
            pendingActions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get All User Profiles (Admin)
app.get("/admin/profiles", authenticateToken, isAdmin, async (req, res) => {
    try {
        const profiles = await UserProfile.find()
            .populate('userId', 'name email isActive')
            .sort({ createdAt: -1 });

        // Add status information
        const profilesWithStatus = profiles.map(profile => {
            const profileObj = profile.toObject();

            // Determine user status
            if (profile.balance <= 0) {
                profileObj.status = 'exhausted';
            } else if (profile.mealStatus.status === 'tna') {
                profileObj.status = 'tna';
            } else if (profile.mealStatus.status === 'off') {
                profileObj.status = 'meal-off';
            } else if (profile.userId && !profile.userId.isActive) {
                profileObj.status = 'inactive';
            } else {
                profileObj.status = 'active';
            }

            return profileObj;
        });

        res.json(profilesWithStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Single User Profile (Admin)
app.get("/admin/profile/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const profile = await UserProfile.findById(req.params.id)
            .populate('userId', 'name email');

        if (!profile) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update User Profile (Admin)
app.put("/admin/profile/:id", authenticateToken, isAdmin, upload.single("photo"), async (req, res) => {
    try {
        const updateData = { ...req.body, updatedAt: new Date() };
        if (req.file) {
            updateData.photo = `/uploads/${req.file.filename}`;
        }

        const profile = await UserProfile.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Profile updated successfully!", profile });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete User (Admin)
app.delete("/admin/profile/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const profile = await UserProfile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete profile
        await UserProfile.deleteOne({ _id: req.params.id });

        // Deactivate user account
        await User.findByIdAndUpdate(profile.userId, { isActive: false });

        res.json({ message: "User deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create New User (Admin)
app.post("/admin/create-user", authenticateToken, isAdmin, upload.single("photo"), async (req, res) => {
    try {
        const { fullName, fatherName, phone, email, address, mealType, startDate, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Create user account
        const newUser = new User({
            name: fullName,
            email,
            password: password || email // Use provided password or email as default
        });
        await newUser.save();

        // Create user profile
        const profileData = {
            userId: newUser._id,
            fullName,
            fatherName,
            phone,
            email,
            address,
            mealType: mealType || 'Regular',
            startDate: startDate || new Date()
        };

        if (req.file) {
            profileData.photo = `/uploads/${req.file.filename}`;
        }

        const newProfile = new UserProfile(profileData);
        await newProfile.save();

        res.status(201).json({
            message: "User created successfully",
            user: newUser,
            profile: newProfile
        });
    } catch (error) {
        console.error("❌ Error creating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get Pending Payments (Admin)
app.get("/admin/payments/pending", authenticateToken, isAdmin, async (req, res) => {
    try {
        const payments = await Payment.find({ status: 'pending' })
            .populate('userId', 'name email')
            .sort({ paymentDate: -1 });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Approve Payment (Admin)
app.put("/admin/payment/:id/approve", authenticateToken, isAdmin, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({ message: "Payment already processed" });
        }

        // Update payment status
        payment.status = 'approved';
        payment.approvedBy = req.user.userId;
        payment.approvedAt = new Date();
        await payment.save();

        // Add balance to user profile
        await UserProfile.findOneAndUpdate(
            { userId: payment.userId },
            { $inc: { balance: payment.amount } }
        );

        res.json({ message: "Payment approved successfully", payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reject Payment (Admin)
app.put("/admin/payment/:id/reject", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({ message: "Payment already processed" });
        }

        payment.status = 'rejected';
        payment.rejectionReason = reason;
        payment.approvedBy = req.user.userId;
        payment.approvedAt = new Date();
        await payment.save();

        res.json({ message: "Payment rejected", payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get All Payments (Admin)
app.get("/admin/payments", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.paymentDate = {};
            if (startDate) filter.paymentDate.$gte = new Date(startDate);
            if (endDate) filter.paymentDate.$lte = new Date(endDate);
        }

        const payments = await Payment.find(filter)
            .populate('userId', 'name email')
            .populate('approvedBy', 'name')
            .sort({ paymentDate: -1 });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Bulk Update User Balance (Admin)
app.post("/admin/bulk-balance-update", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { userIds, amount, operation } = req.body; // operation: 'add' or 'deduct'

        const update = operation === 'add'
            ? { $inc: { balance: amount } }
            : { $inc: { balance: -amount } };

        const result = await UserProfile.updateMany(
            { _id: { $in: userIds } },
            update
        );

        res.json({
            message: `Balance updated for ${result.modifiedCount} users`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ============= MEAL MANAGEMENT =============

// Get Meal Plans
app.get("/meal-plans", authenticateToken, async (req, res) => {
    try {
        const mealPlans = await MealPlan.find({ isActive: true });
        res.json(mealPlans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create/Update Meal Plan (Admin)
app.post("/admin/meal-plan", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, price, items } = req.body;

        let mealPlan = await MealPlan.findOne({ name });

        if (mealPlan) {
            mealPlan.price = price;
            mealPlan.items = items;
            await mealPlan.save();
        } else {
            mealPlan = new MealPlan({ name, price, items });
            await mealPlan.save();
        }

        res.json({ message: "Meal plan saved successfully", mealPlan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ============= SCHEDULED TASKS =============

// Daily Balance Deduction (This should be run as a cron job)
async function deductDailyBalance() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all active users
        const activeProfiles = await UserProfile.find({
            'mealStatus.status': 'on',
            balance: { $gt: 0 }
        });

        const mealPrices = {
            'Premium': 150,
            'Executive': 120,
            'Half Executive': 80,
            'Regular': 60
        };

        for (const profile of activeProfiles) {
            const dailyCost = mealPrices[profile.mealType] || 0;

            if (profile.balance >= dailyCost) {
                // Deduct balance
                profile.balance -= dailyCost;
                await profile.save();

                // Create meal delivery record
                const delivery = new MealDelivery({
                    userId: profile.userId,
                    date: today,
                    mealType: profile.mealType,
                    cost: dailyCost,
                    status: 'scheduled'
                });
                await delivery.save();
            } else {
                // Insufficient balance - update meal status
                profile.mealStatus.status = 'off';
                profile.mealStatus.reason = 'Insufficient balance';
                await profile.save();
            }
        }

        console.log('✅ Daily balance deduction completed');
    } catch (error) {
        console.error('❌ Error in daily balance deduction:', error);
    }
}

// Run daily at midnight (you should use a proper scheduler like node-cron)
// Example with node-cron:
// const cron = require('node-cron');
// cron.schedule('0 0 * * *', deductDailyBalance);

// ============= ERROR HANDLING =============

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Something went wrong!",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============= INITIALIZE DEFAULT DATA =============

async function initializeDefaultData() {
    try {
        // Create default meal plans if they don't exist
        const defaultMealPlans = [
            {
                name: 'Premium',
                price: 150,
                items: ['4 Chapati', 'Rice (Unlimited)', 'Dal', '2 Vegetables', 'Salad', 'Sweet Dish', 'Pickle & Papad']
            },
            {
                name: 'Executive',
                price: 120,
                items: ['3 Chapati', 'Rice', 'Dal', '1 Vegetable', 'Salad', 'Pickle']
            },
            {
                name: 'Half Executive',
                price: 80,
                items: ['2 Chapati', 'Rice', 'Dal', '1 Vegetable', 'Pickle']
            },
            {
                name: 'Regular',
                price: 60,
                items: ['2 Chapati', 'Rice (Limited)', 'Dal', '1 Vegetable']
            }
        ];

        for (const plan of defaultMealPlans) {
            const existing = await MealPlan.findOne({ name: plan.name });
            if (!existing) {
                await MealPlan.create(plan);
                console.log(`✅ Created ${plan.name} meal plan`);
            }
        }

        // Create admin account if it doesn't exist
        const adminEmail = "admin@gmail.com";
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            const adminUser = new User({
                name: "Admin",
                email: adminEmail,
                password: "321", // This will be hashed
                role: "admin"
            });
            await adminUser.save();
            console.log("✅ Admin account created");
        }

    } catch (error) {
        console.error("❌ Error initializing default data:", error);
    }
}

// ============= SERVER STARTUP =============

const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log("✅ Uploads directory created");
}

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Initialize default data
    await initializeDefaultData();

    // Log API endpoints
    console.log("\n📌 API Endpoints:");
    console.log("Auth:");
    console.log("  POST   /signup");
    console.log("  POST   /auth/login");
    console.log("\nUser:");
    console.log("  GET    /profile");
    console.log("  POST   /profile");
    console.log("  GET    /user/dashboard");
    console.log("  POST   /user/meal-status");
    console.log("  POST   /user/payment");
    console.log("  GET    /user/payments");
    console.log("  PUT    /user/meal-plan");
    console.log("\nAdmin:");
    console.log("  GET    /admin/stats");
    console.log("  GET    /admin/profiles");
    console.log("  GET    /admin/profile/:id");
    console.log("  PUT    /admin/profile/:id");
    console.log("  DELETE /admin/profile/:id");
    console.log("  POST   /admin/create-user");
    console.log("  GET    /admin/payments");
    console.log("  GET    /admin/payments/pending");
    console.log("  PUT    /admin/payment/:id/approve");
    console.log("  PUT    /admin/payment/:id/reject");
    console.log("  POST   /admin/bulk-balance-update");
    console.log("  POST   /admin/meal-plan");
    console.log("\nMeals:");
    console.log("  GET    /meal-plans");
    console.log("\n✅ Server is ready!");
});

// ============= EXPORT FOR TESTING =============
module.exports = app;