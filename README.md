SdbNavigator
=============

A free and open source webinterface for Amazon SimpleDB
-------

* No server-side scripts needed: do everything from your browser
* Manage domains, Create, Read, Update and Delete
* Manage records, Create, Read, Update and Delete
* Find records using your own queries, or by sorting on properties
* Quickly edit records using a convenient interface
* Convenient interface like PhpMyAdmin. 

Installation
-----------

- Install the original by visiting the chrome store at https://chrome.google.com/webstore/detail/ddhigekdfabonefhiildaiccafacphgg

Usage
-----

To make the data more manageable, SdbNavigator uses a 'virtual schema' for a schema-less database.

* Fire up Google Chrome and the plugin
* Open a new tab
* Sign in for your AWS amazon account at https://aws-portal.amazon.com/gp/aws/developer/account/index.html?action=access-key
* Copy and paste the "Access Key ID" and "Secret Access Key" into the corresponding fields on the plugin-page
* Choose your nearest Region.
* Click connect
* Now choose a domain on the left-hand side, or create a new one.
* Add some properties to the selected domain (if they could not be retrieved by scanning existing records)
* Start adding new records using the defined properties

PLEASE NOTE that your AWS credentials will be stored in a local cookie so don't use this plugin on any public computer.
This free, beta software is released under GPL v3 and comes with absolutely no warranty. Make sure you have backup of
important data before using this software.

Contributing
------------

Get a working local development version of the app

1. Fork it on Github.
2. Clone to your development environment
3. Install submodule (```git submodule init && git submodule update```)
4. Run ```npm install -g grunt-cli```
5. Run ```npm install```
6. Run ```./node_modules/.bin/bower install```
7. Run ```grunt``` (or ```sudo grunt```)
8. Start your chrome with ```--disable-web-security``` and open http://localhost:3080/

When something nice is created:

1. Create a branch (`git checkout -b my_sdbNavigator`)
2. Commit your changes (`git commit -am "Added Shizzle"`)
3. Push to the branch  (`git push origin my_sdbNavigator`)
4. Create an [Issue][1] with a link to your branch
5. Enjoy a beer and wait

[1]: https://github.com/Reggino/SdbNavigator/issues

Build your own version of the plugin
--------

1. Download and install node.js
2. Run "npm install"
3. Run "grunt" to test your app locally 
4. Run "grunt build" to build the plugin version of your source.
5. See http://code.google.com/chrome/extensions/getstarted.html#load for how to install it in Chrome
