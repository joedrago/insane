function Insane()
{
}

Insane.prototype.newGame = function()
{
};

Insane.prototype.update = function()
{
};

Insane.prototype.render = function()
{
    var dim = Math.min(gfx.screen.width, gfx.screen.height);
    var gemSize = dim / 5;

    for(var j = 0; j < 5; ++j)
    {
        for(var i = 0; i < 5; ++i)
        {
            gfx.drawImage("cordova", i * gemSize, j * gemSize, gemSize, gemSize);
        }
    }
};

function gameCreate()
{
    return new Insane();
}
