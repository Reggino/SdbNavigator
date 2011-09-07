/*jslint unparam: true, sloppy: true, maxerr: 50, indent: 4 */
/*global Ext:false, SdbNavigator: false */

Ext.define('SdbNavigator.store.Domains', {
    extend: 'Ext.data.Store',
	model: 'SdbNavigator.model.Domain',
	proxy: {
		type: 'memory'
	}
});