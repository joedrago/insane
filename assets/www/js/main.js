function Asset(name, image, frames)
{
    this.name = name;
    this.image = image;
    this.frames = frames;
}

Asset.prototype.onImageComplete = function()
{
    if(!this.frames)
    {
        // simple image case. Make a single anim frame that is the size of the image.
        this.frames = [];
        var frame = {
            sx: 0,
            sy: 0,
            sw: this.image.width,
            sh: this.image.height
        };
        this.frames.push(frame);
        console.log("onImageComplete: " + frame.sw + "x" + frame.sh);
    }
}

function AssetManager()
{
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = {};
    this.downloadQueue = [];
    this.imageList = {};
}

AssetManager.prototype.queue = function(name, image, frames)
{
    var download = false;
    if(!image)
    {
        image = new Image();
        download = true;
    }
    var asset = new Asset(name, image, frames);
    this.cache[name] = asset;

    if(!this.imageList[image])
    {
        this.imageList[image] = [];
    }
    this.imageList[image].push(asset);

    if(download)
    {
        this.downloadQueue.push(asset);
    }
};

AssetManager.prototype.queueAll = function()
{
    // All assets and slices are listed here
    assets.queue("cordova");
};

AssetManager.prototype.isDone = function()
{
    return (this.downloadQueue.length === (this.successCount + this.errorCount));
};

AssetManager.prototype.get = function(name)
{
    return this.cache[name];
};

AssetManager.prototype.downloadAll = function(callback)
{
    this.queueAll();

    for(var i = 0; i < this.downloadQueue.length; ++i)
    {
        var asset = this.downloadQueue[i];
        var name = asset.name;
        var img = asset.image;
        var that = this;

        img.addEventListener("load", function()
        {
            for(var i = 0; i < that.imageList[img].length; ++i)
            {
                that.imageList[img][i].onImageComplete();
            }
            that.successCount += 1;
            if(that.isDone())
            {
                callback();
            }
        });
        img.addEventListener("error", function()
        {
            that.errorCount += 1;
            if(that.isDone())
            {
                callback();
            }
        });
        img.src = "img/" + name + ".png";
    }
};

var assets = new AssetManager();

function getScreenSize()
{
  var wnd = {
      w: 0,
      h: 0
  };
  if (typeof (window.innerWidth) == 'number')
  {
      wnd.w = window.innerWidth;
      wnd.h = window.innerHeight;
  }
  else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight))
  {
      wnd.w = document.documentElement.clientWidth;
      wnd.h = document.documentElement.clientHeight;
  }
  else if (document.body && (document.body.clientWidth || document.body.clientHeight))
  {
     wnd.w = document.body.clientWidth;
     wnd.h = document.body.clientHeight;
  }
  return wnd;
}

function RenderTarget(id, w, h)
{
    if(id)
    {
        this.canvas = document.getElementById(id);
    }
    else
    {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
    }
    if(w)
    {
        this.canvas.width = w;
    }
    if(h)
    {
        this.canvas.height = h;
    }
    this.context = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
}

function GfxEngine()
{
}

GfxEngine.prototype.startup = function()
{
    var screenSize = getScreenSize();
    this.screen = new RenderTarget("screen", screenSize.w, screenSize.h);
    this.backBuffer = new RenderTarget(false, screenSize.w, screenSize.h);
};

GfxEngine.prototype.begin = function()
{
    //this.backBuffer.context.fillRect(0, 0, this.backBuffer.width, this.backBuffer.height);
    this.drawRect('#000000', 0, 0, this.backBuffer.width, this.backBuffer.height);
};

GfxEngine.prototype.end = function()
{
    //this.screen.context.drawImage(this.backBuffer.canvas, 0, 0);
};

GfxEngine.prototype.setFillStyle = function(style)
{
    this.screen.context.fillStyle = style;
};

GfxEngine.prototype.drawRect = function(style, x, y, w, h)
{
    this.setFillStyle(style);
    this.screen.context.fillRect(x, y, w, h);
};

GfxEngine.prototype.drawImage = function(name, x, y, w, h)
{
    var asset = assets.get(name);
    var frame = asset.frames[0];
    if(!x)
    {
        x = 0;
    }
    if(!y)
    {
        y = 0;
    }
    if(!w)
    {
        w = frame.sw;
    }
    if(!h)
    {
        h = frame.sh;
    }

    //this.backBuffer.context.drawImage(asset.image,
    this.screen.context.drawImage(asset.image,
            frame.sx, frame.sy, frame.sw, frame.sh,
            x, y, w, h);
};

