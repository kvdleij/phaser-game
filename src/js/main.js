const config = {
    type: Phaser.AUTO, // Which renderer to use
    width: 800, // Canvas width in pixels
    height: 640, // Canvas height in pixels
    parent: "game-container", // ID of the DOM element to add the canvas to
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: {y: 0}
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
};

const game = new Phaser.Game(config);
let cursors;
let player;
let character;
let characters = ["male", "female", "skeleton"];
let animations = ["left-walk", "right-walk", "back-walk", "front-walk"];
let showDebug = true;

function preload() {
    // Runs once, loads up assets like images and audio
    this.load.image("mario-tiles", "../assets/tilesets/tileset.png");
    this.load.atlas("skeleton", "../assets/sprites/spritesheet.png", "../assets/sprites/skeleton.json");
    this.load.atlas("male", "../assets/sprites/spritesheet.png", "../assets/sprites/male.json");
    this.load.atlas("female", "../assets/sprites/spritesheet.png", "../assets/sprites/female.json");
}

function create() {
    // Runs once, after all assets in preload are loaded
    cursors = this.input.keyboard.createCursorKeys();

    const level = createLevel(game.config.width, game.config.height, 32, 40);

    const map = this.make.tilemap({data: level, tileWidth: 32, tileHeight: 32});
    const tiles = map.addTilesetImage("mario-tiles");
    const layer = map.createStaticLayer(0, tiles, 0, 0);

    layer.setCollision(6);

    let gameCenter = getGameCenter();

    character = 0;
    player = this.physics.add
        .sprite(gameCenter.x, gameCenter.y + 16, characters[character], "front")
        .setSize(32, 32);
    this.physics.add.collider(player, layer);


    const anims = this.anims;
    animations.forEach(function (key) {
        characters.forEach(function (char) {
            anims.create({
                key: char + "-" + key,
                frames: anims.generateFrameNames(characters[character], {
                    prefix: key + ".",
                    start: 0,
                    end: 2,
                    zeroPad: 3
                }),
                frameRate: 10,
                repeat: -1
            });
        });
    });

    // Debug graphics
    this.input.keyboard.once("keydown_D", event => {
        // Turn on physics debugging to show player's hitbox
        this.physics.world.createDebugGraphic();

        // Create worldLayer collision graphic above the player, but below the help text
        const graphics = this.add
            .graphics()
            .setAlpha(0.75)
            .setDepth(20);
        layer.renderDebug(graphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });
    });
}

function update(time, delta) {
    // Runs once per frame for the duration of the scene
    const speed = 175;
    const prevVelocity = player.body.velocity.clone();

    // Stop any previous movement from the last frame
    player.body.setVelocity(0);

    // Horizontal movement
    if (cursors.left.isDown) {
        player.body.setVelocityX(-100);
    } else if (cursors.right.isDown) {
        player.body.setVelocityX(100);
    }

    // Vertical movement
    if (cursors.up.isDown) {
        player.body.setVelocityY(-100);
    } else if (cursors.down.isDown) {
        player.body.setVelocityY(100);
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    player.body.velocity.normalize().scale(speed);

    if (cursors.left.isDown) {
        console.log(player.anims);
        player.anims.play(characters[character] + "-left-walk", true);
    } else if (cursors.right.isDown) {
        player.anims.play(characters[character] + "-right-walk", true);
    } else if (cursors.up.isDown) {
        player.anims.play(characters[character] + "-back-walk", true);
    } else if (cursors.down.isDown) {
        player.anims.play(characters[character] + "-front-walk", true);
    } else {
        player.anims.stop();

        // If we were moving, pick and idle frame to use
        if (prevVelocity.x < 0) player.setTexture(characters[character], "left");
        else if (prevVelocity.x > 0) player.setTexture(characters[character], "right");
        else if (prevVelocity.y < 0) player.setTexture(characters[character], "back");
        else if (prevVelocity.y > 0) player.setTexture(characters[character], "front");
    }
}

function createLevel(width, height, tileSize, maxTiles) {

    let rows = height / tileSize;
    let columns = width / tileSize;

    let level = [];

    for (let y = 0; y < rows; y++) {
        let row = [];
        for (let x = 0; x < columns; x++) {
            let tile = 8;
            if (y === 0 || x === 0 || y === (rows - 1) || x === (columns - 1)) {
                tile = 6;
            } else {
                let randomRock = generateRandomNumber(0, 200);
                let center = y === Math.floor(rows / 2) && x === Math.floor(columns / 2);
                if (randomRock === 0 && !center) {
                    tile = 6;
                } else {
                    let randomAlt = generateRandomNumber(0, 75);
                    if (randomAlt === 0) {
                        tile = 11;
                    }
                }
            }

            row.push(tile);
        }
        level.push(row);
    }
    level = createTransitions(level);

    return level;
}

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getGameCenter() {
    return {
        x: game.config.width / 2,
        y: game.config.height / 2
    };
}

function createTransitions(level) {
    for (let y = 0; y < level.length; y++) {
        for (let x = 0; x < level[y].length; x++) {
            if (level[y][x] === 11) {
                level[y - 1][x - 1] = level[y - 1][x - 1] !== 6 ? 3 : level[y - 1][x - 1];
                level[y - 1][x] = level[y - 1][x] !== 6 ? 4 : level[y - 1][x];
                level[y - 1][x + 1] = level[y - 1][x + 1] !== 6 ? 5 : level[y - 1][x + 1];
                level[y][x - 1] = level[y][x - 1] !== 6 ? 10 : level[y][x - 1];
                level[y][x + 1] = level[y][x + 1] !== 6 ? 12 : level[y][x + 1];
                level[y + 1][x - 1] = level[y + 1][x - 1] !== 6 ? 17 : level[y + 1][x - 1];
                level[y + 1][x] = level[y + 1][x] !== 6 ? 18 : level[y + 1][x];
                level[y + 1][x + 1] = level[y + 1][x + 1] !== 6 ? 19 : level[y + 1][x + 1];
            }
        }
    }

    return level;
}