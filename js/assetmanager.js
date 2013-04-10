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
