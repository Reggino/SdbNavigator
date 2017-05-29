module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-prompt');

	// Project configuration.
	grunt.initConfig({
		prompt: {
			build: {
				options: {
					questions: [{
						config: 'version',
						type: 'input', // list, checkbox, confirm, input, password
						message: 'What is the new build version?',
						default: 0 // default value if nothing is entered
					}]
				}
			}
		},
		connect: {
			server: {
				options: {
					port: 3080,
					keepalive: true
				}
			}
		}
	});

	grunt.registerTask('default', 'Start development server for local testing', ['connect']);
	grunt.registerTask('build', 'Create the Chrome module', [
		'prompt:build',
		'PRIVATE createBuild'
	]);

	grunt.registerTask('PRIVATE createBuild', function() {
		var wrench = require('wrench'), fs = require('fs'), manifest, version;

		version = grunt.config('version');
		console.log('Will now build: ' + version + '...');

		wrench.rmdirSyncRecursive('./build', true);
		wrench.mkdirSyncRecursive('./build/extjs/resources/themes/images');
		wrench.mkdirSyncRecursive('./build/extjs/resources/css');
		wrench.copyDirSyncRecursive('./app', './build/app');
		wrench.copyDirSyncRecursive('./extjs/resources/ext-theme-classic', './build/extjs/resources/ext-theme-classic');
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
};
