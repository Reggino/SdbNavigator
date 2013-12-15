/*jslint unparam: true, sloppy: true, maxerr: 50, indent: 4 */
/*global Ext:false, SdbNavigator: false */

Ext.define('SdbNavigator.view.SettingsPanel', {
    extend: 'Ext.form.Panel',
	title: '',
	region: 'north',
	layout: 'hbox',
	itemId: 'settingsPanel',
	height: 72,
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
				text: '<b>Box usage:</b>'
			}, {
				xtype: 'tbtext',
				text: '0.0000000000',
				id: 'boxUsageValue',
				width: 66
			}, '-', {
				xtype: 'tbtext',
				text: '<b>Total:</b>'
			}, {
				xtype: 'tbtext',
				text: '0.0000000000',
				id: 'boxUsageValueTotal',
				width: 66
			}, '-',	{
				itemId: 'infoButton',
				xtype: 'button',
				icon: 'resources/img/icons/information.png'
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
						['sdb.ap-southeast-2.amazonaws.com', 'Asia Pacific (Sydney)'],
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
					anchor: '100%',
					itemId: 'connectButton'
				}
			]
		}
	]
});