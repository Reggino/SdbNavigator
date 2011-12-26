/*jslint unparam: true, sloppy: true, maxerr: 50, indent: 4 */
/*global Ext:false, SdbNavigator: false */

Ext.define('SdbNavigator.view.SettingsPanel', {
    extend: 'Ext.form.Panel',
	xtype: 'form',
	title: '',
	region: 'north',
	layout: 'hbox',
	itemId: 'settingsPanel',
	height: 70,
	tbar: {
		xtype: 'toolbar',
		items: [
			{
				xtype: 'tbtext',
				text: 'Kingsquare SdbNavigator [beta]'
			}, '-',
			{
				xtype: 'tbtext',
				text: 'Use at your own risk'
			},

			'->', {
				xtype: 'tbtext',
				text: 'Released under GPL license v3'
			}, '-', {
				xtype: 'tbtext',
				text: 'JavaScript framework: <a href="http://www.sencha.com/products/extjs/">ExtJS 4 by Sencha</a>'
			}, '-',	{
				xtype: 'tbtext',
				text: 'Icons: <a target="_blank" href="http://www.famfamfam.com/">Mark James</a>'
			}, '-', {
				xtype: 'tbtext',
				text: 'Development: <a target="_blank" href="http://www.kingsquare.nl/SdbNavigator/">Kingsquare</a>'
			}
		]
	},
	defaults: {
		xtype: 'panel',
		bodyPadding: 4,
		flex: 1,
		layout: 'anchor',
		height: 60
	},
	items: [
		{
			items: [
				{
					xtype: 'label',
					text: 'Access Key',
					forId: 'awsAccessKey'
				},
				{
					id: 'awsAccessKey',
					xtype: 'textfield',
					anchor: '100%',
					allowBlank: false,
					stateful: true,
					stateId: 'awsAccessKey',
					stateEvents: ['change'],
					applyState: function (state) {
						this.setValue(state.value);
					},
					getState: function () {
						return { value: this.getValue() };
					}
				}
			]
		},
		{
			items: [
				{
					xtype: 'label',
					text: 'Secret Key',
					forId: 'awsSecretKey'
				},
				{
					id: 'awsSecretKey',
					xtype: 'textfield',
					inputType: 'password',
					anchor: '100%',
					allowBlank: false,
					stateful: true,
					stateId: 'awsSecretKey',
					stateEvents: ['change'],
					applyState: function (state) {
						this.setValue(state.value);
					},
					getState: function () {
						return { value: this.getValue() };
					}
				}
			]
		},
		{
			items: [
				{
					xtype: 'label',
					text: 'Region'
				},
				{
					xtype: 'combo',
					anchor: '100%',
					store: [
						['sdb.amazonaws.com', 'US-East (Northern Virginia)'],
						['sdb.us-west-1.amazonaws.com', 'US-West (Northern California)'],
						['sdb.us-west-2.amazonaws.com', 'US-West (Oregon)'],
						['sdb.eu-west-1.amazonaws.com', 'EU (Ireland)'],
						['sdb.ap-southeast-1.amazonaws.com', 'Asia Pacific (Singapore)'],
						['sdb.ap-northeast-1.amazonaws.com', 'Asia Pacific (Tokyo)'],
						['sdb.sa-east-1.amazonaws.com', 'South America (Sao Paulo)']
					],
					required: true,
					stateful: true,
					editable: false,
					stateId: 'region',
					id: 'region',
					stateEvents: ['change', 'select'],
					allowBlank: false,
					applyState: function (state) {
						this.setValue(state.value);
					},
					getState: function () {
						return { value: this.getValue() };
					}
				}
			]
		},
		{
			items: [
				{
					xtype: 'label',
					text: 'Default query limit'
				},
				{
					xtype: 'numberfield',
					id: 'defaultQueryLimit',
					anchor: '100%',
					value: 100,
					maxValue: 2500,
					minValue: 1
				}
			]
		},
		{
			bodyPadding: '19 4',
			items: [
				{
					xtype: 'button',
					text: 'Connect',
					anchor: '100%'
				}
			]
		}
	]
});