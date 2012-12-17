/*
* A node.js script to build the final SdbNavigator Chrome Plugin. The most important thing is to strip unused files: we
* don't want a bloated plugin!
*
* usage:
* - install node / npm
* - run:
*			npm install wrench -g
*			npm install node-native-zip -g
* - run this script
*
*/
var stdin = process.stdin, wrench = require('wrench'), fs = require('fs');

stdin.resume();
console.log('What is the new build version: ');
stdin.once('data', function(input) {
	var manifest, version = input.toString().trim();
	console.log('Will now build: ' + version + '...');

	wrench.rmdirSyncRecursive('./build', true);
	wrench.mkdirSyncRecursive('./build/extjs/resources/themes/images');
	wrench.mkdirSyncRecursive('./build/extjs/resources/css');
	wrench.copyDirSyncRecursive('./app', './build/app');
	wrench.copyDirSyncRecursive('./extjs/resources/themes/images/default', './build/extjs/resources/themes/images/default');
	wrench.copyDirSyncRecursive('./resources', './build/resources');

	//copy the final files
	fs.writeFileSync('./build/extjs/ext-all.js', fs.readFileSync('./extjs/ext-all.js'));
	fs.writeFileSync('./build/extjs/license.txt', fs.readFileSync('./extjs/license.txt'));
	fs.writeFileSync('./build/extjs/resources/css/ext-all.css', fs.readFileSync('./extjs/resources/css/ext-all.css'));
	fs.writeFileSync('./build/app.js', fs.readFileSync('./app.js'));
	fs.writeFileSync('./build/extension.html', fs.readFileSync('./extension.html'));
	fs.writeFileSync('./build/extension.js', fs.readFileSync('./extension.js'));

	//install production ext.js!
	fs.writeFileSync('./build/index.html', fs.readFileSync('./index.html').toString().replace('ext-dev.js', 'ext-all.js'));

	//make and write the final
	manifest = JSON.parse(fs.readFileSync('./manifest.json'));
	manifest.version = version;
	fs.writeFileSync('./build/manifest.json', JSON.stringify(manifest));

	console.log('All files copied and prepared! Zip and upload the build-folder....');
	setTimeout(function() {
		//make sure we actually see the output message!
		process.exit();
	}, 1000);
});