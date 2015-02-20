/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * Collisons code;
 * Source: https://www.npmjs.com/package/line-circle-collision
 * @type Collisions_L12.Collisions|Function
 */
"use strict";
window.Collisions = (function () {

    /**
     * Creates a new Collisions.
     * @returns {undefined}
     */
    function Collisions() {

    }
    
    /**
     * Check if a point collides with a circle.
     * @param {Object} point The point.
     * @param {Object} circle The circle.
     * @param {Number} r The radius.
     * @returns {Boolean} If a collision has occurred.
     */
    Collisions.pointCircleCollision = function(point, circle, r) {
        if (r===0) return false;
        var dx = circle[0] - point[0];
        var dy = circle[1] - point[1];
        return dx * dx + dy * dy <= r * r;
    };
    
    /**
     * Check if a line and a circle collide.
     * @param {Object} a The first point.
     * @param {Object} b The second point.
     * @param {Object} circle The circle.
     * @param {type} radius The radius.
     * @param {Object} nearest ???
     * @returns {Boolean} If a collision has occurred.
     */
    Collisions.lineCircleCollide = function(a, b, circle, radius, nearest) {
        
        var pointCircleCollide = Collisions.pointCircleCollision;
        
        var tmp = [0, 0];
        
        //check to see if start or end points lie within circle 
        if (pointCircleCollide(a, circle, radius)) {
            if (nearest) {
                nearest[0] = a[0];
                nearest[1] = a[1];
            }
            return true;
        }
        if (pointCircleCollide(b, circle, radius)) {
            if (nearest) {
                nearest[0] = b[0];
                nearest[1] = b[1];
            }
            return true;
        }

        var x1 = a[0],
                y1 = a[1],
                x2 = b[0],
                y2 = b[1],
                cx = circle[0],
                cy = circle[1];

        //vector d
        var dx = x2 - x1;
        var dy = y2 - y1;

        //vector lc
        var lcx = cx - x1;
        var lcy = cy - y1;

        //project lc onto d, resulting in vector p
        var dLen2 = dx * dx + dy * dy; //len2 of d
        var px = dx;
        var py = dy;
        if (dLen2 > 0) {
            var dp = (lcx * dx + lcy * dy) / dLen2;
            px *= dp;
            py *= dp;
        }

        if (!nearest)
            nearest = tmp;
        nearest[0] = x1 + px;
        nearest[1] = y1 + py;

        //len2 of p
        var pLen2 = px * px + py * py;

        //check collision
        return pointCircleCollide(nearest, circle, radius)
                && pLen2 <= dLen2 && (px * dx + py * dy) >= 0;
    };

    
    
    return Collisions;

})();