var gfx = new GfxEngine();

var COLORS = ['#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff'];
var VS =
{
    ZOOMED_OUT:  0,
    ZOOMING_IN:  1,
    ZOOMED_IN:   2,
    ZOOMING_OUT: 3
};

function rand(x)
{
    return Math.floor(Math.random() * x);
}

function findTouch(e, id)
{
    for(var i = 0; i < e.changedTouches.length; ++i)
    {
        var touch = e.changedTouches[i];
        if(touch.identifier == id)
        {
            return touch;
        }
    }
    return null;
}

function Insane()
{
    var dim1 = gfx.screen.width;
    var dim2 = gfx.screen.height;
    var landscape = true;
    if(dim1 > dim2)
    {
        var temp = dim1;
        dim1 = dim2;
        dim2 = temp;
        landscape = false;
    }
    this.outGemSize = Math.floor(dim1 / 20);
    this.inGemSize = Math.floor(dim1 / 6);
    this.gemSize = this.outGemSize;
    var dim2count = Math.floor(20 * (dim2 / dim1));

    if(landscape)
    {
        this.w = 20;
        this.h = dim2count;
    }
    else
    {
        this.h = 20;
        this.w = dim2count;
    }

    this.newGame();

    var that = this;
    document.addEventListener('touchstart', function(e) { that.touchstart(e); }, false);
    document.addEventListener('touchmove',  function(e) { that.touchmove(e);  }, false);
    document.addEventListener('touchend',   function(e) { that.touchend(e);   }, false);
}

Insane.prototype.newGame = function()
{
    this.state = VS.ZOOMED_OUT;
    this.colors = 5;

    this.board = [];
    var n = 0;
    for(var j = 0; j < this.h; ++j)
    {
        for(var i = 0; i < this.w; ++i)
        {
            this.board[n] = rand(this.colors) + 1;
            ++n;
        }
    }

    this.camera =
    {
        x: 0,
        y: 0
    };

    this.zoom =
    {
        id: null,
        speed: 1,
        dragging: false
    };
};

Insane.prototype.dragCamera = function()
{
    // Move the camera based on where we clicked when we started
    // dragging (this.zoom.anchor*) and where our finger is now
    // (this.zoom.drag*), considering our new gem size.

    // TODO: something to do with the ratio between outGemSize and inGemSize
    // TODO: clamp this.camera accordingly
};

Insane.prototype.update = function()
{
    if(this.state == VS.ZOOMING_IN)
    {
        if(this.gemSize < this.inGemSize)
        {
            this.gemSize += this.zoom.speed;
        }
        else
        {
            this.state == VS.ZOOMED_IN;
        }
    }
    if(this.zoom.dragging)
    {
        this.dragCamera();
    }
};

Insane.prototype.render = function()
{
    for(var j = 0; j < this.h; ++j)
    {
        for(var i = 0; i < this.w; ++i)
        {
            //gfx.drawImage("cordova", i * this.gemSize, j * this.gemSize, this.gemSize, this.gemSize);

            var color = this.board[i + (this.w * j)];
            gfx.drawRect(COLORS[color], (i * this.gemSize) - this.camera.x, (j * this.gemSize) - this.camera.y, this.gemSize, this.gemSize);
        }
    }
};

Insane.prototype.touchstart = function(e)
{
    if(this.state == VS.ZOOMED_OUT)
    {
        var touch = e.changedTouches[0];
        this.zoom.id = touch.identifier;
        this.zoom.dragging = true;
        this.zoom.anchorX = touch.clientX;
        this.zoom.anchorY = touch.clientY;
        this.zoom.dragX = touch.clientX;
        this.zoom.dragY = touch.clientY;
        console.log("begin zoomdragging: " + touch.clientX + "," + touch.clientY);
        this.state = VS.ZOOMING_IN;
    }
};

Insane.prototype.touchend = function(e)
{
    if(findTouch(e, this.zoom.id))
    {
        this.zoom.dragging = false;
        this.zoom.id = null;
        console.log("no longer zoom dragging");
    }
};

Insane.prototype.touchmove = function(e)
{
    if(this.zoom.dragging)
    {
        var touch = findTouch(e, this.zoom.id);
        this.zoom.dragX = touch.clientX;
        this.zoom.dragY = touch.clientY;
        console.log("move zoomdragging: " + touch.clientX + "," + touch.clientY);
    }
};

function gameCreate()
{
    return new Insane();
}

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

