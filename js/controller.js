// https://www.codeandweb.com/free-sprite-sheet-packer

//Set Alliases for the PIXI Library
let Application = PIXI.Application,
    loader = PIXI.Loader.shared,
    resources = PIXI.Loader.shared.resources,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.utils.TextureCache,
    Container = PIXI.Container;

class Stock extends Container{

}

class Talon extends Container{

}

class Tableau extends Container{

}

class Foundation extends Container{

}

//--Just some general stuff-//
let  type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}
PIXI.utils.sayHello(type)
//-------------------------//


let gameState = play;
let selectedContainer;

//Create a new PIXI application
let app = new Application({
    autoResize: true,
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


let cardArr = [];
let stock = new Stock;
stock.position.set(150, 150);
stock.interactive = true;
/*
stock.on("pointerover", e = (event) => {
    selectedContainer = (event.target).parent;
    console.log("over stock", selectedContainer);
});

stock.on("pointerout", e = (event) => {
    selectedContainer = null;
    console.log("out stock", selectedContainer);
});
*/
let stock2 = new Talon;
stock2.position.set(150, 500);
stock2.interactive = true;
/*
stock2.on("pointerover", e = (event) => {
    selectedContainer = (event.target).parent;
    console.log("over talon", selectedContainer);
});

stock2.on("pointerout", e = (event) => {
    selectedContainer = null;
    console.log("out talon", selectedContainer);
});
//stock2.interactiveChildren = false;
*/
let draggingContainer = new Container;
draggingContainer.interactive = false;


loader.add("cardSprites", "./images/cards/spritesheet.json").load(onAssetsLoaded);

function onAssetsLoaded(){
    //For each card number value
    for (let i = 0; i < 13; i++){
        //For each number suit
        for (let j = 0; j < 4; j++){
            
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
            cardArr.push(card);
        }
    }

    shuffle(cardArr);
    //Add shuffled cards to the container
    for (let i = 0; i < cardArr.length; i++){
        stock.addChild(cardArr[i]);
    }

    //Sample container for testing
    let sampleBack = Sprite.from("yellow_back.png");
    stock2.addChild(sampleBack);
    sampleBack.anchor.set(.5, .5);
    sampleBack.scale.set(.1, .1);
    sampleBack.interactive = true;

    //Add container to stage
    
    app.stage.addChild(stock);
    app.stage.addChild(stock2);
    
    app.stage.addChild(draggingContainer);
    app.stage.setChildIndex(draggingContainer, 2);

    //This updates every 60s, delta is used if you want to update independent of frame rate
    app.ticker.add(delta => gameLoop(delta));
}

function createCard(value, suit){
    //Create card from value and suit from the spritesheet
    let card = Sprite.from(`${value}${suit}.png`);
    //console.log(`${value}${suit} loaded`);
    //Set anchor point to the middle of the card and scale it down
    card.anchor.set(.5, .5);
    card.scale.set(.1, .1);
    card.interactive = true;
    card.value = value;
    card.suit = suit;
    //Set drag and drop events
    card.on('pointerdown', onDragStart);
    card.on('pointerup', onDragEnd);
    card.on('pointermove', onDragMove);
    //card.on('pointerupoutside', onDragEnd);
    return card;
}

//Uses the Fisher-Yates shuffling method to shuffle the deck
function shuffle(deck){
    //Iterate through deck backwards
    for (let i = deck.length - 1; i > 0; i--){
        //Pick a random card before the current card
        let j = Math.floor(Math.random() * (i+1));
        //Swap the cards
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

//Add the card to dragging container so it on top of all other things on screen
function onDragStart(event){
    this.data = event.data;
    this.alpha = .5;
    this.dragging = true;
    //Get the starting position of the drag
    let startPos = this.getGlobalPosition();
    //Set the dragging container position to the cards position so the card doesn't jerk positions around
    draggingContainer.position.set(startPos.x, startPos.y);
    this.originalContainer = this.parent;
    draggingContainer.addChild(this);
    //this.parent = this.parent.parent;
    console.log(`${this.value}${this.suit}`);
}

//Have the card follow the mouse cursor
function onDragMove(event){
    if (this.dragging){
        let newPos = this.data.getLocalPosition(this.parent);
        this.x = newPos.x;
        this.y = newPos.y;
    }
}

function onDragEnd(event){
    this.alpha = 1;
    this.dragging = false;
    //Temporarily deactivate the dragging card for container detection
    app.stage.addChild(this);
    this.interactive = false;

    let targetContainer = overContainer();
    //If there is a target container
    if (targetContainer){
        targetContainer.addChild(this);
        this.interactive = true;
        this.x = 0;
        this.y = 0;
        this.data = null;
        debug();
        return;
    }
    else{
        let ogParent = this.originalContainer;
        ogParent.addChild(this);
        this.interactive = true;
        this.x = 0;
        this.y = 0;
        this.data = null;
        debug();
    }
}

function debug() {
    console.log("");
    console.log(stock.children);
    console.log(stock2.children);
    console.log(app.stage.getChildIndex(stock));
    console.log(app.stage.getChildIndex(stock2));
}

// Checks to see what container the card is over and if its over a continer return the container
function overContainer(){
    //Get mouse position
    let mousePosition = app.renderer.plugins.interaction.mouse.global;
    let hit = app.renderer.plugins.interaction.hitTest(mousePosition);
    //console.log("This is hit", hit);
    if(!hit) return;
    //Get the container of the interactive sprite
    if (hit.isSprite) hit = hit.parent;
    //console.log("This is hit parent", hit);
    return hit;
    /*
    if (hit){
        //If that object is a container
        if (hit instanceof Container){
            console.log(`Container was hit`);
            return hit;
        }
    }
    return false;
    */
}


function gameLoop(delta){

    //Update current gamestate if needed

    //Call the state associated with the current game
    gameState(delta);
}

function play(){
    //TODO
    
}




