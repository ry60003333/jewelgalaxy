/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


(function () {
    "use strict";

    // Declare some closure variables!
    var canvas, ctx;
    //var x, y, radius, xSpeed, ySpeed, fillStyle;
    var circles = [];
    var paused = false;
    var animationID;

    // A common convention is all caps for constant values :)
    var CANVAS_WIDTH = 800, CANVAS_HEIGHT = 600;

    // ALL THE CONSTANTS
    var DEFAULT_START_RADIUS = 50;
    var DEFAULT_MAX_SPEED = 90;
    var DEFAULT_MAX_RADIUS = 70;
    var DEFAULT_MIN_RADIUS = 2;
    var DEFAULT_MAX_LIFETIME = 1;
    var DEFAULT_EXPLOSION_SPEED = 50;
    var DEFAULT_IMPLOSION_SPEED = 60;

    // Circle states
    var CIRCLE_STATE_NORMAL = 0;
    var CIRCLE_STATE_EXPLODING = 1;
    var CIRCLE_STATE_IMPLODING = 2;
    var CIRCLE_STATE_DONE = 3;

    // Game states
    var GAME_STATE_BEGIN = 0;
    var GAME_STATE_DEFAULT = 1;
    var GAME_STATE_ROUND_OVER = 2;
    var GAME_STATE_END = 3;
    var GAME_STATE_REPEAT_LEVEL = 4;

    // Number stuff
    var NUM_CIRCLES_START = 10;
    var NUM_CIRCLES_LEVEL_INCREASE = 5;
    var NUM_CIRCLES_END = 60;
    var PERCENT_CIRCLES_TO_ADVANCE = 0.3;
    var LOCAL_STORAGE_HIGHSCORE_KEY = "highscore";

    // Current level specific circle stuff
    var currentStartRadius = DEFAULT_START_RADIUS;
    var currentMaxSpeed = DEFAULT_MAX_SPEED;
    var currentMaxRadius = DEFAULT_MAX_RADIUS;
    var currentMinRadius = DEFAULT_MIN_RADIUS;
    var currentMaxLifetime = DEFAULT_MAX_LIFETIME;
    var currentExplosionSpeed = DEFAULT_EXPLOSION_SPEED;
    var currentImplosionSpeed = DEFAULT_IMPLOSION_SPEED;

    // I love bugs!
    var DEBUG = 0;

    // Only one lonely variable
    var numCircles = NUM_CIRCLES_START - NUM_CIRCLES_LEVEL_INCREASE;

    // More closure variables!
    var gameState = GAME_STATE_BEGIN;
    var currentLevel = -1;
    var roundScore;
    var totalScore = 0;
    var lastTime = 0;
    var currentHighscore = 0;
    var gotHighscore = false;

    // Sound variables
    var bgAudio, effectAudio, targetAudio, currentEffect = 0, currentDirection = 1;
    var effectSounds = ["1.mp3", "2.mp3", "3.mp3", "4.mp3", "5.mp3", "6.mp3", "7.mp3", "8.mp3", ];
    var metTargetSound = "level-complete.mp3";

    // Level data
    var levels = [
        // 10
        {
            winMessage: "Okay, maybe I lied.",
            loseMessage: "Why not try again?",
            baseColor: "#19E7FF",
            startRadius: 23
       },
        // 15
        {
            winMessage: "Do you like the colors?",
            loseMessage: "Those darn circles...",
            baseColor: "#28FC9D",
            startRadius: 20,
       },
        // 20
        {
            winMessage: "You are good at this!",
            loseMessage: "No worries, try again!",
            baseColor: "#FF61FA",
            startRadius: 17,
       },
        // 25
        {
            winMessage: "You destroyed those circles!",
            loseMessage: "Just click randomly?",
            baseColor: "#FF6947",
            startRadius: 16,
       },
        // 30
        {
            winMessage: "They didn't stand a chance.",
            loseMessage: "Have another go!",
            baseColor: "#F6FF47",
            startRadius: 16,
            maxSpeed: 90
       },
        // 35
        {
            winMessage: "Great job!",
            loseMessage: "Don't give up!",
            baseColor: "#FFA82E",
            startRadius: 15,
            maxSpeed: 95,
            maxRadius: 40
       },
        // 40
        {
            winMessage: "Who taught you?",
            loseMessage: "Too many?",
            baseColor: "#3798D4",
            startRadius: 14,
            maxSpeed: 97,
            maxRadius: 38,
            explosionSpeed: 30
       },
        // 45
        {
            winMessage: "You are too good!",
            loseMessage: "Keep going!",
            baseColor: "#3219B0",
            startRadius: 13,
            maxSpeed: 100,
            maxRadius: 36,
            explosionSpeed: 32
       },
        // 50
        {
            winMessage: "Impressive!",
            loseMessage: "Only a few more, I promise.",
            baseColor: "#B8124C",
            startRadius: 10,
            maxSpeed: 110,
            maxRadius: 35,
            explosionSpeed: 32
       },
        // 55
        {
            winMessage: "Fantastic!",
            loseMessage: "You can do it!",
            baseColor: "#51B56F",
            startRadius: 9,
            maxSpeed: 112,
            maxRadius: 34,
            explosionSpeed: 32
       },
        // 60
        {
            winMessage: "Yay!",
            loseMessage: "Too tiny?",
            baseColor: "#5F5BE3",
            startRadius: 8,
            maxSpeed: 113,
            maxRadius: 33,
            explosionSpeed: 38
    },
    ];

    window.onload = init;

    function init() {
        console.log("Init called.");

        // Setup the canvas
        canvas = document.querySelector("canvas");
        ctx = canvas.getContext("2d");

        // Setup the sound
        bgAudio = document.querySelector("#bgAudio");
        bgAudio.volume = 0.25;
        effectAudio = document.querySelector("#effectAudio");
        effectAudio.volume = 0.3;
        targetAudio = document.querySelector("#targetAudio");
        targetAudio.volume = 0.4;

        // Load the highscore from local storage
        currentHighscore = parseInt(localStorage.getItem(LOCAL_STORAGE_HIGHSCORE_KEY));

        // No NaN highscores!
        if (!currentHighscore) {
            currentHighscore = 0;
        }

        // Load level
        reset();

        // Setup our listeners
        window.onblur = function () {

            // Stop the music
            stopAudio();

            paused = true;
            cancelAnimationFrame(animationID);
            // Call update() once so that our pause screen gets drawn
            update();
        }

        window.onfocus = function () {

            // Start the music
            bgAudio.play();

            cancelAnimationFrame(animationID);
            paused = false;
            update();
        }

        canvas.onmousedown = doMousedown;

        update();
    }

    function reset() {
        currentLevel++;
        numCircles += NUM_CIRCLES_LEVEL_INCREASE;
        roundScore = 0;


        // Reset circle data
        currentStartRadius = DEFAULT_START_RADIUS;
        currentMaxSpeed = DEFAULT_MAX_SPEED;
        currentMaxRadius = DEFAULT_MAX_RADIUS;
        currentMinRadius = DEFAULT_MIN_RADIUS;
        currentMaxLifetime = DEFAULT_MAX_LIFETIME;
        currentExplosionSpeed = DEFAULT_EXPLOSION_SPEED;
        currentImplosionSpeed = DEFAULT_IMPLOSION_SPEED;

        var level = levels[currentLevel];

        if (level.startRadius) {
            currentStartRadius = level.startRadius;
        }
        if (level.maxSpeed) {
            currentMaxSpeed = level.maxSpeed;
        }
        if (level.maxRadius) {
            currentMaxRadius = level.maxRadius;
        }
        if (level.minRadius) {
            currentMinRadius = level.minRadius;
        }
        if (level.maxLifetime) {
            currentMaxLifetime = level.maxLifetime;
        }
        if (level.explosionSpeed) {
            currentExplosionSpeed = level.explosionSpeed;
        }
        if (level.implosionSpeed) {
            currentImplosionSpeed = level.implosionSpeed;
        }

        circles = makeCircles(numCircles);
    }

    function stopAudio() {
        bgAudio.pause();
        bgAudio.currentTime = 0;
    }

    function playEffect() {

        if (roundScore == Math.floor(numCircles * PERCENT_CIRCLES_TO_ADVANCE)) {
            targetAudio.src = "media/" + metTargetSound;
            targetAudio.play();
            return;
        }

        effectAudio.src = "media/" + effectSounds[currentEffect];
        effectAudio.play();

        currentEffect = currentEffect + currentDirection;
        if (currentEffect == effectSounds.length || currentEffect == -1) {
            currentDirection *= -1;
            currentEffect = currentEffect + currentDirection;
        }
    }

    function drawPauseScreen() {
        ctx.save();
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        drawText("... PAUSED ...", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 60, "white");
        ctx.restore();
    }

    function moveCircles(dt) {
        for (var i = 0; i < circles.length; i++) {

            var c = circles[i];

            if (c.state === CIRCLE_STATE_DONE) {
                continue;
            }

            if (c.state === CIRCLE_STATE_EXPLODING) {
                c.radius += currentExplosionSpeed * dt;
                if (c.radius >= currentMaxRadius) {
                    c.state = CIRCLE_STATE_DONE;
                    console.log("circle #" + i + " hit currentMaxRadius");
                }
                continue;
            }

            if (c.state === CIRCLE_STATE_IMPLODING) {
                c.radius -= currentImplosionSpeed * dt;
                if (c.radius <= currentMinRadius) {
                    c.state = CIRCLE_STATE_DONE;
                    console.log("circle #" + i + " hit currentMinRadius and is gone");
                }
                continue;
            }

            // Move the circle
            c.move(dt);

            // Did the circle leave the screen?
            if (circleHitLeftRight(c.x, c.y, c.radius))
                c.xSpeed *= -1;
            if (circleHitTopBottom(c.x, c.y, c.radius))
                c.ySpeed *= -1;
        }
    }

    function checkForCollisions() {
        for (var i = 0; i < circles.length; i++)
        {
            var c1 = circles[i];

            for (var j = 0; j < circles.length; j++)
            {
                var c2 = circles[j];

                //if two circles are near each other...
                if (c1.x + c1.radius + c2.radius > c2.x
                    && c1.x < c2.x + c1.radius + c2.radius
                    && c1.y + c1.radius + c2.radius > c2.y
                    && c1.y < c2.y + c1.radius + c2.radius) {

                    // don't check for collisions if c2 is the same circle
                    if (c1 === c2)
                        continue;

                    //if two circles are colliding...
                    if (Utilities.circlesIntersect(c1, c2)) {

                        if (c1.state == CIRCLE_STATE_EXPLODING && c2.clicked == true) {
                            //calculate their new velocities
                            var newVelX = ((c2.xSpeed * (c2.mass - c1.mass)) + (2 * c1.mass * -c2.xSpeed)) / (c1.mass + c2.mass);
                            var newVelY = ((c2.ySpeed * (c2.mass - c1.mass)) + (2 * c1.mass * -c2.ySpeed)) / (c1.mass + c2.mass);

                            c2.xSpeed = newVelX;
                            c2.ySpeed = newVelY;

                            c2.clicked = false;
                        }

                        else if (c2.state == CIRCLE_STATE_EXPLODING && c1.clicked == true) {
                            //calculate their new velocities
                            var newVelX = ((c1.xSpeed * (c1.mass - c2.mass)) + (2 * c2.mass * -c1.xSpeed)) / (c1.mass + c2.mass);
                            var newVelY = ((c1.ySpeed * (c1.mass - c2.mass)) + (2 * c2.mass * -c1.ySpeed)) / (c1.mass + c2.mass);

                            c1.xSpeed = newVelX;
                            c1.ySpeed = newVelY;

                            c1.clicked = false;
                        }

                        else if (c1.state == CIRCLE_STATE_NORMAL && c2.state == CIRCLE_STATE_NORMAL) {
                            //calculate their new velocities
                            var newVelX1 = ((c1.xSpeed * (c1.mass - c2.mass)) + (2 * c2.mass * c2.xSpeed)) / (c1.mass + c2.mass);
                            var newVelY1 = ((c1.ySpeed * (c1.mass - c2.mass)) + (2 * c2.mass * c2.ySpeed)) / (c1.mass + c2.mass);
                            var newVelX2 = ((c2.xSpeed * (c2.mass - c1.mass)) + (2 * c1.mass * c1.xSpeed)) / (c1.mass + c2.mass);
                            var newVelY2 = ((c2.ySpeed * (c2.mass - c1.mass)) + (2 * c1.mass * c1.ySpeed)) / (c1.mass + c2.mass);

                            c1.xSpeed = newVelX1;
                            c1.ySpeed = newVelY1;
                            c2.xSpeed = newVelX2;
                            c2.ySpeed = newVelY2;

                            //update their positions so they're not colliding anymore
                            c1.x += newVelX1;
                            c1.y += newVelY1;
                            c2.x += newVelX2;
                            c2.y += newVelY2;
                        }
                    }
                }
            }
        }

        /*
        // round over?
        var isOver = true;
        for (var i = 0; i < circles.length; i++) {
            var c = circles[i];
            if (c.state != CIRCLE_STATE_NORMAL && c.state != CIRCLE_STATE_DONE) {
                isOver = false;
                break;
            }
        } // end for

        if (isOver) {

            if (roundScore < Math.floor(numCircles * PERCENT_CIRCLES_TO_ADVANCE)) {
                gameState = GAME_STATE_REPEAT_LEVEL;
            }
            else
            {
                totalScore += roundScore;

                if (numCircles >= NUM_CIRCLES_END) {
                    gameState = GAME_STATE_END;

                    // Check for a new highscore
                    if (totalScore > currentHighscore) {
                        currentHighscore = totalScore;
                        localStorage.setItem(LOCAL_STORAGE_HIGHSCORE_KEY, currentHighscore);
                        gotHighscore = true;
                    }
                }
                else {
                    gameState = GAME_STATE_ROUND_OVER;
                }
            }

            stopAudio();
            */
    }

    function drawCircles() {
        if (gameState == GAME_STATE_ROUND_OVER || gameState == GAME_STATE_END || gameState == GAME_STATE_REPEAT_LEVEL)
            ctx.globalAlpha = 0.25;

        for (var i = 0; i < circles.length; i++) {

            var c = circles[i];

            if (c.state == CIRCLE_STATE_DONE)
                continue;

            ctx.beginPath();
            ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fillStyle = c.fillStyle;
            ctx.fill();
        }
    }

    function drawHUD() {
        // draw score
        // drawText(string, x, y, size, color)

        var fontSize = 30;

        var goalCircles = (Math.floor(numCircles * PERCENT_CIRCLES_TO_ADVANCE));
        var level = levels[currentLevel];

        drawText("This Round: " + roundScore + "/" + goalCircles + " of " + numCircles, 10, 20, 16, "#ddd");
        drawText("Total Score: " + totalScore, CANVAS_WIDTH - 170, 20, 16, "#ddd");

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        drawText("Highscore: " + currentHighscore, CANVAS_WIDTH / 2, 15, 15, "lightgray");
        ctx.restore();

        if (gameState == GAME_STATE_BEGIN) {
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            drawText("To begin, click a circle.", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, fontSize, "white");
            drawText("I promise it won't explode.", CANVAS_WIDTH / 2, (CANVAS_HEIGHT / 2) + 35, fontSize, "white");
            ctx.restore();
        } // end if

        if (gameState == GAME_STATE_ROUND_OVER) {
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            drawText("Round Complete - " + level.winMessage, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, fontSize, "green");
            drawText("Click to continue", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, fontSize, "blue");
            drawText("Next round there are " + (numCircles + NUM_CIRCLES_LEVEL_INCREASE) + " circles", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35, 24, "#ddd");

            ctx.restore();
        } // end if

        if (gameState == GAME_STATE_REPEAT_LEVEL) {

            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            drawText("Round Failed - " + level.loseMessage, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, fontSize, "red");
            drawText("Click to retry", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, fontSize, "red");
            drawText("Goal: " + goalCircles + " of " + numCircles + " circles", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35, 24, "#ddd");

            ctx.restore();
        } // end if

        if (gameState == GAME_STATE_END) {
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            var gameOverText = "Game Complete";
            if (gotHighscore) {
                gameOverText = "Game Complete - New Highscore!";
            }
            drawText(gameOverText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, fontSize, "lightgreen");
            drawText("Click to play again", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, fontSize, "red");
            drawText("Your final score was " + (totalScore) + "!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35, 24, "#ddd");

            ctx.restore();
        }

    } // end function

    // This function soon be called 60 times a second :o
    function update() {

        // Calculate delta time
        var dt = calculateDeltaTime();

        // Paused?
        if (paused) {
            drawPauseScreen();
            return; // bail out of update()
        }


        // Loop at dat 60 frames per second!
        // Moved this up to schedule the update sooner
        animationID = requestAnimationFrame(update);

        // Update the locations of the circles.
        moveCircles(dt);

        // Check for collisions
        checkForCollisions();

        // Draw the background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw the circles
        ctx.globalAlpha = 0.9;
        drawCircles();

        // Draw the HUD
        ctx.globalAlpha = 1.0;
        drawHUD();

        if (DEBUG == 1) {
            // Draw the FPS
            drawText("dt: " + dt.toFixed(3), 200, 450, 24, "red");
        }

    }

    function circleHitLeftRight(x, y, radius) {
        return (x < radius || x > CANVAS_WIDTH - radius);
    }

    function circleHitTopBottom(x, y, radius) {
        return (y < radius || y > CANVAS_HEIGHT - radius);
    }

    function drawText(string, x, y, size, color) {
        ctx.font = 'bold ' + size + 'px Monospace';
        ctx.fillStyle = color;
        ctx.fillText(string, x, y);
    }

    function calculateDeltaTime() {
        var now, fps;
        // The + converts the data to a primitive; in this case, UNIX timestamp in MS!
        // Very useful!
        now = (+new Date);
        fps = 1000 / (now - lastTime);
        fps = Utilities.clamp(fps, 12, 60);
        lastTime = now; // lastTime is a global
        return 1 / fps;
    }

    function getRandomLevelColor() {

        // Grab the base color for the level
        var level = levels[currentLevel];
        var baseColor = Utilities.hexToRgb(level.baseColor);

        // Define the maximum delta for the color
        var maxDelta = 100;

        // Change the color
        baseColor.r = Utilities.clamp(baseColor.r + Math.floor(Utilities.getRandom(-maxDelta, maxDelta)), 0, 255);
        baseColor.g = Utilities.clamp(baseColor.g + Math.floor(Utilities.getRandom(-maxDelta, maxDelta)), 0, 255);
        baseColor.b = Utilities.clamp(baseColor.b + Math.floor(Utilities.getRandom(-maxDelta, maxDelta)), 0, 255);

        // Create the new color
        var color = 'rgba(' + baseColor.r + ',' + baseColor.g + ',' + baseColor.b + ',0.50)';

        // Return the new color
        return color;
    }

    function makeCircles(num) {
        var array = [];
        for (var i = 0; i < num; i++) {
            var c = {};
            c.x = Utilities.getRandom(currentStartRadius * 2, CANVAS_WIDTH - currentStartRadius * 2);
            c.y = Utilities.getRandom(currentStartRadius * 2, CANVAS_HEIGHT - currentStartRadius * 2);
            c.radius = currentStartRadius;
            //c.xSpeed = Utilities.getRandom(-currentMaxSpeed, currentMaxSpeed);
            //c.ySpeed = Utilities.getRandom(-currentMaxSpeed, currentMaxSpeed);

            var randomVector = Utilities.getRandomUnitVector();
            c.xSpeed = randomVector.x;
            c.ySpeed = randomVector.y;
            c.speed = currentMaxSpeed;
            c.mass = 1.0;
            c.clicked = false;

            //c.fillStyle = getRandomColor();
            c.fillStyle = getRandomLevelColor();
            c.state = CIRCLE_STATE_NORMAL;
            c.lifetime = 0;
            c.move = _circleMove;
            array.push(c);
        }
        return array;
    }

    // Belongs to my circle objects. Mine!
    var _circleMove = function (dt) {
        this.x += this.xSpeed * this.speed * dt;
        this.y += this.ySpeed * this.speed * dt;
    }

    function doMousedown(e) {

        // Play the background music
        bgAudio.play();

        // If paused then unpause
        if (paused) {
            paused = false;
            update();
            return;
        }

        if (gameState == GAME_STATE_ROUND_OVER) {
            gameState = GAME_STATE_DEFAULT;
            reset();
            return;
        }

        if (gameState == GAME_STATE_END) {

            // Reset everything!
            gameState = GAME_STATE_DEFAULT;
            totalScore = 0;
            numCircles = NUM_CIRCLES_START - NUM_CIRCLES_LEVEL_INCREASE;
            currentLevel = -1;
            gotHighscore = false;
            reset();
            return;
        }

        if (gameState == GAME_STATE_REPEAT_LEVEL) {
            gameState = GAME_STATE_DEFAULT;

            // Return to the previous level
            currentLevel--;
            numCircles -= NUM_CIRCLES_LEVEL_INCREASE;
            reset();
            return;
        }

        var mouse = Utilities.getMouse(e);

        mouseClick(mouse);
    }

    function mouseClick(mouse) {
        playEffect();

        var c = {};
        c.x = mouse.x;
        c.y = mouse.y;
        c.xSpeed = 0;
        c.ySpeed = 0;
        c.speed = currentMaxSpeed;
        c.radius = currentStartRadius;
        //TODO: Change color to match level
        c.fillStyle = Utilities.getRandomColor();
        c.state = CIRCLE_STATE_EXPLODING;
        c.move = _circleMove;
        c.lifetime = 0;
        c.mass = 1.0;
        c.clicked = false;
        circles.push(c);

        for (var i = 0; i < circles.length; i++) {
            circles[i].clicked = true;
        }
    };



}());