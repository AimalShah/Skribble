import { Router, Response } from "express";
import { User, IUser } from "../models/User";
import { authMiddleware, AuthRequest, signToken } from "../middleware/auth";

const router = Router();

// Register
router.post("/register", async (req, res: Response) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: "Email, password, and displayName are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const user = new User({ email, password, displayName });
    await user.save();

    const token = signToken(user._id as unknown as string);
    const userObj = user.toObject();
    res.status(201).json({ token, user: userObj });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Registration failed" });
  }
});

// Login
router.post("/login", async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user and explicitly include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare password using the model's method
    const bcrypt = await import("bcrypt");
    const isMatch = await bcrypt.default.compare(password, (user as any).password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user._id as unknown as string);
    const userObj = user.toObject();
    res.json({ token, user: userObj });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Login failed" });
  }
});

// Get current user
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: user.toObject() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to get user" });
  }
});

export default router;
