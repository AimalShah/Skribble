import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import MessagesContext from "../context/MessagesContext";
import { RoomProvider } from "../context/RoomContext";
import { GameEvent } from "../types";

// vi.hoisted ensures this reference is available when vi.mock runs
const mockSocket = vi.hoisted(() => ({
  id: "test-socket-id",
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock("../socketHandler", () => ({
  socket: mockSocket,
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <RoomProvider>{children}</RoomProvider>;
}

describe("MessagesContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("removes all socket listeners on unmount", () => {
    const { unmount } = render(
      <TestWrapper>
        <MessagesContext>{" "}</MessagesContext>
      </TestWrapper>
    );

    const expectedEvents = [
      GameEvent.GAME_STARTED,
      GameEvent.GUESS,
      GameEvent.GUESSED,
      GameEvent.PLAYER_JOINED,
      GameEvent.PLAYER_LEFT,
      GameEvent.WORD_CHOSEN,
      GameEvent.TURN_END,
      GameEvent.KICKING_VOTE,
      "error",
    ];

    // Verify socket.on was called for each event during mount
    for (const event of expectedEvents) {
      expect(mockSocket.on).toHaveBeenCalledWith(event, expect.any(Function));
    }

    // Record on call count before unmount
    const onCallsBeforeUnmount = mockSocket.on.mock.calls.length;

    // Unmount to trigger cleanup
    unmount();

    // Every event that was added with socket.on must be removed with socket.off
    for (const event of expectedEvents) {
      expect(mockSocket.off).toHaveBeenCalledWith(event, expect.any(Function));
    }

    // The bug: cleanup used socket.on instead of socket.off for GAME_STARTED and KICKING_VOTE
    // After fix, socket.off should be called for both
    const gameStartedOffCalls = mockSocket.off.mock.calls.filter(
      (call) => call[0] === GameEvent.GAME_STARTED
    );
    expect(gameStartedOffCalls.length).toBeGreaterThanOrEqual(1);

    const kickingVoteOffCalls = mockSocket.off.mock.calls.filter(
      (call) => call[0] === GameEvent.KICKING_VOTE
    );
    expect(kickingVoteOffCalls.length).toBeGreaterThanOrEqual(1);

    // No new socket.on calls should happen during cleanup
    expect(mockSocket.on.mock.calls.length).toBe(onCallsBeforeUnmount);
  });
});
