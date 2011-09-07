/*jslint unparam: true, sloppy: true, maxerr: 50, indent: 4 */
/*global Ext:false, SdbNavigator: false */

Ext.define('SdbNavigator.controller.Settings', {
    extend: 'Ext.app.Controller',
    views: [ 'SettingsPanel' ],
	init: function () {
		this.control({
			'#settingsPanel': {
				render: function () {
					if ((Ext.getCmp('region').getValue() !== '') && (Ext.getCmp('awsAccessKey').getValue() !== '')
							&& (Ext.getCmp('awsSecretKey').getValue() !== '')) {
						this.listDomains();
					}
				}
			},

			'#settingsPanel button': {
				click: this.listDomains
			}
		});
	},

	listDomains: function () {
		var domainStore = Ext.StoreManager.lookup('Domains');
		if (Ext.getCmp('settingsPanel').getForm().isValid()) {
			domainStore.removeAll();
			SdbNavigator.SimpleDb.doQuery('GET', {
				Action: 'ListDomains'
			}, function (response) {
				Ext.each(Ext.DomQuery.select('DomainName', response.responseXML), function (xmlNode) {
					domainStore.add({ name: xmlNode.childNodes[0].data });
				});
				Ext.getCmp('domainTreePanel').setDisabled(false);
			});
		}
	}
});

