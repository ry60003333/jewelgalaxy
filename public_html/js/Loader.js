/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

"use strict";
(function () {
    
    // Set our onload event
    window.onload = load;

    /**
     * Load the game.
     * @returns {undefined}
     */
    function load() {
        // Create an instance of the engine
        var engine = new GameEngine();
        
        // Start the game
        engine.initLoading();
    };
})();