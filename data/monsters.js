const monsters = {
  Emby: {
    position: {
      x: 300,
      y: 320,
    },
    image: {
      src: "Assets/embySprite.png",
    },
    frames: {
      max: 4,
      hold: 15,
    },
    animate: true,
    name: "Emby",
    attacks: [attacks.Tackle, attacks.Fireball],
  },
  Draggle: {
    position: {
      x: 800,
      y: 100,
    },
    image: {
      src: "Assets/draggleSprite.png",
    },
    frames: {
      max: 4,
      hold: 30,
    },
    animate: true,
    isEnemy: true,
    name: "Draggle",
    attacks: [attacks.Tackle, attacks.Fireball],
  },
};
