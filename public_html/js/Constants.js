/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


"use strict";
window.Constants = (function () {

    /**
     * Creates a new Constants.
     * @returns {undefined}
     */
    function Constants() {

    }
    
    // A common convention is all caps for constant values :)
    Constants.CANVAS_WIDTH = 640;
    Constants.CANVAS_HEIGHT = 480;

    // ALL THE CONSTANTS
    Constants.DEFAULT_START_RADIUS = 50;
    Constants.DEFAULT_MAX_SPEED = 90;
    Constants.DEFAULT_MAX_RADIUS = 70;
    Constants.DEFAULT_MIN_RADIUS = 2;
    Constants.DEFAULT_MAX_LIFETIME = 1;
    Constants.DEFAULT_EXPLOSION_SPEED = 50;
    Constants.DEFAULT_IMPLOSION_SPEED = 60;

    // Circle states
    Constants.CIRCLE_STATE_NORMAL = 0;
    Constants.CIRCLE_STATE_IMPLODING = 1;
    Constants.CIRCLE_STATE_DONE = 2;

    // Game states
    Constants.GAME_STATE_BEGIN = 0;
    Constants.GAME_STATE_DEFAULT = 1;
    Constants.GAME_STATE_ROUND_OVER = 2;
    Constants.GAME_STATE_END = 3;
    Constants.GAME_STATE_REPEAT_LEVEL = 4;

    // Number stuff
    Constants.NUM_CIRCLES_START = 8;
    Constants.NUM_CIRCLES_LEVEL_INCREASE = 2;
    Constants.PERCENT_CIRCLES_TO_ADVANCE = 0.3;
    Constants.LOCAL_STORAGE_HIGHSCORE_KEY = "highscore";
    
    
    return Constants;

})();