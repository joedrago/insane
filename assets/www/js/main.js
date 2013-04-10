/*global console, document, $ */
/*jslint onevar:false, white:false */

function onReady()
{
    $('#deviceready').html("Ready!");
}

function main()
{
    $('#deviceready').html("Loading...");

    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    document.addEventListener('deviceready', onReady, false);
}

