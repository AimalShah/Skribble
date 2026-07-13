import { Router, Response } from "express";
import { User } from "../models/User";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// Update user stats after a game
router.post("/update", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { gamesPlayed, gamesWon, totalScore, drawingRounds, wordsGuessed } = req.body;

    const update: Record<string, number> = {};
    if (gamesPlayed !== undefined) update["stats.gamesPlayed"] = gamesPlayed;
    if (gamesWon !== undefined) update["stats.gamesWon"] = gamesWon;
    if (totalScore !== undefined) update["stats.totalScore"] = totalScore;
    if (drawingRounds !== undefined) update["stats.drawingRounds"] = drawingRounds;
    if (wordsGuessed !== undefined) update["stats.wordsGuessed"] = wordsGuessed;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $inc: update },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: user.toObject() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update stats" });
  }
});

export default router;
