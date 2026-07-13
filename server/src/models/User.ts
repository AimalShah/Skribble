import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  email: string;
  password: string;
  displayName: string;
  avatar: {
    body: number;
    eyes: number;
    mouth: number;
  };
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    totalScore: number;
    drawingRounds: number;
    wordsGuessed: number;
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  displayName: { type: String, required: true, trim: true },
  avatar: {
    body: { type: Number, default: 0 },
    eyes: { type: Number, default: 0 },
    mouth: { type: Number, default: 0 },
  },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    drawingRounds: { type: Number, default: 0 },
    wordsGuessed: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
