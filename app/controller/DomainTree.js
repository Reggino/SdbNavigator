/*jslint unparam: true, sloppy: true */
/*global Ext:false, SdbNavigator: false */

Ext.define('SdbNavigator.controller.DomainTree', {
	extend: 'Ext.app.Controller',
	models: [ 'Domain' ],
	views: [ 'domain.TreePanel' ],
	stores: ['Domains'],

	init: function () {
		var self = this, domainContextMenu, propertyContextMenu;

		Ext.StoreManager.lookup('Domains').on({
			add: function (store, records) {
				Ext.each(records, function (domain) {
					Ext.getCmp('domainTreePanel').getRootNode().appendChild({
						text: domain.get('name'),
						leaf: false
					});
				});
			},
			remove: function (store, record, index) {
				Ext.getCmp('domainTreePanel').getRootNode().getChildAt(index).remove();
			},
			clear: function () {
				Ext.getCmp('domainTreePanel').getRootNode().removeAll();
			}
		});

		domainContextMenu = new Ext.menu.Menu({
			items: [
				{
					text: 'Delete domain',
					icon: 'resources/img/icons/database_delete.png',
					listeners: {
						click: function () {
							self.deleteDomain();
						}
					}
				}, '-', {
					text: 'Add property',
					icon: 'resources/img/icons/textfield_add.png',
					listeners: {
						click:  function () {
							self.addProperty();
						}
					}
				}
			]
		});

		propertyContextMenu = new Ext.menu.Menu({
			items: [{
				text: 'Delete property',
				icon: 'resources/img/icons/textfield_delete.png',
				listeners: {
					click:  function () {
						self.deleteProperty();
					}
				}
			}]
		});

		this.control({
			'#addDomainButton': {
				click: self.addDomain
			},
			'#deleteDomainButton': {
				click: function () {
					self.deleteDomain();
				}
			},

			'treepanel': {
				'itemcontextmenu': function (view, node, item, index, event) {
					event.stopEvent();
					if (node.isLeaf()) {
						propertyContextMenu.showAt(event.xy);
					} else {
						domainContextMenu.showAt(event.xy);
					}
				},
				'itemexpand': function (node) {
					if (node.childNodes.length === 0) {
						self.attributeScan(node);
					} else {
						self.initDomain(node);
					}
				},
				'selectionchange': function (treepanel, selections) {
					Ext.getCmp('deleteDomainButton').setDisabled(true);
					if (Ext.isDefined(selections[0]) && !selections[0].isLeaf()) {
						Ext.getCmp('deleteDomainButton').setDisabled(false);
						selections[0].expand();
					}
				}
			}
		});
		this.callParent(arguments);
	},

	attributeScan: function (domainNode) {
		// get the columns of a domain as suggested
		// http://stackoverflow.com/questions/2772644/amazon-simpledb-is-there-a-way-to-list-all-attributes-in-a-domain
		var self = this, attributeNames = [], domain = domainNode.data.text;
		Ext.getCmp('centerPanel').setDisabled(false);
		SdbNavigator.SimpleDb.select('select COUNT(*) from ' + SdbNavigator.SimpleDb.quoteAttribute(domain), function (response) {
			var domainCount = parseInt(response[0].Count, 10), avgSkipCount = domainCount / 2500, processedCount = 0, nextToken = null, scan = function () {
				var countRequestParams = {
					Action: 'Select',
					SelectExpression: 'select count(*) from ' + SdbNavigator.SimpleDb.quoteAttribute(domain) + ' limit ' + Math.ceil((Math.random() * avgSkipCount * 2))
				};
				if (!Ext.isEmpty(nextToken)) {
					countRequestParams.NextToken = nextToken;
				}
				SdbNavigator.SimpleDb.doQuery(
					'GET',
					countRequestParams,
					function (response) {
						var getPropertiesRequestParams, nextToken = Ext.DomQuery.selectValue('NextToken', response.responseXML);

						getPropertiesRequestParams = {
							Action: 'Select',
							SelectExpression: 'select * from ' + SdbNavigator.SimpleDb.quoteAttribute(domain) + ' limit 1'
						};
						if (!Ext.isEmpty(nextToken)) {
							getPropertiesRequestParams.NextToken = nextToken;
						}
						processedCount += Ext.DomQuery.selectNumber('Count', response.responseXML);
						SdbNavigator.SimpleDb.doQuery(
							'GET',
							getPropertiesRequestParams,
							function (response) {
								nextToken = Ext.DomQuery.selectValue('NextToken', response.responseXML);
								Ext.each(Ext.DomQuery.select('Attribute Name', response.responseXML), function (node) {
									attributeNames.push(node.firstChild.nodeValue);
								});
								if (domainCount > processedCount) {
									Ext.each(attributeNames, function (attributeName) {
										domainNode.appendChild({ text: attributeName, leaf: true });
									});
									//scanning is done! start filling the grid
									self.initDomain(domainNode);
								} else {
									scan();
								}
							}
						);
					}
				);
			};
			if (domainCount === 0) {
				self.initDomain(domainNode);
			} else {
				scan();
			}
		});
	},

	initDomain: function (domainNode) {
		Ext.getCmp('queryTextarea').setValue('select * from ' + SdbNavigator.SimpleDb.quoteAttribute(domainNode.data.text) + ' limit ' + Ext.getCmp('defaultQueryLimit').getValue());
		this.getController('SdbData').runQuery(Ext.getCmp('queryTextarea').getValue());
		Ext.getCmp('centerPanel').setDisabled(false);
		Ext.getCmp('deleteRecordButton').setDisabled(true);
	},

	addDomain: function () {
		var domainStore = Ext.StoreManager.lookup('Domains');
		Ext.Msg.prompt('New domain', 'Please enter the new domain name:', function (btn, text) {
			if (btn === 'ok') {
				text = Ext.String.trim(text);
				if (Ext.isEmpty(domainStore.findRecord('name', text, 0, false, true, true))) {
					SdbNavigator.SimpleDb.doQuery('GET', {
						Action: 'CreateDomain',
						DomainName: text
					}, function () {
						domainStore.add(new SdbNavigator.model.Domain({name: text}));
						Ext.getCmp('domainTreePanel').selectPath('/Root/' + text, 'text');
					});
				} else {
					Ext.Msg.alert('Domain already exists', 'Domain not added');
				}
			}
		});
	},

	deleteDomain: function () {
		var toBeDeletedNode = Ext.getCmp('domainTreePanel').getSelectionModel().getSelection()[0];

		Ext.Msg.confirm('Warning', 'Are you sure you want to delete the domain "' + toBeDeletedNode.data.text
			+ '"? This operation can not be undone!', function (answer) {
				if (answer === 'yes') {
					SdbNavigator.SimpleDb.doQuery('GET', {
						Action: 'DeleteDomain',
						DomainName: toBeDeletedNode.data.text
					}, function () {
						var domainStore = Ext.StoreManager.lookup('Domains');
						domainStore.remove(domainStore.findRecord('name', toBeDeletedNode.data.text));
						Ext.getCmp('centerPanel').setDisabled(true);
					});
				}
			});
	},

	addProperty: function () {
		var self = this;
		Ext.Msg.prompt('New property', 'Please enter the new property name:', function (btn, text) {
			var domainNode = Ext.getCmp('domainTreePanel').getRootNode().findChild('expanded', true);
			text = Ext.String.trim(text);
			if (btn === 'ok') {
				if (Ext.isEmpty(domainNode.findChild('text', text))) {
					domainNode.appendChild({ text: text, leaf: true });
					self.initDomain(domainNode);
				} else {
					Ext.Msg.alert('Property already exists', 'Property not added');
				}
			}
		});
	},

	deleteProperty: function () {
		var self = this, domainNode =  Ext.getCmp('domainTreePanel').getRootNode().findChild('expanded', true),
			toBeDeletedNode = Ext.getCmp('domainTreePanel').getSelectionModel().getSelection()[0],
			propertyName = toBeDeletedNode.data.text;
		Ext.Msg.confirm('Warning', 'Are you sure you want to delete the property "' + propertyName
				+ '"? This operation can not be undone!', function (answer) {
				if (answer === 'yes') {
					SdbNavigator.SimpleDb.select('select itemName() from ' +  SdbNavigator.SimpleDb.quoteAttribute(domainNode.data.text) + ' where ' + SdbNavigator.SimpleDb.quoteAttribute(propertyName) + ' is not null', function (results) {
							//done gathering, start deleting properties
						Ext.each(results, function (result) {
							SdbNavigator.SimpleDb.doQuery('GET', {
								Action: 'DeleteAttributes',
								DomainName: domainNode.data.text,
								ItemName: result['itemName()'],
								'Attribute.1.Name': propertyName
							}, function () {
								//rerun the last query to reset the grid
								self.getController('SdbData').runQuery(Ext.getCmp('queryTextarea').getValue());
							});
						});
					});
					toBeDeletedNode.remove();
				}
			});
	}
});