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
    this.screen.context.fillRect(0, 0, this.backBuffer.width, this.backBuffer.height);
};

GfxEngine.prototype.end = function()
{
    //this.screen.context.drawImage(this.backBuffer.canvas, 0, 0);
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
}

var gfx = new GfxEngine();
