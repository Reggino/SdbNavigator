Ext.define('SdbNavigator.view.domain.TreePanel' ,{
    extend: 'Ext.tree.Panel',
	id: 'domainTreePanel',
	region: 'west',
	width: 230,
	rootVisible: false,
	disabled: true,
	singleExpand: true,
	tbar: [
		{ xtype: 'button', id: 'addDomainButton', text: 'Add domain', icon: 'resources/img/icons/database_add.png'  },
		{ xtype: 'button', id: 'deleteDomainButton', disabled: true, text: 'Delete domain', icon: 'resources/img/icons/database_delete.png'  }
	],
	split: true
});