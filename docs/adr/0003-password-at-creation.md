# Room passwords set at creation time

When creating a Private Room, the RoomOwner sets the password immediately as part of the creation flow. The password is required before the room is created. This is simpler than allowing password changes later and avoids edge cases (e.g., players already in the room when password changes).

The password is hashed server-side before storage. Private rooms show a lock icon in the feed and prompt for password via a modal when a User attempts to join.
