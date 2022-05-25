const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
console.log(gsap);

// Map
canvas.width = 1024;
canvas.height = 576;

// Separating into rows. The map is 70 tiles wide. can see that in Tiled if needed
const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, 70 + i));
}

const boundaries = [];

const offset = {
  x: -736,
  y: -650,
};

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x, // these are from the "static" values
            y: i * Boundary.height + offset.y,
          },
        })
      );
  });
});

// battle zones
const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, 70 + i));
}

console.log(battleZonesMap);

const battleZones = [];

battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      battleZones.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x, // these are from the "static" values
            y: i * Boundary.height + offset.y,
          },
        })
      );
  });
});

console.log(battleZones);

// background image
const image = new Image();
image.src = "Assets/Pellet Town.png";

// foreground image
const foregroundImage = new Image();
foregroundImage.src = "Assets/foregroundObjects.png";

// Character Images
const playerUpImage = new Image();
playerUpImage.src = "Assets/playerUp.png";

const playerLeftImage = new Image();
playerLeftImage.src = "Assets/playerLeft.png";

const playerRightImage = new Image();
playerRightImage.src = "Assets/playerRight.png";

const playerDownImage = new Image();
playerDownImage.src = "Assets/playerDown.png";

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2, // actual x,
    y: canvas.height / 2 - 68 / 2, // actual y
  },
  image: playerDownImage,
  frames: { max: 4, hold: 10 },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage,
  },
});

console.log(player);

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: image,
});

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: foregroundImage,
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

// things we want to be able to move on the map
const movables = [background, ...boundaries, foreground, ...battleZones];

const rectangularCollision = ({ rectangle1, rectangle2 }) => {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y
  );
};

const battle = {
  initiated: false,
};

const animate = () => {
  const animationId = window.requestAnimationFrame(animate);
  // console.log(animationId);
  background.draw();
  boundaries.forEach((boundary) => {
    boundary.draw();
  });
  battleZones.forEach((battleZone) => {
    battleZone.draw();
  });
  player.draw();
  foreground.draw();

  // if this is true, we want to stop player movement so all of the code below will not run
  let moving = true;
  player.animate = false;

  console.log(animationId);
  if (battle.initiated) return;

  // moving & activate a battle when battle zone collision happens
  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i];
      const overlappingArea =
        (Math.min(
          player.position.x + player.width,
          battleZone.position.x + battleZone.width
        ) -
          Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(
          player.position.y + player.height,
          battleZone.position.y + battleZone.height
        ) -
          Math.max(player.position.y, battleZone.position.y));
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: battleZone,
        }) &&
        overlappingArea > (player.width * player.height) / 2 &&
        Math.random() < 0.01
      ) {
        // deactivate current animation loop using the current animationId we assigned at the beginning of animate()
        window.cancelAnimationFrame(animationId);
        battle.initiated = true;
        // change to battle screen
        gsap.to("#overlappingDiv", {
          opacity: 0.9,
          repeat: 3,
          yoyo: true,
          duration: 0.2,
          onComplete: () => {
            gsap.to("#overlappingDiv", {
              opacity: 1,
              duration: 0.2,
              // activate new animation loop
              onComplete: () => {
                animateBattle();
                gsap.to("#overlappingDiv", {
                  opacity: 0,
                  duration: 0.5,
                });
              },
            });
          },
        });
        break;
      }
    }
  }

  if (keys.w.pressed && lastKey === "w") {
    player.animate = true;
    player.image = player.sprites.up;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + 3,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.y += 3;
      });
    }
  } else if (keys.a.pressed && lastKey === "a") {
    player.animate = true;
    player.image = player.sprites.left;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x + 3,
              y: boundary.position.y,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving) {
      movables.forEach((movable) => {
        movable.position.x += 3;
      });
    }
  } else if (keys.s.pressed && lastKey === "s") {
    player.animate = true;
    player.image = player.sprites.down;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - 3,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving) {
      movables.forEach((movable) => {
        movable.position.y -= 3;
      });
    }
  } else if (keys.d.pressed && lastKey === "d") {
    player.animate = true;
    player.image = player.sprites.right;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - 3,
              y: boundary.position.y,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving) {
      movables.forEach((movable) => {
        movable.position.x -= 3;
      });
    }
  }
};

// Runs all the animation on the normal map
// animate();

// Runs all the animation on the battle screen
const battleBackgroundImage = new Image();
battleBackgroundImage.src = "Assets/battleBackground.png";

const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: battleBackgroundImage,
});

const draggleImage = new Image();
draggleImage.src = "Assets/draggleSprite.png";

const draggle = new Sprite({
  position: {
    x: 800,
    y: 100,
  },
  image: draggleImage,
  frames: {
    max: 4,
    hold: 30,
  },
  animate: true,
  isEnemy: true,
});

const embyImage = new Image();
embyImage.src = "Assets/embySprite.png";

const emby = new Sprite({
  position: {
    x: 300,
    y: 320,
  },
  image: embyImage,
  frames: {
    max: 4,
    hold: 15,
  },
  animate: true,
});

const renderedSprites = [draggle, emby];
const animateBattle = () => {
  window.requestAnimationFrame(animateBattle);
  battleBackground.draw();

  renderedSprites.forEach((sprite) => {
    sprite.draw();
  });
};

// Run battle screen animation
animateBattle();

// Attacks
document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", (e) => {
    const selectedAttack = attacks[e.currentTarget.innerHTML];
    emby.attack({
      attack: selectedAttack,
      recipient: draggle,
      renderedSprites,
    });
  });
});

// Used to get the lastKey pressed so there's no directional moving key overlapping another
let lastKey = "";

// Moving player
window.addEventListener("keydown", (e) => {
  // console.log(e.key);
  switch (e.key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;
  }
  // console.log(keys);
});

window.addEventListener("keyup", (e) => {
  // console.log(e.key);
  switch (e.key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
  // console.log(keys);
});
