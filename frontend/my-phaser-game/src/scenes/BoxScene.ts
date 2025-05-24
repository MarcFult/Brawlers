import Phaser from "phaser";
import { io, Socket } from "socket.io-client";

export default class BoxScene extends Phaser.Scene {
  private box!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bullets: Phaser.Physics.Arcade.Group;
  private shootKey: any;
  private wasdKeys: any;
  private currentDirection: string = "front";
  private concentration: number = 100;
  private concentrationText!: Phaser.GameObjects.Text;
  private concentrationSprite!: Phaser.GameObjects.Image;
  private isGameOver: boolean = false;
  private kills: number = 0;
  private killText!: Phaser.GameObjects.Text;
  private killSprite!: Phaser.GameObjects.Image;
  private selectedMap: string = 'first_map';
  private selectedSkin: string = 'char1';
  private nameText!: Phaser.GameObjects.Text;
  private otherPlayersGroup!: Phaser.Physics.Arcade.Group;
  private healZone! : Phaser.GameObjects.Image;
  private rKey!: Phaser.Input.Keyboard.Key | undefined;
  private bgMusic: Phaser.Sound.BaseSound;
  private recentlyDamagedByCloud: boolean = false;

  private otherPlayerConcentrationSprites = new Map<string, Phaser.GameObjects.Sprite>();
  private otherPlayerConcentrationValues = new Map<string, number>();

  private socket!: Socket;
  private otherPlayers: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!:  Phaser.Physics.Arcade.Group;

  private lobbyId: string = "default";


  constructor() {
    super({ key: "BoxScene" });
  }

  init(data: any) {
    const urlParams = new URLSearchParams(window.location.search);
    const lobbyIdFromUrl = urlParams.get("lobbyId");

    this.selectedMap = data.selectedMap || 'first_map';
    this.selectedSkin = data.selectedSkin || 'char1'; // fallback

    this.lobbyId = lobbyIdFromUrl || "default";
  }

  preload() {
    this.load.image("bullet", 'src/assets/bullet.png')

    //maps
    this.load.image("test_map", 'src/assets/roomSB.png')
    this.load.image("first_map", 'src/assets/first_map.png')
    this.load.image("second_map", 'src/assets/second_map.png')
    this.load.image("third_map", 'src/assets/third_map.png')
    this.load.image("ah", 'src/assets/ah.png')
    //concentration
    this.load.image("con_0", "src/assets/con_0.png");
    this.load.image("con_25", "src/assets/con_25.png");
    this.load.image("con_50", "src/assets/con_50.png");
    this.load.image("con_75", "src/assets/con_75.png");
    this.load.image("con_100", "src/assets/con_100.png");
    this.load.image("kill_buddy", "src/assets/char_kill.png");
    this.load.image("cloud", "src/assets/cloud.png");


    //background muisic
    this.load.audio("bgMusic", "src/assets/back.mp3");

    //Skins
    const skins = ["char1", "ralph", "pepe", "Peter_H", "caretaker", "fox", "alien"];

    for (const skin of skins) {
      this.load.image(`${skin}_front`, `src/assets/char/${skin}_front.png`);
      this.load.image(`${skin}_back`, `src/assets/char/${skin}_back.png`);
      this.load.image(`${skin}_left`, `src/assets/char/${skin}_left.png`);
      this.load.image(`${skin}_right`, `src/assets/char/${skin}_right.png`);
    }

    this.load.image("alien_bullet", `src/assets/char/alien_bullet.png`);
    this.load.image("fox_bullet", `src/assets/char/fox_bullet.png`);

  }

  create() {
    this.add.image(0, 0, this.selectedMap).setOrigin(0,0);

    this.cameras.main.setBounds(0, 0, 1134, 1110);
    this.physics.world.setBounds(53, 160, 1022, 900);

    this.box = this.physics.add.sprite(30, 30, `${this.selectedSkin}_front`);
    this.box.setBounce(0.2);
    this.box.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.shootKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE);

