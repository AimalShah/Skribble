# Public feed replaces auto-matchmaking

The current auto-match system (scan Redis for available public rooms matching language) is being replaced with a manual publish/feed model. RoomOwners explicitly publish their rooms to a public feed; other Users browse the feed and join.

Why: Auto-match creates random pairings with no control. The feed model lets users see room settings, owner info, and player count before joining. It also gives RoomOwners control over when their room is visible.

Public rooms appear in the feed only after the RoomOwner publishes them. They stay visible until the game starts or the owner unpublishes. Private rooms never appear in the feed.
