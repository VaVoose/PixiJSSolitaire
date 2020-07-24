// https://www.codeandweb.com/free-sprite-sheet-packer

//Set Alliases for the PIXI Library
let Application = PIXI.Application,
    loader = PIXI.Loader.shared,
    resources = PIXI.Loader.shared.resources,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.utils.TextureCache,
    Container = PIXI.Container;


let gameState = play;

let  type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

PIXI.utils.sayHello(type)

//Create a new PIXI application
let app = new Application({
    autoResize: true,
    
    //width: 800,
    //height:800
});

//add application to browser window
document.body.appendChild(app.view);

window.addEventListener('resize', resize);

// Resize function window
function resize() {
	// Resize the renderer
	app.renderer.resize(window.innerWidth, window.innerHeight);
  
  // You can use the 'screen' property as the renderer visible
  // area, this is more useful than view.width/height because
  // it handles resolution
  // rect.position.set(app.screen.width, app.screen.height);
}

resize();

//Loads a spritesheet, each sprite in the sheet has the name it was assigned in the spritesheet generator (file name)
//Then calls setup function once all loaded
loader.add("cardSprites", "./images/cards/spritesheet.json").load(onAssetsLoaded);

let cardArr = [];
let cardContainer = new Container;
cardContainer.position.set(150, 150);

function onAssetsLoaded(){

    //For each card number value
    for (let i = 0; i < 13; i++){

        //For each number suit
        for (let j = 0; j < 4; j++){
            
            /*
            Need to rename the images and recreate the sprite map for this to work (maybe)
            */
            let suit;
            switch(j){
                case 0: suit = 'C';
                    break;
                case 1: suit = 'D';
                    break;
                case 2: suit = 'H';
                    break;
                case 3: suit = 'S';
                    break;
            }

            let card = createCard(i+1, suit);

            card.value = i+1;
            card.suit = suit;

            cardArr.push(card);
            cardContainer.addChild(card);
        }
    }

    app.stage.addChild(cardContainer);

    //This updates every 60s, delta is used if you want to update independent of frame rate
    app.ticker.add(delta => gameLoop(delta));
}

function createCard(value, suit){
    //Create card from value and suit from the spritesheet
    let card = Sprite.from(`${value}${suit}.png`);
    console.log(`${value}${suit} loaded`);
    //Set anchor point to the middle of the card and scale it down
    card.anchor.set(.5, .5);
    card.scale.set(.25, .25);
    card.interactive = true;
    //Set drag and drop events
    card.on('pointerdown', onDragStart);
    card.on('pointerup', onDragEnd);
    card.on('pointermove', onDragMove);
    card.on('pointerupoutside', onDragEnd);
    return card;
}

function onDragStart(event){
    this.data = event.data;
    this.alpha = .5;
    this.dragging = true;
}

function onDragEnd(event){
    this.alpha = 1;
    this.dragging = false;
    this.data = null;
}

function onDragMove(event){
    if (this.dragging){
        let newPos = this.data.getLocalPosition(this.parent);
        this.x = newPos.x;
        this.y = newPos.y;    
    }
}


function gameLoop(delta){

    //Update current gamestate if needed

    //Call the state associated with the current game
    gameState(delta);
}

function play(){
    //TODO
}


