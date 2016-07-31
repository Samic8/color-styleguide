#!/usr/bin/env node
var program = require('commander');
var fs = require('fs');
var sc_color = require("sc-color");
var Handlebars = require('handlebars');
var glob = require('glob');
var path = require('path');
var appPath = path.dirname(require.main.filename);

program.arguments('<file> [sassPath]')
	.action(function(file, sassPath) {
		var contents = fs.readFileSync(file, 'utf8', processFile);
		processFile(contents, sassPath);
	})
	.parse(process.argv);

function processFile(contents, sassPath) {
	var colors = findColors(contents);
	var sortedColors = sortColors(colors);
	appendHexCountData(sortedColors, sassPath);
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

function sortColors(colors) {
	var sorted = colors.sort(function(colorA, colorB) {
	    return sc_color('#' + colorA.hex).hue() - sc_color('#' + colorB.hex).hue();
	});
	return sorted;
}

function appendHexCountData(sortedColors, sassPath) {
	var allHexCodes = findAllHexCode(sassPath);
	sortedColors.forEach(function (sortedColor) {
		sortedColor.count = allHexCodes[sortedColor.hex].count;
	});
}

function findAllHexCode(sassPath) {
	var scssFiles = glob.sync(sassPath + "/**/*.scss", {});
	var regex = /(?:#)(.*)(?:\;)/g;
	var found = {};
	scssFiles.forEach(function (scssFile) {
		var scssContents = fs.readFileSync(scssFile, 'utf8');
		var matches;
		while( matches = regex.exec(scssContents) ) {
			var colorobject = found[matches[1]];
			if (colorobject) {
				colorobject.count++;
			} else {
				found[matches[1]] = {count: 1};
			}
		}
	});
	return found;
}

function generateHTML(data) {
	var filePath = appPath + '/template.html';
	var contents = fs.readFileSync(filePath, 'utf8')
	var template = Handlebars.compile(contents);
	return template(data);
}

function writeToFile(content) {
	fs.writeFile('colors.html', content, function (err) {
		if (err) throw err;
	});
}