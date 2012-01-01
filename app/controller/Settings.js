/*jslint unparam: true, sloppy: true, maxerr: 50, indent: 4 */
/*global Ext:false, SdbNavigator: false */

Ext.define('SdbNavigator.controller.Settings', {
    extend: 'Ext.app.Controller',
	views: ['SettingsPanel'],

	init: function () {
		this.control({
			'#settingsPanel': {
				afterrender: function (settingsPanel) {
					if ((Ext.getCmp('region').getValue() !== '') && (Ext.getCmp('awsAccessKey').getValue() !== '')
							&& (Ext.getCmp('awsSecretKey').getValue() !== '')) {
						this.listDomains(settingsPanel);
					}
				}
			},

			'#settingsPanel #connectButton': {
				click: function(button) {
					this.listDomains(button.up('#settingsPanel'));
				}
			},

			'#settingsPanel #infoButton': {
				click: function (button) {
					Ext.Msg.alert('More information', '<h2>How to use this:</h2>' +
							'<ul>' +
							'<li>- Create or login to your account at Amazon</li>' +
							'<li>- Copy and paste your <a target="_blank" href="https://aws-portal.amazon.com/gp/aws/developer/account/index.html?action=access-key">security credentials</a> from the Amazon dashboard into the corresponding fields</li>' +
							'<li>- Select the region near you or the one you\'ld like to work in</li>' +
							'<li>- Create or select a \'domain\' (see <a href="http://aws.amazon.com/documentation/simpledb/" target="_blank">SimpleDB documentation</a> for more info on that)</li>' +
							'<li>- Create a new property if the one you are looking for is not in the table-view</li>' +
							'<li>- Have fun</li>' +
							'</ul>' +
							'<br/>' +
							'<h2>Released under GPL license v3</h2>' +
							'<p>JavaScript framework: <a href="http://www.sencha.com/products/extjs/">ExtJS 4 by Sencha</a></p>' +
							'<p>Icons: <a target="_blank" href="http://www.famfamfam.com/">Mark James</a></p>' +
							'<p>Development and idea: <a target="_blank" href="http://www.kingsquare.nl/SdbNavigator/">Kingsquare</a></p>' +
							'<br/>' +
							'<p>Feedback, bugs, suggestions or feature requests? Please leave them at <a href="https://github.com/Kingsquare/SdbNavigator/issues">Github</a> or send a \'pull request\' for your improvement.'
					);
				}
			}
		});
	},

	listDomains: function (settingsPanel) {
		var domainStore = Ext.StoreManager.lookup('Domains'), params = {
			Action: 'ListDomains'
		}, doList =  function () {
			SdbNavigator.SimpleDb.doQuery('GET', params, function (response) {
				Ext.each(Ext.DomQuery.select('DomainName', response.responseXML), function (xmlNode) {
					domainStore.add({ name: xmlNode.childNodes[0].data });
				});
				params.NextToken = Ext.DomQuery.selectValue('NextToken', response.responseXML);
				if (!Ext.isEmpty(params.NextToken)) {
					doList();
				} else {
					Ext.getCmp('domainTreePanel').setDisabled(false);
				}
			});
		};
		if (settingsPanel.getForm().isValid()) {
			domainStore.removeAll();
			doList();
		}
	}
});

