/*jslint unparam: true, sloppy: true, maxerr: 50, indent: 4 */
/*global Ext:false, SdbNavigator: false */

Ext.define('SdbNavigator.controller.Settings', {
    extend: 'Ext.app.Controller',

	init: function () {
		this.control({
			'#settingsPanel': {
				render: function (settingsPanel) {
					if ((Ext.getCmp('region').getValue() !== '') && (Ext.getCmp('awsAccessKey').getValue() !== '')
							&& (Ext.getCmp('awsSecretKey').getValue() !== '')) {
						this.listDomains(settingsPanel);
					}
				}
			},

			'#settingsPanel button': {
				click: function(button) {
					this.listDomains(button.up('#settingsPanel'));
				}
			}
		});
	},

	listDomains: function (settingsPanel) {
		var domainStore = Ext.StoreManager.lookup('Domains');
		if (settingsPanel.getForm().isValid()) {
			SdbNavigator.SimpleDb.doQuery('GET', {
				Action: 'ListDomains'
			}, function (response) {
				domainStore.removeAll();
				Ext.each(Ext.DomQuery.select('DomainName', response.responseXML), function (xmlNode) {
					domainStore.add({ name: xmlNode.childNodes[0].data });
				});
				Ext.getCmp('domainTreePanel').setDisabled(false);
			});
		}
	}
});

