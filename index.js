#!/usr/bin/env node
var program = require('commander');
var fs = require('fs');
var sc_color = require("sc-color");

program.arguments('<file>')
	.action(function(file) {
		fs.readFile(file, 'utf8', processFile);
	})
	.parse(process.argv);

function processFile(err, contents) {
	var colors = findColors(contents);
	var sortedColors = sortColors(colors);
	var innerHtml = generateInnerHTML(sortedColors);
	var html = generateOuterHTML(innerHtml);
	writeToFile(html);
}

function findColors(contents) {
	var regex = /\$color-(.*)(?:\:)(?: |)(?:#)(.*)(?:\;)/g;
	var found = [];
	var matches;
	while( matches = regex.exec(contents) ) {
		found.push({
			name: matches[1],
			hex: matches[2],
		});
	}
	return found;
}

function sortColors(colors){
	var sorted = colors.sort(function(colorA, colorB) {
	    return sc_color('#' + colorA.hex).hue() - sc_color('#' + colorB.hex).hue();
	});
	return sorted;
}

function generateInnerHTML(colors) {
	var html = '';
	colors.forEach((color) => {
		html += `<div class="colorGroup" style="display: inline-block;">
			<div class="colorGroup__color" style="width: 50px; height: 50px; background-color: #${color.hex};"></div>
		</div>`;
	});
	return html;
}

function generateOuterHTML(innerHTML) {
	return `
		<html>
			<head></head>
			<body>${innerHTML}</body>
		</html>
	`;
}

function writeToFile(content) {
	fs.writeFile('colors.html', content, (err) => {
		if (err) throw err;
	});
}

var color = require("sc-color");