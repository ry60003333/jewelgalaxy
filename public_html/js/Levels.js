/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


"use strict";
window.Levels = (function () {

    /**
     * Creates a new Levels.
     * @returns {undefined}
     */
    function Levels() {

    }
    
    /**
     * The array of levels.
     */
    Levels.LEVELS = [
        // 10
        {
            winMessage: "Okay, maybe I lied.",
            loseMessage: "Why not try again?",
            baseColor: "#19E7FF",
            startRadius: 23, 
            circles: [
                // North Pair
                {
                    x: Constants.CANVAS_WIDTH/2, 
                    y: Constants.CANVAS_HEIGHT/2 - Constants.CANVAS_HEIGHT/3.5,
                    color: "green"
                }, 
                {
                    x: Constants.CANVAS_WIDTH/2, 
                    y: Constants.CANVAS_HEIGHT/2 - Constants.CANVAS_HEIGHT/6
                }, 
                // South Pair
                {
                    x: Constants.CANVAS_WIDTH/2, 
                    y: Constants.CANVAS_HEIGHT/2 + Constants.CANVAS_HEIGHT/3.5,
                    color: "yellow"
                }, 
                {
                    x: Constants.CANVAS_WIDTH/2, 
                    y: Constants.CANVAS_HEIGHT/2 + Constants.CANVAS_HEIGHT/6
                }, 
                // East Pair
                {
                    x: Constants.CANVAS_WIDTH/2 - Constants.CANVAS_WIDTH/4, 
                    y: Constants.CANVAS_HEIGHT/2,
                    color: "red"
                }, 
                {
                    x: Constants.CANVAS_WIDTH/2 - Constants.CANVAS_WIDTH/6, 
                    y: Constants.CANVAS_HEIGHT/2
                }, 
                // West Pair
                {
                    x: Constants.CANVAS_WIDTH/2 + Constants.CANVAS_WIDTH/4, 
                    y: Constants.CANVAS_HEIGHT/2, 
                    color: "blue"
                }, 
                {
                    x: Constants.CANVAS_WIDTH/2 + Constants.CANVAS_WIDTH/6, 
                    y: Constants.CANVAS_HEIGHT/2
                }, 
            ], 
            walls: [
                {
                    x1: Constants.CANVAS_WIDTH/7, 
                    y1: Constants.CANVAS_HEIGHT/2 - Constants.CANVAS_HEIGHT / 8,
                    x2: Constants.CANVAS_WIDTH/2.5, 
                    y2: Constants.CANVAS_HEIGHT/2 - Constants.CANVAS_HEIGHT / 8, 
                    autoReflectX: true, 
                    autoReflectY: true, 
                    autoReflectAll: true
                }, 
                {
                    x1: Constants.CANVAS_WIDTH/7, 
                    y1: Constants.CANVAS_HEIGHT/2 - Constants.CANVAS_HEIGHT / 8,
                    x2: Constants.CANVAS_WIDTH/7, 
                    y2: Constants.CANVAS_HEIGHT - (Constants.CANVAS_HEIGHT/2 - Constants.CANVAS_HEIGHT / 8), 
                    autoReflectX: true
                }, 
                {
                    x1: Constants.CANVAS_WIDTH/2.5, 
                    y1: Constants.CANVAS_HEIGHT/2 - Constants.CANVAS_HEIGHT / 8, 
                    x2: Constants.CANVAS_WIDTH/2.5, 
                    y2: Constants.CANVAS_HEIGHT / 8, 
                    autoReflectX: true, 
                    autoReflectY: true, 
                    autoReflectAll: true
                }, 
                {
                    x1: Constants.CANVAS_WIDTH/2.5, 
                    y1: Constants.CANVAS_HEIGHT / 8, 
                    x2: Constants.CANVAS_WIDTH - (Constants.CANVAS_WIDTH/2.5), 
                    y2: Constants.CANVAS_HEIGHT / 8, 
                    autoReflectY: true
                }
            ]
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
    
    
    return Levels;

})();