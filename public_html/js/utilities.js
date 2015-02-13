function getMouse(e) {
	var mouse = {};
	mouse.x = e.pageX - e.target.offsetLeft;
	mouse.y = e.pageY - e.target.offsetTop;
	return mouse;	
}

/**
* Using 'distance squared' here, why?
* Distance formula! :D
* I is for "Instance"
**/
function pointInsideCircle(x, y, I) {
	var dx = x - I.x;
	var dy = y - I.y;
	return dx * dx + dy * dy <= I.radius * I.radius;
}

function circlesIntersect(c1, c2) {
	var dx = c2.x - c1.x;
	var dy = c2.y - c1.y;
	var distance = Math.sqrt(dx*dx + dy*dy);
	return distance < c1.radius + c2.radius;	
}

function getRandomUnitVector() {
	var x = getRandom(-1, 1);
	var y = getRandom(-1, 1);
	var length = Math.sqrt(x*x + y*y);
	if (length == 0) { // Very unlikely
		x = 1; // Move right
		y = 0;
		length = 1;
	} else {
		x /= length;
		y /= length;
	}
	
	return {x:x, y:y};
}

function getRandom(min, max) {
	return Math.random() * (max - min) + min;	
}

/**
* Returns a random color!
* Source from http://paulirish.com/2009/random-hex-color-code-snippets/
*/
function getRandomColor() {
	var red = Math.round(Math.random()*200+55);
	var green = Math.round(Math.random()*200+55);
	var blue = Math.round(Math.random()*200+55);
	var color = 'rgba(' + red + ',' + green + ',' + blue + ',0.50)'; // Yay alpha!
	return color;
}

/**
 Function Name: clamp(val, min, max)
 Author: Web - various sources
 Return Value: The constrained value
 Description: Returns a value that is
 constrained between min and max (inclusive)
**/
function clamp(val, min, max) {
	return Math.max(min, Math.min(max, val));
}

// Color utilties
// Source: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}