const locks = new Map<string, Promise<void>>();

export async function withRoomLock<T>(
  roomId: string,
  fn: () => Promise<T>
): Promise<T> {
  // Wait for any existing operation on this room to finish
  while (locks.has(roomId)) {
    await locks.get(roomId);
  }

  // Create a new lock for this operation
  let releaseLock: () => void;
  const lockPromise = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });
  locks.set(roomId, lockPromise);

  try {
    return await fn();
  } finally {
    // Release the lock
    releaseLock!();
    locks.delete(roomId);
  }
}
