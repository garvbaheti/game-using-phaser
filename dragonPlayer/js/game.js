// new scene 
let gamescene = new Phaser.Scene('Game')

// initiate scene parameters
gamescene.init = function() {
    this.playerSpeed = 3;
  
    this.dragonMinSpeed = 2;
    this.dragonMaxSpeed = 5;
  
    this.dragonMinY = 80;
    this.dragonMaxY = 280;
  
    this.PlayerDead = false;
    
  };

//load assets
gamescene.preload = function(){
    this.load.image('background','assets/background.png'); //loading background and giving it a label
    this.load.image('player','assets/player.png'); //loading player & giving it a label
    this.load.image('dragon','assets/dragon.png'); //loading dragon & giving it a label
    this.load.image("treasure", "assets/treasure.png");
    this.load.audio("end",['assets/end.mp3']);
    this.load.audio("bg",['assets/bg.mp3']);
    this.load.audio("win",['assets/winner.mp3']);
};
gamescene.create=function(){
    let W=this.sys.game.config.width;
    let H=this.sys.game.config.height;
    console.log(W,H);
    let bg = this.add.sprite(0,0,'background');

    // bg.setOrigin(0,0) //change origin to top left corner of background

    bg.setPosition(W/2,H/2); //by using setposition
    // console.log(bg);// display the properties
    // console.log(this);

    //add player on top of bg
    this.player = this.add.sprite(50,180,'player');
    // this.player.depth=1; //if we are using multiple sprites then it is helpful

    this.player.x= 35; //setting position
    this.player.setScale(0.5); //scaling

    //treasure
    this.treasure = this.add.sprite(W-80,H/2,"treasure");
    this.treasure.setScale(0.5);

    this.end=this.sound.add('end',{loop:false,rate:1.5});
    this.bg=this.sound.add('bg',{loop:true,rate:1});
    this.win=this.sound.add('win',{loop:false,rate:1.5});
    
    //adding dragon 1 by 1
    // this.dragon1 = this.add.sprite(150,250,'dragon');
    // this.dragon1.setScale(0.75);
    // this.dragon1.flipX=true;

    // this.dragon2 = this.add.sprite(250,300,'dragon');
    // this.dragon2.setScale(0.75);
    // this.dragon2.flipX=true;
    
    // or we can use a group in which we can multiply the dragons
    this.dragons=this.add.group({
        key:"dragon",repeat:5,
        setXY:{
            x:90,
            y:100,
            stepX:80,
            stepY:20
        }
    });
    // setting the scale of all group elements
    Phaser.Actions.ScaleXY(this.dragons.getChildren(), -0.5, -0.5);
    Phaser.Actions.Call(this.dragons.getChildren(), dragon => {
        // flip dragon
        dragon.flipX = true;
    
        // set speed
        const dir = Math.random() < 0.5 ? 1 : -1;
        const speed = this.dragonMinSpeed + Math.random() * (this.dragonMaxSpeed - this.dragonMinSpeed);
    
        dragon.speed = dir * speed;
      });
      this.bg.play();    
};

gamescene.update=function(){

    if (this.PlayerDead) return;
    
    //user input
    if(this.input.activePointer.isDown){
        this.player.x += this.playerSpeed;
    }

    //getting position of player and treasure
    const playerRect = this.player.getBounds();
    const treasureRect = this.treasure.getBounds();

    // if player gets to treasure
    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect,treasureRect)){
        this.win.play();
        this.scene.restart();
        // return this.gameOver();
        this.bg.stop();
    }

    //get position of dragon
    const dragons = this.dragons.getChildren();

    for (const dragon of dragons) {
        // dragon movement
        dragon.y += dragon.speed;
    
        // check we haven't passed min or max Y
        const conditionUp = dragon.speed < 0 && dragon.y <= this.dragonMinY;
        const conditionDown = dragon.speed > 0 && dragon.y >= this.dragonMaxY;
    
        if (conditionUp || conditionDown) {
          dragon.speed *= -1;
        }
    
        // check dragon overlap
        let dragonRect = dragon.getBounds();
    
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, dragonRect)) {
          console.log("game over");
    
          // end the game
          
          return this.gameOver();
        }
      }
};

//while ending the game if win or lose
gamescene.gameOver = function() {
    this.PlayerDead = true;
    this.bg.stop(); 
  
    // shake camera for ending and resetting the game
    this.cameras.main.shake(500);
    
    this.end.play();
    
    this.cameras.main.on("camerashakecomplete", () => {
      this.cameras.main.fade(500);
    });
  
    this.cameras.main.on("camerafadeoutcomplete", () => {
      // restart the scene
      this.end.stop();
      this.scene.restart();
    });
  };

// set configuration
let config ={
    //how will facer render this game (WebGl or Canvas)
    type:Phaser.AUTO,
    width:640,
    height:360,
    scene:gamescene
};

//create game by passing configuration
let game = new Phaser.Game(config);
