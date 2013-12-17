/*jshint strict: false */
/*global Ext: false */

Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'Ext': 'extjs/src',
		'SdbNavigator': 'app'
	}
	//		, disableCaching: false //http://www.sencha.com/forum/showthread.php?132733-Debugging-seem-to-lose-breakpoints
});

Ext.application({
	id: 'SdbNavigator',
	name: 'SdbNavigator',
	controllers: ['DomainTree', 'SdbData', 'Settings'],
	requires: ['Ext.state.CookieProvider', 'Ext.container.Viewport', 'Ext.layout.container.Border', 'Ext.menu.Menu',
			'Ext.button.Split'],
	launch: function() {

		//http://www.sencha.com/forum/showthread.php?264529-4.2.1-Ext.grid.RowEditor-onFieldChanged()-No-Longer-Call
		Ext.override(Ext.grid.RowEditor,{
			addFieldsForColumn: function(column, initial) {
				var me = this,
					i,
					length, field;

				if (Ext.isArray(column)) {
					for (i = 0, length = column.length; i < length; i++) {
						me.addFieldsForColumn(column[i], initial);
					}
					return;
				}

				if (column.getEditor) {
					field = column.getEditor(null, {
						xtype: 'displayfield',
						getModelData: function() {
							return null;
						}
					});
					if (column.align === 'right') {
						field.fieldStyle = 'text-align:right';
					}

					if (column.xtype === 'actioncolumn') {
						field.fieldCls += ' ' + Ext.baseCSSPrefix + 'form-action-col-field';
					}

					if (me.isVisible() && me.context) {
						if (field.is('displayfield')) {
							me.renderColumnData(field, me.context.record, column);
						} else {
							field.suspendEvents();
							field.setValue(me.context.record.get(column.dataIndex));
							field.resumeEvents();
						}
					}
					if (column.hidden) {
						me.onColumnHide(column);
					} else if (column.rendered && !initial) {
						me.onColumnShow(column);
					}

					// -- start edit
					me.mon(field, 'change', me.onFieldChange, me);
					// -- end edit
				}
			}
		});


		Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));
		Ext.create('Ext.container.Viewport', {
			layout: 'border',
			items: [
				Ext.create('SdbNavigator.view.SettingsPanel'),
				{
					xtype: 'panel',
					region: 'center',
					layout: 'border',
					items: [
						Ext.create('SdbNavigator.view.domain.TreePanel'),
						Ext.create('SdbNavigator.view.SdbDataPanel')
					]
				}
			]
		});
	}
});

