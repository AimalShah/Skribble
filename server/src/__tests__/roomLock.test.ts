import { describe, it, expect, vi, beforeEach } from "vitest";
import { withRoomLock } from "../utils/roomLock";

describe("withRoomLock", () => {
  it("serializes concurrent operations on the same room", async () => {
    const executionOrder: string[] = [];

    // Two concurrent operations on the same room
    const op1 = withRoomLock("room-1", async () => {
      executionOrder.push("op1-start");
      await new Promise((r) => setTimeout(r, 50));
      executionOrder.push("op1-end");
    });

    const op2 = withRoomLock("room-1", async () => {
      executionOrder.push("op2-start");
      await new Promise((r) => setTimeout(r, 50));
      executionOrder.push("op2-end");
    });

    await Promise.all([op1, op2]);

    // Operations must be serialized: op1 completes before op2 starts (or vice versa)
    const op1Start = executionOrder.indexOf("op1-start");
    const op1End = executionOrder.indexOf("op1-end");
    const op2Start = executionOrder.indexOf("op2-start");
    const op2End = executionOrder.indexOf("op2-end");

    // One operation must fully complete before the other starts
    const op1First = op1End < op2Start;
    const op2First = op2End < op1Start;
    expect(op1First || op2First).toBe(true);
  });

  it("allows concurrent operations on different rooms", async () => {
    const executionOrder: string[] = [];

    const op1 = withRoomLock("room-1", async () => {
      executionOrder.push("op1-start");
      await new Promise((r) => setTimeout(r, 50));
      executionOrder.push("op1-end");
    });

    const op2 = withRoomLock("room-2", async () => {
      executionOrder.push("op2-start");
      await new Promise((r) => setTimeout(r, 50));
      executionOrder.push("op2-end");
    });

    await Promise.all([op1, op2]);

    // Different rooms: both should start before either ends (concurrent)
    const op1Start = executionOrder.indexOf("op1-start");
    const op1End = executionOrder.indexOf("op1-end");
    const op2Start = executionOrder.indexOf("op2-start");

    // Both operations started before either finished
    expect(Math.max(op1Start, op2Start)).toBeLessThan(
      Math.min(op1End, executionOrder.indexOf("op2-end"))
    );
  });

  it("propagates errors from the locked operation", async () => {
    await expect(
      withRoomLock("room-1", async () => {
        throw new Error("test error");
      })
    ).rejects.toThrow("test error");
  });

  it("does not block subsequent operations after an error", async () => {
    const executionOrder: string[] = [];

    // First operation fails
    const op1 = withRoomLock("room-1", async () => {
      executionOrder.push("op1-start");
      throw new Error("fail");
    }).catch(() => {}); // swallow error

    await op1;

    // Second operation should still work
    await withRoomLock("room-1", async () => {
      executionOrder.push("op2-start");
    });

    expect(executionOrder).toEqual(["op1-start", "op2-start"]);
  });
});
