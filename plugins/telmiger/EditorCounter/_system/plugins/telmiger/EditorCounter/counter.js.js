/*\
title: $:/plugins/telmiger/EditorCounter/counter.js
type: application/javascript
module-type: widget

version: 0.6.3

Count the number of words or characters in a tiddler/field/input string – Autosave while editing

Usage: see the plugin’s readme.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var CounterWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
CounterWidget.prototype = new Widget();

/*
Render this widget into the DOM – reset autosave attributes
*/
CounterWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	// autosave attributes
	this.diffTotal = 0;
	this.saveNow = false;
	// calculate state 
	this.execute();
	if(this.mode == "autosave") {
		// store the number of last saved characters
		this.lastSavedCount = this.currentCount;
		this.diffLastCount = this.currentCount;
	} 
	var textNode = this.document.createTextNode(this.currentCount);
	var domNode = this.document.createElement("span");
	parent.insertBefore(domNode,nextSibling);
	this.renderChildren(domNode,null);
	this.domNodes.push(domNode);
};

/*
Calculate the numbers
*/
CounterWidget.prototype.getLength = function(text) {
	var result = 0;
	switch(this.mode) {
		case "character":
			result = text.length.toString();
			break;
		case "autosave":
			result = text.length.toString();
			// sum up difference since last count
			this.diffTotal += this.checkAutosave(result);
			// check saving limit
			this.saveNow = (this.diffTotal >= this.saveLimit) ? true : false;
			break;
		case "word":
			if(text.match(/\w+/g)) {
				result = text.match(/\w+/g).length.toString();
			} else {
				result = 0;
			}
			break;
		default: // "?!"
			result = "mode undefined";
	}
	return result;
}

/*
Set autosave 
*/
CounterWidget.prototype.checkAutosave = function(textlength) {
	// calculate difference since last count
	this.diffChars = Math.abs(textlength - this.diffLastCount);
	// store text length
	this.diffLastCount = textlength;
	return this.diffChars;
}

/*
Get the colors as an array
*/
CounterWidget.prototype.getColors = function() {
	var color_array1 = this.colors.split(',');
	var i;
	color_array1.sort(function sortfunction(a, b){
		return a.split(':')[1] - b.split(':')[1];
	});
	for(i = 0; i < color_array1.length; i++) {
		this.color_array[i] = color_array1[i].split(':')[0];
		this.count_array[i] = color_array1[i].split(':')[1];
	}
}

/*
Get the numbers
*/
CounterWidget.prototype.getNumber = function() {
	// Count letters or words as appropriate.
	var result = 0;
	if(this.countText) {
		// text supplied as parameter 
		result = this.getLength(this.countText);
	} else {
		var tiddler = this.wiki.getTiddler(this.tiddler);
		var fieldContent = tiddler.getFieldString(this.field);
		if(fieldContent) {
			result = this.getLength(fieldContent);
		} else {
			result = 0;
		}
	}
	return result;
}

/*
Compute the internal state of the widget
*/
CounterWidget.prototype.execute = function() {
	// Get parameters from our attributes
	this.mode = this.getAttribute("mode","character");
	this.saveLimit = this.getAttribute("savelimit",200);
	this.tiddler = this.getAttribute("tiddler",this.getVariable("currentTiddler"));
	this.field = this.getAttribute("field","text");
	this.countText = this.getAttribute("text");
	this.colors = this.getAttribute("colors");
	this.stateTiddler = this.getAttribute("colorState");
	// Count letters or words as appropriate.
	this.currentCount = this.getNumber();
	this.diffChars = 0;
	//Find the color cut-offs, if any.
	if(this.colors) {
		this.color_array = [];
		this.count_array = [];
		var i;
		this.getColors();

		// set the color if the counter is high enough. The color with the largest value that is less than this.currentCount wins.
		for(i = 0; i < this.color_array.length; i++) {
			if(Number(this.currentCount) >= Number(this.count_array[this.color_array.length - 1 - i])) {
				if(this.stateTiddler) {
					this.wiki.setText(this.stateTiddler,"text",undefined,this.color_array[this.color_array.length -1 - i]);
				}
				this.currentCount = '@@color:' + this.color_array[this.color_array.length -1 - i] + ';' 
					+ this.currentCount + '@@';
				break;
			}
			if(this.stateTiddler && i === this.color_array.length-1) {
				this.wiki.setText(this.stateTiddler,"text",undefined,'');
			}
		}
	}
	var parser = this.wiki.parseText("text/vnd.tiddlywiki",this.currentCount,{parseAsInline: true});
	var parseTreeNodes = parser ? parser.tree : [];
	this.makeChildWidgets(parseTreeNodes);
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
CounterWidget.prototype.refresh = function(changedTiddlers) {
	var refreshed = false;
	// Re-execute the filter to get the count
	this.computeAttributes();
	var oldCount = this.currentCount;
	this.execute();
	if(this.currentCount !== oldCount && this.mode !== "autosave") {
		// Regenerate and rerender the widget and replace the existing DOM node
		this.refreshSelf();
		refreshed = true;
	}
	if(this.saveNow) {
		// Trigger an autosave and refresh
		$tw.rootWidget.dispatchEvent({type: "tm-auto-save-wiki"});
		this.refreshSelf();
		refreshed = true;
	} 
	return refreshed;
};

exports["editor-counter"] = CounterWidget;

})();
