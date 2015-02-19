/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


"use strict";
window.AudioManager = (function () {

    /**
     * Creates a new AudioManager.
     * @returns {undefined}
     */
    function AudioManager() {
        this.bgAudio = null;
        this.effectAudio = null;
        this.targetAudio = null;
        this.currentEffect = 0;
        this.currentDirection = 1;
        this.effectSounds = ["1.mp3", "2.mp3", "3.mp3", "4.mp3", "5.mp3", "6.mp3", "7.mp3", "8.mp3", ];
        this.metTargetSound = "level-complete.mp3";
    }
    
    /**
     * Initialize the AudioManager.
     * @returns {undefined}
     */
    AudioManager.prototype.init = function() {
        this.bgAudio = document.querySelector("#bgAudio");
        this.bgAudio.volume = 0.25;
        this.effectAudio = document.querySelector("#effectAudio");
        this.effectAudio.volume = 0.3;
        this.targetAudio = document.querySelector("#targetAudio");
        this.targetAudio.volume = 0.4;
    };
    
    /**
     * Start the audio.
     * @returns {undefined}
     */
    AudioManager.prototype.startAudio = function() {
        this.bgAudio.play();
    };
    
    /**
     * Stop all audio.
     * @returns {undefined}
     */
    AudioManager.prototype.stopAudio = function() {
        this.bgAudio.pause();
        this.bgAudio.currentTime = 0;
    };

    /**
     * Play a circle sound effect.
     * @param {Number} roundScore The current round score.
     * @param {Number} numCircles The number of circles.
     * @returns {undefined}
     */
    AudioManager.prototype.playEffect = function(roundScore, numCircles) {

        if (roundScore === Math.floor(numCircles * Constants.PERCENT_CIRCLES_TO_ADVANCE)) {
            this.targetAudio.src = "media/" + metTargetSound;
            this.targetAudio.play();
            return;
        }

        this.effectAudio.src = "media/" + this.effectSounds[this.currentEffect];
        this.effectAudio.play();

        this.currentEffect = this.currentEffect + this.currentDirection;
        if (this.currentEffect === this.effectSounds.length || this.currentEffect === -1) {
            currentDirection *= -1;
            this.currentEffect = this.currentEffect + this.currentDirection;
        }
    };
    
    return AudioManager;

})();