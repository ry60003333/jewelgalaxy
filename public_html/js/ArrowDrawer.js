/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * Arrow drawing utilities; Source code help from
 * http://deepliquid.com/blog/archives/98
 * :)
 * @type Function|ArrowDrawer_L12.ArrowDrawer
 */
"use strict";
window.ArrowDrawer = (function () {

    /**
     * Creates a new ArrowDrawer.
     * @returns {undefined}
     */
    function ArrowDrawer() {

    }
    
    /**
     * The arrow shape constant.
     */
    ArrowDrawer.ARROW_SHAPE = [
        [ 2, 0 ],
        [ -10, -4 ],
        [ -10, 4]
    ];
    
    /**
     * Draw an arrow.
     * @param {Object} ctx The canvas drawing context.
     * @param {String} color The color for the arrow.
     * @param {Number} x1 The first x coordinate.
     * @param {Number} y1 The first y coordinate.
     * @param {Number} x2 The second x coordinate.
     * @param {Number} y2 The second y coordinate.
     * @returns {undefined}
     */
    ArrowDrawer.prototype.drawArrow = function(ctx, color, x1, y1, x2, y2) {
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.stroke();
        
        ctx.fillStyle = color;
        var ang = Math.atan2(y2 - y1, x2 - x1);
        this.drawFilledPolygon(ctx, this.translateShape(this.rotateShape(ArrowDrawer.ARROW_SHAPE, ang), x2, y2));
    };
    
    /**
     * Rotate a shape.
     * @param {Object} shape The shape.
     * @param {Number} angle The angle degree.
     * @returns {Array}
     */
    ArrowDrawer.prototype.rotateShape = function(shape, angle) {
        var rv = [];
        for(var p in shape)
        {
            rv.push(this.rotatePoint(angle, shape[p][0], shape[p][1]));
        }
        return rv;
    };
    
    /**
     * Rotate a point around an angle.
     * @param {Number} angle The angle degree.
     * @param {Number} x The x coordinate.
     * @param {Number} y The y coordinate.
     * @returns {Array}
     */
    ArrowDrawer.prototype.rotatePoint = function(angle, x, y) {
        return [
            (x * Math.cos(angle)) - (y * Math.sin(angle)),
            (x * Math.sin(angle)) + (y * Math.cos(angle))
        ];
    };
    
    /**
     * Translate a shape.
     * @param {Object} shape The shape.
     * @param {Number} x The x delta.
     * @param {Number} y The y delta.
     * @returns {Array}
     */
    ArrowDrawer.prototype.translateShape = function(shape, x, y) {
        var rv = [];
        for(var p in shape)
            rv.push([ shape[p][0] + x, shape[p][1] + y ]);
        return rv;
    };
    
    /**
     * Draw a filled polygon.
     * @param {Object} ctx The canvas drawing context.
     * @param {Object} shape The shape to draw.
     * @returns {undefined}
     */
    ArrowDrawer.prototype.drawFilledPolygon = function(ctx, shape) {
        ctx.beginPath();
        ctx.moveTo(shape[0][0],shape[0][1]);

        for(var p in shape)
        {
            if (p > 0) ctx.lineTo(shape[p][0],shape[p][1]);
        }

        ctx.lineTo(shape[0][0],shape[0][1]);
        ctx.fill();
    };
    
    return ArrowDrawer;

})();