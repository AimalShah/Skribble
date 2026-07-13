import mongoose, { Schema, Document } from "mongoose";

export interface IRoomMetadata extends Document {
  roomId: string;
  ownerId: mongoose.Types.ObjectId;
  name: string;
  isPrivate: boolean;
  passwordHash: string | null;
  published: boolean;
  language: string;
  settings: {
    players: number;
    drawTime: number;
    rounds: number;
    wordCount: number;
    hints: number;
    customWords: string[];
    onlyCustomWords: boolean;
  };
  playerCount: number;
  gameState: "NOT_STARTED" | "IN_PROGRESS" | "ENDED";
  createdAt: Date;
}

const RoomMetadataSchema = new Schema<IRoomMetadata>({
  roomId: { type: String, required: true, unique: true, index: true },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, trim: true },
  isPrivate: { type: Boolean, required: true },
  passwordHash: { type: String, default: null },
  published: { type: Boolean, default: false },
  language: { type: String, required: true },
  settings: {
    players: { type: Number, default: 2 },
    drawTime: { type: Number, default: 60 },
    rounds: { type: Number, default: 1 },
    wordCount: { type: Number, default: 3 },
    hints: { type: Number, default: 2 },
    customWords: { type: [String], default: [] },
    onlyCustomWords: { type: Boolean, default: false },
  },
  playerCount: { type: Number, default: 0 },
  gameState: { type: String, enum: ["NOT_STARTED", "IN_PROGRESS", "ENDED"], default: "NOT_STARTED" },
  createdAt: { type: Date, default: Date.now },
});

export const RoomMetadata = mongoose.model<IRoomMetadata>("RoomMetadata", RoomMetadataSchema);
