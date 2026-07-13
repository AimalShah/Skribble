import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";

// vi.hoisted ensures these are available when vi.mock runs
const { mockUsers, MockUserModel, MockSchemaClass } = vi.hoisted(() => {
  const users = new Map<string, any>();
  let idCounter = 1;

  class MockSchema {
    definition: any;
    preHooks: Array<{ event: string; fn: Function }> = [];
    methods: Record<string, any> = {};
    constructor(definition: any) { this.definition = definition; }
    pre(event: string, fn: Function) { this.preHooks.push({ event, fn }); return this; }
    method(name: string, fn: Function) { this.methods[name] = fn; return this; }
  }

  const MockModel: any = function (data: any) {
    this._id = String(idCounter++);
    this.email = data.email;
    this.password = data.password;
    this.displayName = data.displayName;
    this.avatar = data.avatar || { body: 0, eyes: 0, mouth: 0 };
    this.stats = data.stats || { gamesPlayed: 0, gamesWon: 0, totalScore: 0, drawingRounds: 0, wordsGuessed: 0 };
    this.createdAt = new Date();
    this.isModified = () => true;
    this.save = async function () {
      // Hash password like the pre-save hook would
      const bcrypt = await import("bcrypt");
      this.password = await bcrypt.default.hash(this.password, 10);
      users.set(this._id, { ...this });
      return this;
    };
    this.toObject = function () {
      const { password, isModified: _, save: __, ...rest } = this;
      return { ...rest };
    };
  };

  MockModel.findOne = vi.fn(({ email, _id }: any) => {
    const chainable: any = {
      select: vi.fn().mockImplementation(function (this: any) {
        return chainable;
      }),
    };

    let foundUser = null;
    if (_id) {
      foundUser = users.get(_id) || null;
    } else if (email) {
      for (const u of users.values()) {
        if (u.email === email) { foundUser = u; break; }
      }
    }

    if (foundUser) {
      const userWithMethods = {
        ...foundUser,
        save: async function () { users.set(this._id, { ...this }); return this; },
        toObject: function () { const { password, save: _, toObject: __, isModified: ___, ...rest } = this; return { ...rest }; },
      };
      // Make the chainable resolve to the user
      Object.defineProperty(chainable, '_resolvedUser', { value: userWithMethods, writable: true });
      // When awaited, return the user
      chainable.then = (resolve: any, reject: any) => Promise.resolve(userWithMethods).then(resolve, reject);
      chainable[Symbol.toStringTag] = 'Promise';
    } else {
      chainable.then = (resolve: any, reject: any) => Promise.resolve(null).then(resolve, reject);
      chainable[Symbol.toStringTag] = 'Promise';
    }

    return chainable;
  });

  MockModel.findById = vi.fn(async (id: string) => {
    const user = users.get(id);
    if (!user) return null;
    return { ...user, save: async function () { users.set(this._id, { ...this }); return this; }, toObject: function () { const { password, save: _, toObject: __, isModified: ___, ...rest } = this; return { ...rest }; }, comparePassword: async function (pw: string) { const u = users.get(this._id); return u?.password === pw; } };
  });

  MockModel.create = vi.fn(async (data: any) => {
    const doc = new MockModel(data);
    await doc.save();
    return doc;
  });

  MockModel._clear = () => { users.clear(); idCounter = 1; };

  return { mockUsers: users, MockUserModel: MockModel, MockSchemaClass: MockSchema };
});

vi.mock("mongoose", () => {
  return {
    default: {
      Schema: MockSchemaClass,
      model: vi.fn(() => MockUserModel),
      connect: vi.fn(async () => {}),
      connection: { on: vi.fn(), readyState: 1 },
    },
    Schema: Object.assign(MockSchemaClass, {
      Types: { ObjectId: class ObjectId {} },
    }),
    model: vi.fn(() => MockUserModel),
  };
});

vi.mock("../utils/redis", () => ({
  getRedisRoom: vi.fn(),
  setRedisRoom: vi.fn(),
  deleteRedisRoom: vi.fn(),
  getPublicRoom: vi.fn(),
  getPublicRooms: vi.fn(),
  deletePublicRooms: vi.fn(),
}));

import express from "express";
import http from "http";
import { createApp } from "../server";
import request from "supertest";

let app: express.Express;
let server: http.Server;

beforeAll(async () => {
  const result = await createApp();
  app = result.app;
  server = result.server;
});

afterAll(() => { server?.close(); });

describe("Auth API", () => {
  beforeEach(() => { MockUserModel._clear(); });

  it("registers a new user and returns token + user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "password123", displayName: "Test User" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", "test@example.com");
    expect(res.body.user).toHaveProperty("displayName", "Test User");
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("rejects registration with duplicate email", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@example.com", password: "password123", displayName: "First" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@example.com", password: "password456", displayName: "Second" });

    expect(res.status).toBe(409);
  });

  it("logs in with correct credentials", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "login@example.com", password: "password123", displayName: "Login" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("rejects login with wrong password", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "wrong@example.com", password: "password123", displayName: "Wrong" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "wrong@example.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
  });

  it("returns user from /me with valid token", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: "me@example.com", password: "password123", displayName: "Me" });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${reg.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty("email", "me@example.com");
  });

  it("rejects /me without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("rejects /me with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.status).toBe(401);
  });
});
