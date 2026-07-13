import { Router, Response } from "express";
import { User } from "../models/User";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// Get public profile
router.get("/:userId", async (req, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: user.toObject() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to get profile" });
  }
});

// Update own profile
router.put("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { displayName, avatar } = req.body;
    const updates: any = {};

    if (displayName !== undefined) updates.displayName = displayName;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: user.toObject() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update profile" });
  }
});

export default router;
