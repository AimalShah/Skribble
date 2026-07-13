# Paper-and-pencil doodle theme

The visual theme is "paper and pencil sketch" — hand-drawn borders, sketchy fonts (e.g. Permanent Marker, Caveat), kraft paper/parchment textures, and pencil-drawn UI elements. This matches the drawing game concept and differentiates from the current generic dark theme.

Implementation: Tailwind CSS custom properties (already partially in place), new font imports, SVG-based sketchy borders/elements, paper-textured backgrounds. The game canvas itself already fits this theme. UI components (buttons, cards, inputs) get the hand-drawn treatment.

This is a visual-only change — no architectural impact. The existing Tailwind design token system via CSS variables makes this achievable by swapping color/font/texture values.
