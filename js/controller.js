//Set Alliases for the PIXI Library
let Application = PIXI.Application,
    loader = PIXI.Loader.shared,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.utils.TextureCache;


let  type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

PIXI.utils.sayHello(type)

let app = new Application({
    width: 800,
    height:800
});

document.body.appendChild(app.view);

//Loads a spritesheet, each sprite in the sheet has the name it was assigned in the spritesheet generator (file name)
//Then calls setup function once all loaded
loader.add("cardSprites", "./images/cards/spritesheet.json").load(setup);


function setup(){
    //Go into the PIXI texture cache and find 2C
    //let twoC = TextureCache["2C.png"];
    let twoC = new Sprite(resources["cardSprites"].textures["2C.png"]);
    
    app.stage.addChild(twoC);
    twoC.scale.set(.5, .5);
    twoC.position.set(100, 100);
    
}
