/*global console, document, $ */
/*jslint onevar:false, white:false */

// @depends assetmanager.js
// @depends gfx.js
// @depends insane.js

// --------------------------------------------------------------------------------
// Global variables

var gAppActive = true;
var gGameLoop;
var gGame;

// --------------------------------------------------------------------------------
// Input handlers

function onMenuButton()
{
    console.log("onMenuButton");
    //$('#deviceready').html("Menu pressed.");
}

// --------------------------------------------------------------------------------
// Render Loop

function GameLoop()
{
    this.elapsedFrames = 0;
    this.requestAnimFrame = (function()
    {
        return  (window.requestAnimationFrame) ? function(a,b) { return window.requestAnimationFrame(a,b); } :
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                window.oRequestAnimationFrame      ||
                window.msRequestAnimationFrame     ||
                function(/* function */ callback, /* DOMElement */ element){
                  window.setTimeout(callback, 1000 / 60);
                };
    })();

    // Performance tuning
    this.fps = 60;
    this.maxFramesBehind = 5;

    this.frameMS = (1000 / this.fps);
    this.maxUpdateMS = this.maxFramesBehind * this.frameMS; // Maximum time we're willing to update between renders
}

GameLoop.prototype.update = function()
{
    gGame.update();
};

GameLoop.prototype.render = function()
{
    gfx.begin();
    gGame.render();
    gfx.end();
};

GameLoop.prototype.loop = function()
{
    var now = Date.now();
    var deltaMS = now - this.lastTime;
    this.leftoverMS += deltaMS;
    if(this.leftoverMS > this.maxUpdateMS)
    {
        this.leftoverMS = this.maxUpdateMS;
    }
    this.lastTime = now;

    while(this.leftoverMS > 0)
    {
        this.update();
        this.leftoverMS -= this.frameMS;
    }

    this.render();
};

GameLoop.prototype.start = function()
{
    console.log("(re)starting game loop");

    // Reset time deltas so we don't jump into the future when we come back from sleep
    this.leftoverMS = 0;
    this.lastTime = Date.now();

    var that = this;
    (function gameLoop() {
         if(gAppActive)
         {
            that.requestAnimFrame(gameLoop, gfx.screen.canvas);
         }
         that.loop();
     })();
};

// --------------------------------------------------------------------------------
// Main

// When this is called, Cordova is ready and alll assets are downloaded
function main()
{
    console.log("main");

    gfx.startup();
    gGame = gameCreate();

    gGameLoop = new GameLoop();
    gGameLoop.start();
}

// --------------------------------------------------------------------------------
// Bootstrapping / Init / Entry points

function onDownloadComplete()
{
    console.log("onDownloadComplete");

    main();
}

function onPause()
{
    gAppActive = false;
    console.log("onPause");
}

function onResume()
{
    gAppActive = true;
    console.log("onResume");
    if(gGameLoop)
    {
        gGameLoop.start();
    }
}

function onDeviceReady()
{
    document.addEventListener("menubutton", onMenuButton, false);
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);

    assets.downloadAll(onDownloadComplete);

    console.log("onReady");
    //$('#deviceready').html("Ready!");
}

function entryPoint()
{
    //$('#deviceready').html("Loading...");

    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    document.addEventListener("deviceready", onDeviceReady, false);

    console.log("main end 1");
}
