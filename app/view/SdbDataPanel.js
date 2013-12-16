/*jslint unparam: true, sloppy: true, maxerr: 50, indent: 4 */
/*global Ext:false, SdbNavigator: false */

Ext.define('SdbNavigator.view.SdbDataPanel', {
    extend: 'Ext.panel.Panel',
	requires: ['SdbNavigator.form.field.SdbValue', 'Ext.grid.plugin.RowEditing', 'Ext.grid.Panel', 'Ext.menu.Menu'],
	alias: 'widget.sdbdatapanel',

	layout: 'border',
	region: 'center',
	id: 'centerPanel',
	disabled: true,
	items: [
		{
			xtype: 'form',
			region: 'north',
			layout: 'fit',
			split: true,
			height: 70,
			items: [
				{
					id: 'queryTextarea',
					xtype: 'textarea'
				}
			],
			tbar: {
				xtype: 'toolbar',
				items: [
					{
						xtype: 'button',
						id: 'runQueryButton',
						text: 'Run query',
						icon: 'resources/img/icons/database_lightning.png'
					}
				]
			}
		},
		{
			region: 'center',
			id: 'sdbDataGridPanelContainer',
			layout: 'fit',
			tbar: [
				{ xtype: 'button', id: 'addRecordButton', text: 'Add record', icon: 'resources/img/icons/table_row_insert.png' },
				{ xtype: 'button', id: 'deleteRecordButton', text: 'Delete record', icon: 'resources/img/icons/table_row_delete.png' },
				'|',
				{ xtype: 'button', id: 'addPropertyButton', text: 'Add property', icon: 'resources/img/icons/textfield_add.png' },
				'->',
				{
					xtype: 'button',
					id: 'importJsonButton',
					text: 'Import JSON',
					icon: 'resources/img/icons/database_gear.png'
				},
				{
					xtype: 'splitbutton',
					itemId: 'exportButton',
					text: 'Export',
					icon: 'resources/img/icons/database_save.png',
					menu: Ext.create('Ext.menu.Menu', {
						items: [
							// these will render as dropdown menu items when the arrow is clicked:
							{ text: 'JSON', id: 'exportJsonButton' },
							{ text: 'CSV', id: 'exportCsvButton' }
						]
					})
				}
			]
		}
	]
});