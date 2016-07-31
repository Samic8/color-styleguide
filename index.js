#!/usr/bin/env node
var program = require('commander');
var fs = require('fs');
var sc_color = require("sc-color");
var Handlebars = require('handlebars');
var path = require('path');
var appPath = path.dirname(require.main.filename);

program.arguments('<file>')
	.action(function(file) {
		fs.readFile(file, 'utf8', processFile);
	})
	.parse(process.argv);

function processFile(err, contents) {
	var colors = findColors(contents);
	var sortedColors = sortColors(colors);
	var data = { 
		colors: sortedColors,
		appPath: appPath
	};
	var html = generateHTML(data);
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

function generateHTML(data) {
	var filePath = appPath + '/template.html';
	var contents = fs.readFileSync(filePath, 'utf8')
	var template = Handlebars.compile(contents);
	return template(data);
}

function writeToFile(content) {
	fs.writeFile('colors.html', content, (err) => {
		if (err) throw err;
	});
}