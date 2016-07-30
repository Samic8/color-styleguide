#!/usr/bin/env node
var program = require('commander');
var fs = require('fs');

program.arguments('<file>')
	.action(function(file) {
		fs.readFile(file, 'utf8', processFile);
	})
	.parse(process.argv);

function processFile(err, contents) {
	var innerHtml = generateInnerHTML(findColors(contents));
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

function generateInnerHTML(colors) {
	var html;
	colors.forEach((color) => {
		html += `<div class="colorGroup" style="display: inline-block;">
			<div class="colorGroup__color" style="width: 50px; height: 50px; background-color: #${color.hex};"></div>
			<div class="colorGroup__name">${color.name}</div>
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