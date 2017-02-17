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

var TAG = "Pid_Controller";

var Gaia = require('gaia-js'),
    Logger = Gaia.Logger,
    Utils = Gaia.Utils;

var PidController = module.exports = function PidController(opts) {
	PidController.__super__.constructor.apply(this, arguments);

    this.ITerm = 0;
    this.lastInput = 0;
    this.sampleTime = this.controlTimeInterval / 1000;
    opts = opts || {};
    opts.input = opts.input || 0;
    this.setInput(opts.input);
    opts.setPoint = opts.setPoint || 0;
    this.setSetPoint(opts.setPoint)
    opts.kp = opts.kp || 0;
    opts.ki = opts.ki || 0;
    opts.kd = opts.kd || 0;
    this.setTunings(opts.kp, opts.ki, opts.kd);
    opts.mode = opts.mode || PidController.MANUAL;
    this.setMode(opts.mode);
    opts.limits = opts.limits || {};
    opts.limits.outMax = opts.limits.outMax || 255;
    opts.limits.outMin = opts.limits.outMin || 0;
    this.setLimits(opts.limits.outMin, opts.limits.outMax);
    opts.direction = opts.direction || PidController.DIRECT;
    this.setDirection(opts.direction);
    this.output = 0;
};

Utils.inherit(PidController, Gaia.Controller);

PidController.AUTOMATIC = 0;
PidController.MANUAL = 1;
PidController.DIRECT = 0;
PidController.REVERSE = 1;

PidController.prototype.start = function() {
	this.onComputeCallback = this.onComputeCallback || {};
	PidController.__super__.start.apply(this, arguments);
};

PidController.prototype.control = function() {
	var output = this.compute();
    Logger.debug(TAG, "Output: " + output);
    try {
        this.onComputeCallback(this, output);
    } catch (e) {
        Logger.error(TAG, e);
    }
};

PidController.prototype.compute = function() {
    var input = this.input;
    var error = this.setPoint - input;
    Logger.debug(TAG, "Error: " + error);
    this.ITerm += (this.ki * error);
    this.checkITermValues();
    Logger.debug(TAG, "ITerm: " + this.ITerm);
    var dInput = input - this.lastInput;
    Logger.debug(TAG, "dInput: " + dInput);
    var output = (this.kp * error + this.ITerm - this.kd * dInput) * this.direction;

    if (output > this.outMax) {
        output = this.outMax;
    } else if (output < this.outMin) {
        output = this.outMin;
    }
    this.output = output;
	return this.output;
};

PidController.prototype.onCompute = function(callback) {
	this.onComputeCallback = callback;
};

PidController.prototype.setInput = function(value) {
    this.input = value;
};

PidController.prototype.setSetPoint = function(value) {
    this.setPoint = value;
};

PidController.prototype.setTunings = function(kp, ki, kd) {
    if (kp < 0 || ki < 0 || kd < 0) {
        return;
    }

    this.kp = kp;
    this.ki = ki * this.sampleTime;
    this.kd = kd / this.sampleTime;

    Logger.debug(TAG, "Kp: " + this.kp + " Ki: " + this.ki + " Kd: " + this.kd);
};

PidController.prototype.setMode = function(mode) {
    var newAuto;
    if (mode == PidController.AUTOMATIC) {
        newAuto = 1;
    } else {
        newAuto = 0;
    }

    if (newAuto == !this.inAuto) {
        this.ITerm = this.output;
        this.lastInput = this.input;
        this.checkITermValues();
    }
    this.auto = newAuto;
};

PidController.prototype.setLimits = function(min, max) {
    if (min >= max) {
        min = max;
    }
    this.outMin = min;
    this.outMax = max;
    Logger.debug(TAG, "Setting limits: min-" + this.outMin + " max-" + this.outMax);

    if (this.auto) {
        if (this.output > this.outMax) {
            this.output = this.outMax;
        } else if (this.output < this.outMin) {
            this.output = this.outMin;
        }

        this.checkITermValues();
    }
};

PidController.prototype.checkITermValues = function(direction) {
    if (this.ITerm > this.outMax) {
        this.ITerm = this.outMax;
    } else if (this.ITerm < this.outMin) {
        this.ITerm = this.outMin;
    }
};

PidController.prototype.setDirection = function(direction) {
    if (direction == PidController.DIRECT) {
        this.direction = 1;
    } else {
        this.direction = -1;
    }
};

PidController.prototype.initAttributesAndCommands = function() {
  this.attributes = {
    setpoint: this.setPoint,
    input: this.input,
    output: this.output
    kp: this.kp,
    ki: this.ki,
    kd: this.kd,
    mode: this.auto,
    direcction: this.direcction,
    min_limit: this.outMin,
    max_limit: this.outMax,
  };

  this.commands = {
    set_setpoint: this.setSetPoint,
    set_tunings: this.setTunings,
    set_direction: this.setDirection,
    set_limits: this.setLimits
  };
};