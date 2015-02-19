/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


"use strict";
window.GameEngine = (function () {

    /**
     * Creates a new GameEngine.
     * @returns {undefined}
     */
    function GameEngine() {
        
        GameEngine.INSTANCE = this;
        
        // Declare some variables!
        this.canvas = null;
        this.ctx = null;
        this.circles = [];
        this.paused = false;
        this.animationID;

        // Current level specific circle stuff
        this.currentStartRadius = Constants.DEFAULT_START_RADIUS;
        this.currentMaxSpeed = Constants.DEFAULT_MAX_SPEED;
        this.currentMaxRadius = Constants.DEFAULT_MAX_RADIUS;
        this.currentMinRadius = Constants.DEFAULT_MIN_RADIUS;
        this.currentMaxLifetime = Constants.DEFAULT_MAX_LIFETIME;
        this.currentExplosionSpeed = Constants.DEFAULT_EXPLOSION_SPEED;
        this.currentImplosionSpeed = Constants.DEFAULT_IMPLOSION_SPEED;
        this.currentCircleIndex = -1;

        // I love bugs!
        this.DEBUG = 0;

        // Only one lonely variable
        this.numCircles = Constants.NUM_CIRCLES_START - Constants.NUM_CIRCLES_LEVEL_INCREASE;

        // More variables!
        this.gameState = Constants.GAME_STATE_BEGIN;
        this.currentLevel = -1;
        this.roundScore;
        this.totalScore = 0;
        this.lastTime = 0;
        this.currentHighscore = 0;
        this.gotHighscore = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.audioManager = new AudioManager();

    }
    
    /**
     * The instance of the engine.
     */
    GameEngine.INSTANCE = null;
    
    /**
     * Initialize the engine.
     * @returns {undefined}
     */
    GameEngine.prototype.init = function() {
        
        // Setup the canvas
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");

        // Setup the sound
        this.audioManager.init();

        // Load the highscore from local storage
        this.currentHighscore = parseInt(localStorage.getItem(Constants.LOCAL_STORAGE_HIGHSCORE_KEY));

        // No NaN highscores!
        if (!this.currentHighscore) {
            this.currentHighscore = 0;
        }

        // Load level
        this.startNextLevel();
        
        // Get a reference to the engine for our Wevent listeners
        var engine = this;

        // Setup our listeners
        window.onblur = function () {

            // Stop the music
            engine.audioManager.stopAudio();

            engine.paused = true;
            cancelAnimationFrame(engine.animationID);
            // Call update() once so that our pause screen gets drawn
            engine.update();
        };

        window.onfocus = function () {

            // Start the music
            engine.audioManager.startAudio();

            cancelAnimationFrame(engine.animationID);
            engine.paused = false;
            engine.update();
        };

        this.canvas.onmousedown = this.handleMouseDown;
        this.canvas.onmouseup = this.handleMouseUp;
        this.canvas.onmousemove = this.handleMouseMove;

        engine.update();
        
    };
    
    /**
     * Start the next level.
     * @returns {undefined}
     */
    GameEngine.prototype.startNextLevel = function() {
        this.currentLevel++;
        this.numCircles += Constants.NUM_CIRCLES_LEVEL_INCREASE;
        this.roundScore = 0;


        // Reset circle data
        this.currentStartRadius = Constants.DEFAULT_START_RADIUS;
        this.currentMaxSpeed = Constants.DEFAULT_MAX_SPEED;
        this.currentMaxRadius = Constants.DEFAULT_MAX_RADIUS;
        this.currentMinRadius = Constants.DEFAULT_MIN_RADIUS;
        this.currentMaxLifetime = Constants.DEFAULT_MAX_LIFETIME;
        this.currentExplosionSpeed = Constants.DEFAULT_EXPLOSION_SPEED;
        this.currentImplosionSpeed = Constants.DEFAULT_IMPLOSION_SPEED;

        var level = Levels.LEVELS[this.currentLevel];

        if (level.startRadius) {
            this.currentStartRadius = level.startRadius;
        }
        if (level.maxSpeed) {
            this.currentMaxSpeed = level.maxSpeed;
        }
        if (level.maxRadius) {
            this.currentMaxRadius = level.maxRadius;
        }
        if (level.minRadius) {
            this.currentMinRadius = level.minRadius;
        }
        if (level.maxLifetime) {
            this.currentMaxLifetime = level.maxLifetime;
        }
        if (level.explosionSpeed) {
            this.currentExplosionSpeed = level.explosionSpeed;
        }
        if (level.implosionSpeed) {
            this.currentImplosionSpeed = level.implosionSpeed;
        }
        
        if (level.circles) {
            this.circles = this.spawnCircles(level.circles);
        }
        else
        {
            this.circles = this.makeCircles(numCircles);
        }
    };
    
    /**
     * Draw the pause screen.
     * @returns {undefined}
     */
    GameEngine.prototype.drawPauseScreen = function() {
        
        // Grab the canvas context
        var ctx = this.ctx;
        
        ctx.save();
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        this.drawText("... PAUSED ...", Constants.CANVAS_WIDTH / 2, Constants.CANVAS_HEIGHT / 2, 60, "white");
        ctx.restore();
    };
    
    /**
     * Move a circle.
     * @param {Number} dt The delta time.
     * @returns {undefined}
     */
    GameEngine.prototype._circleMove = function (dt) {
        this.x += this.xSpeed * this.speed * dt;
        this.y += this.ySpeed * this.speed * dt;

        this.xSpeed *= 0.99;
        this.ySpeed *= 0.99;
    };
    
    /**
     * Spawn circles.
     * @param {Array} circles The array of circle locations.
     * @returns {Array} The array of circle objects.
     */
    GameEngine.prototype.spawnCircles = function(circles) {
        var array = [];
        var currentColor;
        for (var i = 0; i < circles.length; i++) {
            var c = {};

            c.x = circles[i].x;
            c.y = circles[i].y;
            
            c.radius = this.currentStartRadius;
            
            c.xSpeed = 0;
            c.ySpeed = 0;
            c.speed = this.currentMaxSpeed;
            c.mass = Utilities.getRandom(0.9, 1.1);

            if (i % 2 === 0)
            {
                currentColor = this.getRandomLevelColor();
            }
            
            // Check if a custom color is set for the circle
            if (circles[i].color) {
                currentColor = circles[i].color;
            }
            
            c.fillStyle = currentColor;
            
            c.state = Constants.CIRCLE_STATE_NORMAL;
            c.lifetime = 0;
            c.move = GameEngine.prototype._circleMove;
            array.push(c);
        }
        return array;
    };

    /**
     * Make circles from random data.
     * @param {Number} count The amount of circles to create.
     * @returns {Array} The array of circle objects.
     */
    GameEngine.prototype.makeCircles = function(count) {
        var array = [];
        for (var i = 0; i < count; i++) {
            var c = {};
            c.x = Utilities.getRandom(this.currentStartRadius * 2, Constants.CANVAS_WIDTH - this.currentStartRadius * 2);
            c.y = Utilities.getRandom(this.currentStartRadius * 2, Constants.CANVAS_HEIGHT - this.currentStartRadius * 2);
            c.radius = currentStartRadius;

            var randomVector = Utilities.getRandomUnitVector();
            c.xSpeed = randomVector.x;
            c.ySpeed = randomVector.y;
            c.speed = this.currentMaxSpeed;
            c.mass = Utilities.getRandom(0.9, 1.1);

            //c.fillStyle = getRandomColor();
            c.fillStyle = getRandomLevelColor();
            c.state = Constants.CIRCLE_STATE_NORMAL;
            c.lifetime = 0;
            c.move = GameEngine.prototype._circleMove;
            array.push(c);
        }
        return array;
    };
    
    /**
     * Get a random color that matches the level's base color.
     * @returns {String}
     */
    GameEngine.prototype.getRandomLevelColor = function() {

        // Grab the base color for the level
        var level = Levels.LEVELS[this.currentLevel];
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
    };
    
    /**
     * Handle a mouse down event.
     * @param {Object} e The event.
     * @returns {undefined}
     */
    GameEngine.prototype.handleMouseDown = function(e) {
        
        var engine = GameEngine.INSTANCE;

        // Play the background music
        engine.audioManager.startAudio();

        // If paused then unpause
        if (engine.paused) {
            engine.paused = false;
            engine.update();
            return;
        }
        
        if (engine.gameState === Constants.GAME_STATE_BEGIN) {
            engine.gameState = Constants.GAME_STATE_DEFAULT;
        }

        if (engine.gameState === Constants.GAME_STATE_ROUND_OVER) {
            engine.gameState = Constants.GAME_STATE_DEFAULT;
            engine.startNextLevel();
            return;
        }

        if (engine.gameState === Constants.GAME_STATE_END) {

            // Reset everything!
            engine.gameState = Constants.GAME_STATE_DEFAULT;
            engine.totalScore = 0;
            engine.numCircles = Constants.NUM_CIRCLES_START - Constants.NUM_CIRCLES_LEVEL_INCREASE;
            engine.currentLevel = -1;
            engine.gotHighscore = false;
            engine.startNextLevel();
            return;
        }

        if (engine.gameState === Constants.GAME_STATE_REPEAT_LEVEL) {
            engine.gameState = Constants.GAME_STATE_DEFAULT;

            // Return to the previous level
            engine.currentLevel--;
            engine.numCircles -= Constants.NUM_CIRCLES_LEVEL_INCREASE;
            engine.startNextLevel();
            return;
        }

        var mouse = Utilities.getMouse(e);

        for (var i = engine.circles.length - 1; i >= 0; i--) {
            var c = engine.circles[i];
            if (Utilities.pointInsideCircle(mouse.x, mouse.y, c)) {
                engine.currentCircleIndex = i;
                break;
            }
        }
    };

    /**
     * Handle a mouse up event.
     * @param {Object} e The event.
     * @returns {undefined}
     */
    GameEngine.prototype.handleMouseUp = function(e) {
        
        var engine = GameEngine.INSTANCE;
        
        if (engine.currentCircleIndex === -1) {
            return;
        }
        
        var mouse = Utilities.getMouse(e);
        var currentCircle = engine.circles[engine.currentCircleIndex];
        currentCircle.xSpeed = (currentCircle.x - mouse.x) * 0.05;
        currentCircle.ySpeed = (currentCircle.y - mouse.y) * 0.05;

        engine.currentCircleIndex = -1;
    };

    /**
     * Handle a mouse move event.
     * @param {Object} e The event.
     * @returns {undefined}
     */
    GameEngine.prototype.handleMouseMove = function(e) {
        
        var engine = GameEngine.INSTANCE;
        
        var mouse = Utilities.getMouse(e);

        engine.lastMouseX = mouse.x;
        engine.lastMouseY = mouse.y;
    };
    
    /**
     * Calculate the delta time from the last function call.
     * @returns {Number|now}
     */
    GameEngine.prototype.calculateDeltaTime = function() {
        var now, fps;
        // The + converts the data to a primitive; in this case, UNIX timestamp in MS!
        // Very useful!
        now = (+new Date);
        fps = 1000 / (now - this.lastTime);
        fps = Utilities.clamp(fps, 12, 60);
        this.lastTime = now;
        return 1 / fps;
    };
    
    /**
     * Draw the arrow from the mouse to the currently selected circle.
     * @returns {undefined}
     */
    GameEngine.prototype.drawMouseArrow = function() {
        
        // Make sure we are clicking a circle
        if (this.currentCircleIndex === -1) {
            return;
        }
        
        var currentCircle = this.circles[this.currentCircleIndex];
        var ctx = this.ctx;
        
        ctx.beginPath();
        ctx.moveTo(this.lastMouseX, this.lastMouseY);
        ctx.lineTo(currentCircle.x, currentCircle.y);
        ctx.closePath();
        ctx.strokeStyle = "white";
        ctx.stroke();
        
    };
    
    /**
     * Draw text on the canvas.
     * @param {String} string The text to draw.
     * @param {Number} x The x coordinate of the text.
     * @param {Number} y The y coordinate of the text.
     * @param {Number} size The size of the text.
     * @param {String} color The color of the text.
     * @returns {undefined}
     */
    GameEngine.prototype.drawText = function(string, x, y, size, color) {
        var ctx = this.ctx;
        ctx.font = 'bold ' + size + 'px Monospace';
        ctx.fillStyle = color;
        ctx.fillText(string, x, y);
    };
    
    /**
     * Draw the HUD.
     * @returns {undefined}
     */
    GameEngine.prototype.drawHUD = function() {
        // draw score
        // drawText(string, x, y, size, color)

        var fontSize = 30;

        var goalCircles = (Math.floor(this.numCircles * Constants.PERCENT_CIRCLES_TO_ADVANCE));
        var level = Levels.LEVELS[this.currentLevel];

        //drawText("This Round: " + roundScore + "/" + goalCircles + " of " + numCircles, 10, 20, 16, "#ddd");
        //TODO: Add new display text
        
        var ctx = this.ctx;
        
        this.drawText("Total Score: " + this.totalScore, Constants.CANVAS_WIDTH - 170, 20, 16, "#ddd");

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        this.drawText("Highscore: " + this.currentHighscore, Constants.CANVAS_WIDTH / 2, 15, 15, "lightgray");
        ctx.restore();

        if (this.gameState === Constants.GAME_STATE_BEGIN) {
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            this.drawText("To begin, click and drag a circle.", Constants.CANVAS_WIDTH / 2, Constants.CANVAS_HEIGHT / 2, fontSize, "white");
            this.drawText("I wonder what will happen!", Constants.CANVAS_WIDTH / 2, (Constants.CANVAS_HEIGHT / 2) + 35, fontSize, "white");
            ctx.restore();
        } // end if

        if (this.gameState === Constants.GAME_STATE_ROUND_OVER) {
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            this.drawText("Round Complete - " + level.winMessage, Constants.CANVAS_WIDTH / 2, Constants.CANVAS_HEIGHT / 2 - 40, fontSize, "green");
            this.drawText("Click to continue", Constants.CANVAS_WIDTH / 2, Constants.CANVAS_HEIGHT / 2, fontSize, "blue");
            this.drawText("Next round there are " + (numCircles + Constants.NUM_CIRCLES_LEVEL_INCREASE) + " circles", Constants.CANVAS_WIDTH / 2, Constants.CANVAS_HEIGHT / 2 + 35, 24, "#ddd");

            ctx.restore();
        } // end if

        if (this.gameState === Constants.GAME_STATE_REPEAT_LEVEL) {

            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            this.drawText("Round Failed - " + level.loseMessage, Constants.CANVAS_WIDTH / 2, Constants.CANVAS_HEIGHT / 2 - 40, fontSize, "red");
            this.drawText("Click to retry", Constants.CANVAS_WIDTH / 2, Constants.CANVAS_HEIGHT / 2, fontSize, "red");
            this.drawText("Goal: " + goalCircles + " of " + numCircles + " circles", Constants.CANVAS_WIDTH / 2, Constants.CANVAS_HEIGHT / 2 + 35, 24, "#ddd");

            ctx.restore();
        } // end if

        if (this.gameState === Constants.GAME_STATE_END) {
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            var gameOverText = "Game Complete";
            if (this.gotHighscore) {
                gameOverText = "Game Complete - New Highscore!";
            }
            this.drawText(gameOverText, Constants.CANVAS_WIDTH / 2, Constants.CANVAS_HEIGHT / 2 - 40, fontSize, "lightgreen");
            this.drawText("Click to play again", Constants.CANVAS_WIDTH / 2, Constants.CANVAS_HEIGHT / 2, fontSize, "red");
            this.drawText("Your final score was " + (totalScore) + "!", Constants.CANVAS_WIDTH / 2, Constants.CANVAS_HEIGHT / 2 + 35, 24, "#ddd");

            ctx.restore();
        }

    };
    
    /**
     * Draw a wall.
     * @param {Number} x1 The first X coordinate.
     * @param {Number} y1 The first Y coordinate.
     * @param {Number} x2 The second X coordinate.
     * @param {Number} y2 The second Y coordinate.
     * @returns {undefined}
     */
    GameEngine.prototype.drawWall = function(x1, y1, x2, y2) {
        var ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.strokeStyle = "white";
        ctx.stroke();
    };
    
    /**
     * Draw the walls of the current level.
     * @returns {undefined}
     */
    GameEngine.prototype.drawWalls = function() {
        var level = Levels.LEVELS[this.currentLevel];
        var ctx = this.ctx;
        if (level.walls) {
            var walls = level.walls;
            
            for (var i = 0; i < walls.length; i++) {
                
                var wall = walls[i];
                
                this.drawWall(wall.x1, wall.y1, wall.x2, wall.y2);
                
                if (wall.autoReflectX) {
                    this.drawWall(Constants.CANVAS_WIDTH - wall.x1, wall.y1, Constants.CANVAS_WIDTH - wall.x2, wall.y2);
                }
                if (wall.autoReflectY) {
                    this.drawWall(wall.x1, Constants.CANVAS_HEIGHT - wall.y1, wall.x2, Constants.CANVAS_HEIGHT - wall.y2);
                }
                if (wall.autoReflectAll) {
                    this.drawWall(
                    Constants.CANVAS_WIDTH - wall.x1, 
                    Constants.CANVAS_HEIGHT - wall.y1, 
                    Constants.CANVAS_WIDTH - wall.x2, 
                    Constants.CANVAS_HEIGHT - wall.y2);
                }
            }
        }
    };
    
    /**
     * Draw the circles.
     * @returns {undefined}
     */
    GameEngine.prototype.drawCircles = function() {
        var gameState = this.gameState;
        var circles = this.circles;
        var ctx = this.ctx;
        
        if (gameState === Constants.GAME_STATE_ROUND_OVER || gameState === Constants.GAME_STATE_END || gameState === Constants.GAME_STATE_REPEAT_LEVEL)
            ctx.globalAlpha = 0.25;

        for (var i = 0; i < circles.length; i++) {

            var c = circles[i];

            if (c.state === Constants.CIRCLE_STATE_DONE)
                continue;

            ctx.beginPath();
            ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fillStyle = c.fillStyle;
            ctx.fill();
        }
    };
    
    /**
     * Move the circles.
     * @param {Number} dt The delta time since the last movement call.
     * @returns {undefined}
     */
    GameEngine.prototype.moveCircles = function(dt) {
        var circles = this.circles;
        
        for (var i = 0; i < circles.length; i++) {

            var c = circles[i];

            if (c.state === Constants.CIRCLE_STATE_DONE) {
                continue;
            }

            if (c.state === Constants.CIRCLE_STATE_IMPLODING) {
                c.radius -= this.currentImplosionSpeed * dt;
                if (c.radius <= this.currentMinRadius) {
                    c.state = Constants.CIRCLE_STATE_DONE;
                }
                continue;
            }

            // Move the circle
            c.move(dt);

            // Did the circle leave the screen?
            if (Utilities.circleHitLeftRight(c.x, c.y, c.radius))
                c.xSpeed *= -1;
            if (Utilities.circleHitTopBottom(c.x, c.y, c.radius))
                c.ySpeed *= -1;
        }
    };
    
    /**
     * Check for collisions.
     * @returns {undefined}
     */
    GameEngine.prototype.checkForCollisions = function() {
        var circles = this.circles;
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
                    if (Utilities.circlesIntersect(c1, c2) && c1.state === Constants.CIRCLE_STATE_NORMAL && c2.state === Constants.CIRCLE_STATE_NORMAL) {

                        //if they share the same color, clear them
                        if (c1.fillStyle === c2.fillStyle) {
                            c1.state = Constants.CIRCLE_STATE_IMPLODING;
                            c2.state = Constants.CIRCLE_STATE_IMPLODING;
                        }

                        //otherwise do collisions
                        else {
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
    };
    
    /**
     * Perform a game tick.
     * @returns {undefined}
     */
    GameEngine.prototype.update = function() {
        
        var engine = GameEngine.INSTANCE;

        // Calculate delta time
        var dt = engine.calculateDeltaTime();

        // Paused?
        if (engine.paused) {
            engine.drawPauseScreen();
            return; // bail out of update()
        }


        // Loop at dat 60 frames per second!
        // Moved this up to schedule the update sooner
        engine.animationID = requestAnimationFrame(engine.update);

        // Update the locations of the circles.
        engine.moveCircles(dt);

        // Check for collisions
        
        // TODO: Check for collisions with level walls
        engine.checkForCollisions();
        
        var ctx = engine.ctx;

        // Draw the background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);

        // Draw the circles
        ctx.globalAlpha = 0.9;
        engine.drawCircles();
        
        // Draw the walls
        engine.drawWalls();
        
        // Draw the arrow
        engine.drawMouseArrow();

        // Draw the HUD
        ctx.globalAlpha = 1.0;
        engine.drawHUD();

        if (Constants.DEBUG === 1) {
            // Draw the FPS
            engine.drawText("dt: " + dt.toFixed(3), 200, 450, 24, "red");
        }

    };

    
    return GameEngine;

})();