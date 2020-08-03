// https://www.codeandweb.com/free-sprite-sheet-packer

//--Just some general stuff-//
let  type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}
PIXI.utils.sayHello(type)
//-------------------------//

//Set Alliases for the PIXI Library
let Application = PIXI.Application,
    loader = PIXI.Loader.shared,
    resources = PIXI.Loader.shared.resources,
    Sprite = PIXI.Sprite,
    Texture = PIXI.Texture,
    TextureCache = PIXI.utils.TextureCache,
    Container = PIXI.Container
;

class Stock extends Container{
    constructor(){
        super();
        this.position.set(100, 100);
        this.interactive = true;
        this.addChildAt(createPlaceholder(), 0);
        this.on('click', this.dealCards);
    }

    dealCards(){
        talon.dealCards();
    }

    returnCards(){
        let talonAmt = talon.children.length - 1;
        for (let i = 0; i < talonAmt; i++){
            this.addChild(talon.getChildAt(talonAmt - i));
        }
    }
}

class Talon extends Container{
    currentlyInTalon;

    constructor(){
        super();
        this.position.set(180, 100);
        this.interactive = true;
        this.addChildAt(createPlaceholder(), 0);
        this.currentlyInTalon = 0;
    }

    dealCards(){
        //This is kinda brute force but it moves all the cards that are currently in it to the neutral position
        let cardsInTalon = this.children;
        for (let card of cardsInTalon){
            card.position.set(0,0);
        }

        let stockAmt = stock.children.length - 1;
        if (stockAmt == 0){
            stock.returnCards();
            return;
        }

        //Grabs 3 cards from the stock and lays them out
        for (let i = 0; i < 3; i++){
            stockAmt = stock.children.length - 1;
            if (stockAmt > 0){
                this.addChild(stock.getChildAt(stockAmt)).position.set(20 * i, 0);
            }
        }
    }

    // This is scuffed badly
    onChildrenChange(){
        
    }
}

class FoundationContainer extends Container{
    foundations = [];

    constructor(){
        super();
        this.position.set(400, 100);
        this.interactive = false;
        this.interactiveChildren = true;
        this._populateFoundation();
    }

    _populateFoundation(){
        for(let i = 0; i < 4; i++){
            let f = new Foundation();
            this.foundations.push(f);
            this.addChild(f);
            f.position.set(80 * i, 0);
        }
    }
}

class Foundation extends Container{
    constructor(){
        super();
        this.interactive = true;
        this.addChildAt(createPlaceholder(), 0);
    }
}

class TableauContainer extends Container{
    tableaus = [];

    constructor(){
        super();
        this.position.set(100, 250);
        this.interactive = false;
        this.interactiveChildren = true;
        this._populateTableau();
    }

    _populateTableau(){
        for (let i = 0; i < 7; i++){
            let t = new Tableau;
            this.tableaus.push(t);
            this.addChild(t);
            t.position.set(i * 90, 0)
        }
    }
}

class Tableau extends Container{
    constructor(){
        super();
        this.interactive = true;
        this.addChildAt(createPlaceholder(), 0);
    }
}

let gameState = play;

//Create a new PIXI application
let app = new Application({
    autoResize: true,
    backgroundColor: 0X7646C1
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

let cardArr = [];
let stock;
let talon;
let foundationContainer;
let tableauContainer;
let draggingContainer = new Container;
draggingContainer.interactive = false;

//Loads a spritesheet, each sprite in the sheet has the name it was assigned in the spritesheet generator (file name)
//Then calls setup function once all loaded
loader.add("cardSprites", "./images/cards/spritesheet.json").load(onAssetsLoaded);

function onAssetsLoaded(){
    //Instantiate the containers
    stock = new Stock;
    talon = new Talon;
    foundationContainer = new FoundationContainer;
    tableauContainer = new TableauContainer;

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

    for (let i = 0; i < cardArr.length; i++){
        stock.addChild(cardArr[i]);
    }

    //Add playing containers to stage
    app.stage.addChild(stock);
    app.stage.addChild(talon);
    app.stage.addChild(foundationContainer);
    app.stage.addChild(tableauContainer);
    app.stage.addChild(draggingContainer);
    app.stage.setChildIndex(draggingContainer, app.stage.children.length - 1);

    //This updates every 60s, delta is used if you want to update independent of frame rate
    app.ticker.add(delta => gameLoop(delta));
}

function createCard(value, suit){
    //Create card from value and suit from the spritesheet
    let card = Sprite.from(`${value}${suit}.png`);
    card.backside = Texture.from("yellow_back.png");
    //console.log(`${value}${suit} loaded`);
    //Set anchor point to the middle of the card and scale it down
    card.anchor.set(.5, .5);
    card.scale.set(.1, .1);
    card.interactive = true;
    card.value = value;
    card.suit = suit;
    card.facedown = false;
    if (card.facedown) card.texture = card.backside;
    //Set drag and drop events
    card.on('pointerdown', onDragStart);
    card.on('pointerup', onDragEnd);
    card.on('pointermove', onDragMove);
    card.on('added', onCardAddedToStack);
    //card.on('click', dealCards);
    return card;
}

function createPlaceholder(){
    let placeholder = Sprite.from("placeholder.png");
    placeholder.anchor.set(.5, .5);
    placeholder.scale.set(.1, .1);
    placeholder.interactive = true;
    return placeholder;
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
/*
function dealCards(){
    console.log("Click happened");
    currentPile = this.parent;
    if (currentPile == stock){
        for (let i = 0; i < 3; i++){
            //If there is a card in the stock
            if (stock.children.length > 1){
                talon.addChild(stock.getChildAt(stock.children.length - 1));
            }
        }
    }
}
*/

function onCardAddedToStack(event){
    //let 
}

//Add the card to dragging container so it on top of all other things on screen
function onDragStart(event){
    this.originalContainer = this.parent;
    if (this.originalContainer != stock){
        this.data = event.data;
        this.alpha = .5;
        this.dragging = true;
        //Get the starting position of the drag
        let startPos = this.getGlobalPosition();
        //Set the dragging container position to the cards position so the card doesn't jerk positions around
        draggingContainer.position.set(startPos.x, startPos.y);
        draggingContainer.addChild(this);
        //this.parent = this.parent.parent;
        console.log(`${this.value}${this.suit}`);
    }
}

//Have the card follow the mouse cursor
function onDragMove(event){
    if (this.parent != stock){
        if (this.dragging){
            let newPos = this.data.getLocalPosition(this.parent);
            this.x = newPos.x;
            this.y = newPos.y;
        }
    }
}

function onDragEnd(event){
    if (this.parent != stock){
        this.alpha = 1;
        this.dragging = false;
        //Temporarily deactivate the dragging card for container detection
        app.stage.addChild(this);
        this.interactive = false;

        let targetContainer = overContainer();
        //If there was a container collision
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
}

function debug() {
    console.log(stock.children);
    console.log(talon.children);
    console.log(app.stage.getChildIndex(stock));
    console.log(app.stage.getChildIndex(talon));
}

// Checks to see what container the card is over and if its over a continer return the container
function overContainer(){
    //Get mouse position
    let mousePosition = app.renderer.plugins.interaction.mouse.global;
    let hit = app.renderer.plugins.interaction.hitTest(mousePosition);
    //console.log("This is hit", hit);
    if(!hit) return; //If nothing was hit
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

