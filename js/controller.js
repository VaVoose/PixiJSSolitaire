// https://www.codeandweb.com/free-sprite-sheet-packer

//Set Alliases for the PIXI Library
let Application = PIXI.Application,
    loader = PIXI.Loader.shared,
    resources = PIXI.Loader.shared.resources,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.utils.TextureCache,
    Container = PIXI.Container;

//--Just some general stuff-//
let  type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}
PIXI.utils.sayHello(type)
//-------------------------//

let gameState = play;

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
loader.add("cardSprites", "./images/cards/spritesheet.json").load(onAssetsLoaded);

let cardArr = [];
let cardContainer = new Container;
cardContainer.position.set(150, 150);

let cardContainer2 = new Container;
cardContainer2.position.set(150, 500);



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
        cardContainer.addChild(cardArr[i]);
    }

    let sampleBack = Sprite.from("yellow_back.png");
    cardContainer2.addChild(sampleBack);
    sampleBack.scale.set(.1, .1);
    sampleBack.interactive = true;

    //Add container to stage
    app.stage.addChild(cardContainer);
    app.stage.addChild(cardContainer2);

    //This updates every 60s, delta is used if you want to update independent of frame rate
    app.ticker.add(delta => gameLoop(delta));
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

function createCard(value, suit){
    //Create card from value and suit from the spritesheet
    let card = Sprite.from(`${value}${suit}.png`);
    console.log(`${value}${suit} loaded`);
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
    card.on('pointerupoutside', onDragEnd);
    return card;
}

function onDragStart(event){
    this.data = event.data;
    this.alpha = .5;
    this.dragging = true;
    console.log(`${this.value}${this.suit}`);
}

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
    //Deactivate the dragging card for container detection
    this.interactive = false;
    if (overContainer()){
        return;
    }
    this.interactive = true;
    this.x = 0;
    this.y = 0;
    this.data = null;
}


function gameLoop(delta){

    //Update current gamestate if needed

    //Call the state associated with the current game
    gameState(delta);
}

function play(){
    //TODO
    
}

function overContainer(){
    //Get mouse position
    let mousePosition = app.renderer.plugins.interaction.mouse.global;
    let hit;
    //If there is a something interactive under the mouse
    if (hit = app.renderer.plugins.interaction.hitTest(mousePosition)){
        //If that object is a container
        if (hit instanceof Container){
            console.log(`Container was hit`);
            return hit;
        }
    }
    return false;
}


