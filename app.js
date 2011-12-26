Ext.require(['Ext.state.CookieProvider', 'Ext.form.Label', 'Ext.form.field.ComboBox', 'Ext.data.TreeStore',
		'Ext.container.Viewport', 'Ext.layout.container.Border', 'Ext.form.field.Display',
		'Ext.grid.PagingScroller', 'Ext.data.proxy.LocalStorage', 'Ext.grid.Panel',
		'SdbNavigator.controller.DomainTree', 'SdbNavigator.controller.SdbData', 'SdbNavigator.controller.Settings',
		'Ext.grid.plugin.RowEditing', 'Ext.selection.CheckboxModel', 'SdbNavigator.SimpleDb',
	'SdbNavigator.view.SdbDataPanel', 'SdbNavigator.view.SettingsPanel'
], function () {
	Ext.application({
		id: 'SdbNavigator',
		name: 'SdbNavigator',
		stores: ['Domains'],
		controllers: ['DomainTree', 'SdbData', 'Settings'],
		launch: function() {
			Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));
			Ext.create('Ext.container.Viewport', {
				layout: 'border',
				items: [
					new SdbNavigator.view.SettingsPanel(),
					{
						xtype: 'panel',
						region: 'center',
						layout: 'border',
						items: [
							new SdbNavigator.view.domain.TreePanel(),
							new SdbNavigator.view.SdbDataPanel()
						]
					}
				]
			});
		}
	});
});

