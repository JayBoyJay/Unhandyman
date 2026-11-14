# Source art

Everything from the "Un-Handy Man — mock sprites" design canvas, saved at native pixel size (the canvas shows them at 4x).

- `sprites/` – characters, items, props, furniture and buildings. The 13 buildings use the rebuilt gable roofs.
- `maps/` – the six chapter scenes and five in-between route maps as flat reference images.
- `manifest.json` – file name → original name, size and canvas asset id.

The game loads `../atlas.png`; rebuild that atlas from here when a sprite is added to the game.