    // WASD-Tasten hinzufügen
    this.wasdKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });


    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });

    //this.socket = io("http://10.0.40.186:3001", { query: { lobbyId: this.lobbyId } });
    this.socket = io("http://localhost:3001", { query: { lobbyId: this.lobbyId } });

    //const socketHost = window.location.hostname;
    //this.socket = io(`http://${socketHost}:3001`, { query: { lobbyId: this.lobbyId } });


    this.socket.emit("joinLobby", {

      lobbyId: this.lobbyId,
      skin: this.selectedSkin
    }, (response) => {

      if (response && response.success) {
        console.log("Aktuelle Lobby ID:", this.lobbyId);
        this.socket.emit("playerJoined", {
          x: this.box.x,
          y: this.box.y,
          dir: this.currentDirection,
          skin: this.selectedSkin,
          map: this.selectedMap
        });

        if (response.lobbyId) {
          this.lobbyId = response.lobbyId;
        }
      } else {
        alert("Beitritt fehlgeschlagen: " + (response?.message || "Unbekannter Fehler"));
      }
    });

    this.socket.on("lobbyJoined", (data) => {
      this.lobbyId = data.lobbyId;
    });

    this.socket.on("currentPlayers", (players) => {
      Object.entries(players).forEach(([id, player]) => {
        if (id !== this.socket.id && !this.otherPlayers.has(id)) {
          this.addOtherPlayer({
            id,
            x: player.x,
            y: player.y,
            dir: player.dir || 'front',
            skin: player.skin || 'char1'
          });
        }
      });
    });

    this.socket.on("newPlayer", (player) => {
      if (player.id !== this.socket.id && !this.otherPlayers.has(player.id)) {
        this.addOtherPlayer(player);
      }
    });


    this.socket.on("playerMoved", (data: any) => {
      const other = this.otherPlayers.get(data.id);
      if (other) {
        other.setPosition(data.x, data.y);
        other.setTexture(`${data.skin}_${data.dir}`);
      }
    });

    this.socket.on("playerDisconnected", (id: string) => {
      const other = this.otherPlayers.get(id);
      if (other) {
        other.destroy();
        this.otherPlayers.delete(id);
      }

      const conSprite = this.otherPlayerConcentrationSprites.get(id);
      if (conSprite) {
        conSprite.destroy();
        this.otherPlayerConcentrationSprites.delete(id);
        this.otherPlayerConcentrationValues.delete(id);
      }
    });

    this.socket.on("playerShot", (data: any) => {
      const shooter = this.otherPlayers.get(data.id);
      if (!shooter) return;

      const bullet = this.enemyBullets.create(data.x, data.y, "bullet") as Phaser.Physics.Arcade.Image;
      (bullet as any).shooterId = data.id;

      bullet.setActive(true).setVisible(true).setCollideWorldBounds(true);
      bullet.setVelocity(data.velocity.x, data.velocity.y);
      this.time.delayedCall(2000, () => bullet.destroy());
    });

    this.playerBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });

    this.enemyBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });

    this.physics.add.overlap(this.box, this.enemyBullets, this.handlePlayerHit, undefined, this);

    this.socket.on("hitConfirmed", (data: any) => {
      if (data.targetId === this.socket.id) {
        this.loseConcentration(25);
      }
    });

    this.socket.on("playerDied", (data: any) => {
      const deadPlayer = this.otherPlayers.get(data.id);
      if (deadPlayer) {
        deadPlayer.setTint(0x0000CD); // blau einfärben als tot TODO me fix blue
        deadPlayer.setActive(false).setVisible(true); // optional: nicht mehr beweglich sonst funny
        deadPlayer.setAngle(data.angle || 0);
      }
    });

    this.socket.on("playerWasHit", (data: any) => {
      const hitPlayer = this.otherPlayers.get(data.targetId);
      if (data.targetId === this.socket.id) return;

      if (hitPlayer) {
        // Aktualisiere den Concentration-Wert
        this.otherPlayerConcentrationValues.set(data.targetId, data.newConcentration);

        // Aktualisiere die Anzeige
        this.updateConcentrationSpriteForOtherPlayer(
            data.targetId,
            data.newConcentration);

        // Farbanimation (optional)
        this.tweens.addCounter({
          from: 0,
          to: 1,
          duration: 500,
          onUpdate: tween => {
            const value = tween.getValue();
            const r = Math.floor(255 + (84 - 255) * value);
            const g = Math.floor(255 + (131 - 255) * value);
            const b = Math.floor(255 + (234 - 255) * value);
            const color = (r << 16) + (g << 8) + b;
            hitPlayer.setTint(color);
          }
        });
      }
    });

    this.killSprite = this.add.image(450,135, "kill_buddy").setScrollFactor(0).setScale(0.5);
    this.killText = this.add.text(470, 120, '0', {
      fontSize: '20px',
      color: '#ffffff',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);

    this.socket.on("updateKills", (data: any) => {
      this.kills = Math.floor(data.kills / 2);
      this.killText.setText(`${Math.max(0, this.kills)}`);
      this.checkWinCondition();
    });

    this.concentrationSprite = this.add.image(470, 100, "con_100").setScrollFactor(0).setScale(0.5);

    if (this.selectedMap === "second_map") {
      this.healZone = this.physics.add.staticImage(1012, 243, "healZone").setVisible(false);

      const tableBorders = this.physics.add.staticGroup();

      tableBorders.create(570, 497, null)
          .setDisplaySize(576, 90)
          .refreshBody()
          .setVisible();

      tableBorders.create(570, 702, null)
          .setDisplaySize(576, 90)
          .refreshBody()
          .setVisible();

      tableBorders.create(570, 905, null)
          .setDisplaySize(576, 90)
          .refreshBody()
          .setVisible();

      // Spieler kann nicht durch
      this.physics.add.collider(this.box, tableBorders);
      this.physics.add.collider(this.playerBullets, tableBorders, (bullet) => bullet.destroy());
      this.physics.add.collider(this.enemyBullets, tableBorders, (bullet) => bullet.destroy());
    }

    if (this.selectedMap == "third_map"){
      this.healZone = this.physics.add.staticImage(850, 243, "healZone").setVisible(false);

      const tableBorders = this.physics.add.staticGroup();

      tableBorders.create(280, 600)
          .setDisplaySize(95, 435)
          .refreshBody()
          .setVisible();

      tableBorders.create(570, 875)
          .setDisplaySize(686, 100)
          .refreshBody()
          .setVisible();

      tableBorders.create(870, 600)
          .setDisplaySize(95, 435)
          .refreshBody()
          .setVisible();

      this.physics.add.collider(this.box, tableBorders);
      this.physics.add.collider(this.playerBullets, tableBorders, (bullet) => bullet.destroy());
      this.physics.add.collider(this.enemyBullets, tableBorders, (bullet) => bullet.destroy());
    }

    if (this.selectedMap == "ah"){
      const tableBorders = this.physics.add.staticGroup();

      tableBorders.create(150, 600)
          .setDisplaySize(20, 570)
          .refreshBody()
          .setVisible();

      tableBorders.create(970, 600)
          .setDisplaySize(20, 700)
          .refreshBody()
          .setVisible();


      this.physics.add.collider(this.box, tableBorders);
      this.physics.add.collider(this.playerBullets, tableBorders, (bullet) => bullet.destroy());
      this.physics.add.collider(this.enemyBullets, tableBorders, (bullet) => bullet.destroy());
    }

    this.nameText = this.add.text(this.box.x, this.box.y - 60, 'YOU', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);

    this.otherPlayersGroup = this.physics.add.group();

    this.physics.add.collider(this.box, this.otherPlayersGroup);

    this.socket.emit("createLobby", { name: "test", maxPlayers: 4 }, (response) => { // nix damit machen ansonsten kaputt
      if (response.success) {
        console.log("Lobby erstellt mit ID:", response.lobbyId);
      } else {
        console.log("Lobby-Erstellung fehlgeschlagen");
      }
    });

    this.rKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.bgMusic = this.sound.add('bgMusic', {
      loop: true,
      volume: 0.8
    });
    this.bgMusic.play();


    if (this.selectedMap === "third_map") {
      this.time.delayedCall(20000, () => {
        this.spawnDamageCloud(); // nach 10 Sekunden
      });
    }

    // Position der Concentration-Sprites aktualisieren
    this.otherPlayerConcentrationSprites.forEach((conSprite, playerId) => {
      const player = this.otherPlayers.get(playerId);
      if (player) {
        conSprite.setPosition(player.x, player.y + 40);
      }
    });
  }

  shootBullet() {
    if (this.isGameOver) return; //tote dürfen nicht schießen

    let bulletTexture = 'bullet';

    switch (this.selectedSkin) {
      case 'alien':
         bulletTexture = "alien_bullet";
         break;

      case 'fox':
         bulletTexture = "fox_bullet";
         break;
    }

    const bullet = this.playerBullets.create(this.box.x, this.box.y, bulletTexture) as Phaser.Physics.Arcade.Image;
    if (!bullet) return;

    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    bullet.setTint(Phaser.Utils.Array.GetRandom(colors));

    bullet.setActive(true).setVisible(true).setCollideWorldBounds(true);

    const baseSpeed = 600;
    let velocity = { x: 0, y: 0 };

    const up = this.cursors.up.isDown;
    const down = this.cursors.down.isDown;
    const left = this.cursors.left.isDown;
    const right = this.cursors.right.isDown;

    if (up && left) {
      velocity.x = -baseSpeed / Math.sqrt(2);
      velocity.y = -baseSpeed / Math.sqrt(2);
    } else if (up && right) {
      velocity.x = baseSpeed / Math.sqrt(2);
      velocity.y = -baseSpeed / Math.sqrt(2);
    } else if (down && left) {
      velocity.x = -baseSpeed / Math.sqrt(2);
      velocity.y = baseSpeed / Math.sqrt(2);
    } else if (down && right) {
      velocity.x = baseSpeed / Math.sqrt(2);
      velocity.y = baseSpeed / Math.sqrt(2);
    } else if (up) {
      velocity.y = -baseSpeed;
    } else if (down) {
      velocity.y = baseSpeed;
    } else if (left) {
      velocity.x = -baseSpeed;
    } else if (right) {
      velocity.x = baseSpeed;
    } else {
      switch (this.currentDirection) {
        case "back": velocity.y = -baseSpeed; break;
        case "front": velocity.y = baseSpeed; break;
        case "left": velocity.x = -baseSpeed; break;
        case "right": velocity.x = baseSpeed; break;
      }
    }

    bullet.setVelocity(velocity.x, velocity.y);

    this.socket.emit("playerShot", {
      x: this.box.x,
      y: this.box.y,
      velocity: { x: velocity.x, y: velocity.y }
    });

    this.time.delayedCall(2000, () => bullet.destroy());
  }

  loseConcentration(amount: number) {
    this.concentration = Math.max(0, this.concentration - amount);
    this.updateConcentrationSprite();

    if (this.concentration <= 0 && !this.isGameOver) {
      this.socket.emit("playerDead"); // Server informieren
      this.handleGameOver();
    }
  }

  //KOOOOOOOKS!!!!!!!!!!!

  handleGameOver() {
    this.box.setActive(false).setVisible(true);
    this.box.setTint(0x7da6ff);
    this.box.setAngle(90);
    this.isGameOver = true;
    this.socket.emit("playerDead", { angle: 90 });

    this.scene.launch("DeathScene", { socket: this.socket , kills: this.kills});
    this.socket.emit("playerDead");
  }

  showWinScreen() {
    // 1. Spiel pausieren
    this.physics.pause();
    this.box.setActive(false);

    // 2. WinScene starten
    this.scene.launch("WinScene", {
      socket: this.socket,
      kills: this.kills
    });

    // 3. Server informieren
    this.socket.emit("playerWon");
  }

  update() {
    if (this.isGameOver) return;

    let moved = false;

    const left = this.cursors.left.isDown || this.wasdKeys.left.isDown;
    const right = this.cursors.right.isDown || this.wasdKeys.right.isDown;
    const up = this.cursors.up.isDown || this.wasdKeys.up.isDown;
    const down = this.cursors.down.isDown || this.wasdKeys.down.isDown;


    if (left) {
      this.box.setVelocityX(-250);
      this.box.setTexture(`${this.selectedSkin}_left`);
      this.currentDirection = "left";
      moved = true;
    } else if (right) {
      this.box.setVelocityX(250);
      this.box.setTexture(`${this.selectedSkin}_right`);
      this.currentDirection = "right";
      moved = true;
    } else {
      this.box.setVelocityX(0);
    }

    if (up) {
      this.box.setVelocityY(-250);
      this.box.setTexture(`${this.selectedSkin}_back`);
      this.currentDirection = "back"; //das war mal up
      moved = true;
    } else if (down) {
      this.box.setVelocityY(250);
      this.box.setTexture(`${this.selectedSkin}_front`);
      this.currentDirection = "front"; //das war mal down
      moved = true;
    } else {
      this.box.setVelocityY(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
      this.shootBullet();
    }

    if (moved) {
      this.socket.emit("playerMoved", {
        x: this.box.x,
        y: this.box.y,
        dir: this.currentDirection,
        skin: this.selectedSkin
      });
    }

    this.nameText.setPosition(this.box.x, this.box.y -60);

    if (this.physics.overlap(this.box, this.healZone)) {
      if (this.concentration < 100) {
        this.concentration += 0.1;
        this.updateConcentrationSprite();
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
      const ytUrl = "https://www.youtube.com/watch?v=YAgJ9XugGBo";
      window.open(ytUrl, "_blank");
    }

    this.otherPlayers.forEach((playerSprite, id) => {
      const conSprite = this.otherPlayerConcentrationSprites.get(id);
      if (conSprite) {
        conSprite.setPosition(playerSprite.x, playerSprite.y - 60);
      }
    });
  }



    private addOtherPlayer(data: any) {
    try {
      if (this.otherPlayers.has(data.id)) return;

      const textureKey = `${data.skin}_${data.dir || 'front'}`;
      if (!this.textures.exists(textureKey)) return;

      // Gegner-Sprite erstellen
      const sprite = this.physics.add.sprite(data.x, data.y, textureKey);
      this.otherPlayers.set(data.id, sprite);

      const conSprite = this.add.sprite(data.x, data.y - 60, "con_100").setScale(0.5);

      this.otherPlayerConcentrationSprites.set(data.id, conSprite);
      this.otherPlayerConcentrationValues.set(data.id, 100);

    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
    }
  }


  private handlePlayerHit(player: Phaser.GameObjects.GameObject, bullet: Phaser.GameObjects.GameObject) {
    bullet.destroy();

    this.loseConcentration(25);

    // Schütze informieren das er getroffen hat
    const shooterId = (bullet as any).shooterId;
    if (shooterId && shooterId !== this.socket.id) {
      this.socket.emit("playerHit", { shooterId, targetId: this.socket.id });
    }

    this.tweens.add({
      targets: this.box,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
  }

  private updateConcentrationSprite() {
    let key = "con_0";
    if (this.concentration > 75) {
      key = "con_100";
    } else if (this.concentration > 50) {
      key = "con_75";
    } else if (this.concentration > 25) {
      key = "con_50";
    } else if (this.concentration > 0) {
      key = "con_25";
    }
    this.concentrationSprite.setTexture(key);
  }

  private updateConcentrationSpriteForOtherPlayer(playerId: string, concentration: number, newHit: boolean = true) {

    const conSprite = this.otherPlayerConcentrationSprites.get(playerId);
    if (!conSprite) return;

    if (concentration > 75) {
      conSprite.setTexture("con_100");
    } else if (concentration > 50) {
      conSprite.setTexture("con_75");
    } else if (concentration > 25) {
      conSprite.setTexture("con_50");
    } else if (concentration > 0) {
      conSprite.setTexture("con_25");
    } else {
      conSprite.setTexture("con_0")
    }
    console.log(`--> Set sprite to:`, conSprite, `(concentration: ${concentration})`);
  }


  private spawnDamageCloud() {
    const cloud = this.physics.add.staticImage(570, 550, "cloud") // Position anpassen
        .setDisplaySize(300, 300) // größe
        .setAlpha(0.6);

    this.physics.add.overlap(this.box, cloud, () => {
      if (!this.isGameOver && !this.recentlyDamagedByCloud) {
        this.loseConcentration(10); // Schaden
        this.recentlyDamagedByCloud = true;

        // Cooldownn
        this.time.delayedCall(1000, () => {
          this.recentlyDamagedByCloud = false;
        });
      }
    });
  }
  private checkWinCondition() {
    const killLimit = this.otherPlayers.size;

    // Wenn Kill-Limit erreicht
    if (this.kills >= killLimit) {
      this.showWinScreen();
    }
  }

}