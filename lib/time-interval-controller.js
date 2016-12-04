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

var TAG = 'Time_Interval_Controller';

var Gaia = require('gaia-js'),
	Logger = Gaia.Logger,
	Utils = Gaia.Utils;

var TimeIntervalController = module.exports = function TimeIntervalController(opts) {
	TimeIntervalController.__super__.constructor.apply(this, arguments);

	opts = opts || {};
	this.baseDate = new Date();
	this.timeIntervals = parseIntervals(opts.intervals, this.baseDate);
	this.inInterval = isInInterval(this.baseDate, this.timeIntervals);
	Logger.debug(TAG, this.startTime);
	Logger.debug(TAG, this.endTime);
	Logger.debug(TAG, this.inInterval);
};

Utils.inherit(TimeIntervalController, Gaia.Controller);

var parseIntervals = function(intervals, baseDate) {
	var parsedIntervals = [];

	for (var i = 0; i < intervals.length; i++) {
		var startTime = parseTimeDate(baseDate, intervals[i].start);
		var endTime = adjustEndTime(startTime, parseTimeDate(baseDate, intervals[i].end));
		parsedIntervals.push({
			startTime: startTime,
			endTime: endTime
		});
	}

	return parsedIntervals;
}

var parseTimeDate = function(baseDate, time) {
	var date = getDateDay(baseDate);
	var timeElements = time.match(/(\d+)(?::(\d\d))?\s*(p?)/);
	date.setHours(parseInt(timeElements[1]) + (timeElements[3] ? 12 : 0) );
	date.setMinutes(parseInt(timeElements[2]) || 0 );
	return date;
};

var getDateDay = function(date) {
	var newDate = new Date(date.getTime());
	newDate.setHours(0);
	newDate.setMinutes(0);
	newDate.setSeconds(0);
	newDate.setMilliseconds(0);
	return newDate;
};

var getDateTime = function(baseDate, date) {
	var newDate = getDateDay(baseDate);
	newDate.setHours(date.getHours());
	newDate.setMinutes(date.getMinutes());
	newDate.setSeconds(date.getSeconds());
	newDate.setMilliseconds(date.getMilliseconds());
	return newDate;
};

var adjustEndTime = function(startTime, endTime) {
	if(endTime.getTime() < startTime.getTime()) {
		endTime.setDate(endTime.getDate()+1);
	}
	return endTime;
};

var isInInterval = function(date, timeIntervals) {
	for (var i = 0; i < timeIntervals.length; i++) {
		if(date.getTime() > timeIntervals[i].startTime.getTime() && date.getTime() < timeIntervals[i].endTime.getTime()) {
			return true;
		}
	}
	return false;
};

TimeIntervalController.prototype.control = function() {
	var date = getDateTime(this.baseDate, new Date());
	var inInterval = isInInterval(date, this.timeIntervals);

	if(this.inInterval != inInterval) {
		Logger.debug(TAG, inInterval);
		this.inInterval = inInterval;
		this.tick();
	}
};

TimeIntervalController.prototype.start = function() {
	TimeIntervalController.__super__.start.apply(this, arguments);
	if(this.isInIntervalCallback) {
		this.isInIntervalCallback(this.inInterval);
	}
};

TimeIntervalController.prototype.tick = function() {
	if(this.onTickCallback) {
		this.onTickCallback(this.inInterval);
	}
};

TimeIntervalController.prototype.isInInterval = function(callback) {
	this.isInIntervalCallback = callback;
};

TimeIntervalController.prototype.onTick = function(callback) {
	this.onTickCallback = callback;
};