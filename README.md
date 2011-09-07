SdbNavigator
=============

A free and open source webinterface for Amazon SimpleDB
-------

* No serverside scripts needed: do everything from your browser
* Manage domains, (CR)reate, (U)pdate and (D)elete)
* Manage records, (CR)reate, (U)pdate and (D)elete)
* Find records using your own queries, or by sorting on properties
* Quickly edit records using a convenient interface.


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

Contributing
------------

1. Fork it.
2. Create a branch (`git checkout -b my_sdbNavigator`)
3. Commit your changes (`git commit -am "Added Shizzle"`)
4. Push to the branch  (`git push origin my_sdbNavigator`)
5. Create an [Issue][1] with a link to your branch
6. Enjoy a beer and wait

[1]: https://github.com/Kingsquare/SdbNavigator/issues

Build your own version of the plugin
--------

See http://code.google.com/chrome/extensions/getstarted.html#load and use the source provided
