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
	requires: ['Ext.state.CookieProvider', 'Ext.container.Viewport', 'Ext.layout.container.Border'],
	launch: function() {
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

