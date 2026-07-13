import { Router, Response } from "express";
import { RoomMetadata } from "../models/RoomMetadata";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import bcrypt from "bcrypt";

const router = Router();

// Create a room
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, isPrivate, password, language, settings } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Room name is required" });
    }

    // Generate room ID (UUID format)
    const roomId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );

    // Hash password if private
    let passwordHash: string | null = null;
    if (isPrivate && password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const metadata = new RoomMetadata({
      roomId,
      ownerId: req.userId,
      name,
      isPrivate: isPrivate || false,
      passwordHash,
      published: false,
      language: language || "English",
      settings: {
        players: settings?.players || 2,
        drawTime: settings?.drawTime || 60,
        rounds: settings?.rounds || 1,
        wordCount: settings?.wordCount || 3,
        hints: settings?.hints || 2,
        customWords: settings?.customWords || [],
        onlyCustomWords: settings?.onlyCustomWords || false,
      },
      playerCount: 0,
      gameState: "NOT_STARTED",
    });

    await metadata.save();

    // Also create Redis room state (for real-time game)
    // This will be done when the player actually joins via socket
    // For now, just return the metadata
    res.status(201).json({ roomId, metadata: metadata.toObject() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create room" });
  }
});

// Get feed (published rooms)
router.get("/feed", async (req, res: Response) => {
  try {
    const { language } = req.query;
    const filter: any = { published: true, gameState: "NOT_STARTED" };
    if (language) filter.language = language;

    const rooms = await RoomMetadata.find(filter)
      .populate("ownerId", "displayName avatar")
      .sort({ createdAt: -1 });

    res.json({ rooms });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch feed" });
  }
});

// Publish a room
router.post("/:roomId/publish", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const metadata = await RoomMetadata.findOne({ roomId: req.params.roomId });
    if (!metadata) {
      return res.status(404).json({ error: "Room not found" });
    }
    if (metadata.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: "Only the owner can publish" });
    }
    metadata.published = true;
    await metadata.save();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to publish room" });
  }
});

// Unpublish a room
router.post("/:roomId/unpublish", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const metadata = await RoomMetadata.findOne({ roomId: req.params.roomId });
    if (!metadata) {
      return res.status(404).json({ error: "Room not found" });
    }
    if (metadata.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: "Only the owner can unpublish" });
    }
    metadata.published = false;
    await metadata.save();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to unpublish room" });
  }
});

export default router;
