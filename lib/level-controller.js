/**
 * The MIT License
 *
 * Copyright (c) 2016 Vicente Giner Tendero
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var TAG = "Level_Controller";

var Gaia = require('gaia-js'),
    Logger = Gaia.Logger,
    Utils = Gaia.Utils;

var LevelController = module.exports = function LevelController(opts) {
	LevelController.__super__.constructor.apply(this, arguments);

    opts = opts || {};
    opts.input = opts.input || 0;
    this.setInput(opts.input);
    opts.setPoint = opts.setPoint || 0;
    this.setSetPoint(opts.setPoint)
};

Utils.inherit(LevelController, Gaia.Controller);

LevelController.prototype.control = function() {
    var levelExceed = this.checkLevel();
    Logger.debug(TAG, "Level exceed: " + levelExceed);
    try {
        this.onCheckLevelCallback(this, levelExceed);
    } catch (e) {
        Logger.error(TAG, e);
    }
};

LevelController.prototype.checkLevel = function() {
    return this.input > this.setPoint;
};

LevelController.prototype.onCheckLevel = function(callback) {
    this.onCheckLevelCallback = callback;
};

LevelController.prototype.setInput = function(value) {
    this.input = value;
};

LevelController.prototype.setSetPoint = function(value) {
    this.setPoint = value;
};

LevelController.prototype.initAttributesAndCommands = function() {
  this.attributes = {
    setpoint: this.setPoint,
    input: this.input,
    level_exceded: this.checkLevel()
  };

  this.commands = {
    set_setpoint: this.setSetPoint
  };
};