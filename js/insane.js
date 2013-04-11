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
