/*\
created: 20190214160253135
type: application/javascript
title: $:/plugins/kookma/commander/snr/macros/regexpsub.js
modified: 20200307092210323
module-type: macro

Make regular expression substitutions
Developed by Mark S
\*/
(function(){

/*jslint node: true, browser: true */
"use strict";

exports.name = "regexpsub";

exports.params = [
	{name: "searchValue"},
	{name: "replaceValue"},
	{name: "sourceText"},
	{name: "flags"},
  {name: "wholeWords"}
];

/*
Run the macro
*/
exports.run = function(searchValue, replaceValue, sourceText, flags = "gi", wholeWords = "characters") {
  
  try {
  
	var searchText;
    if(wholeWords.toLowerCase() === 'words'){
    searchText = "\\b" + searchValue + "\\b";
    } else{
    searchText = searchValue;
    }
		
    searchText = new RegExp(searchText, flags);
    return sourceText.replace(searchText,replaceValue);

  } 
  catch(err) { 
    return "ERROR IN REG EXPRESSION. YOU MAY NEED TO ESCAPE VALUES"; 
  }
  
  };

})();
