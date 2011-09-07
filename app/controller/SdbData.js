/*jslint unparam: true, sloppy: true, maxerr: 50, indent: 4 */
/*global Ext:false, SdbNavigator: false */

Ext.define('SdbNavigator.controller.SdbData', {
	extend: 'Ext.app.Controller',
	views: [ 'SdbDataPanel' ],

	init: function () {
		var self = this, rowContextMenu;

		rowContextMenu = new Ext.menu.Menu({
			items: [{
				text: 'Edit record',
				icon: 'resources/img/icons/table_edit.png',
				listeners: {
					click: function () {
						Ext.getCmp('sdbDataGrid').getPlugin().startEdit(Ext.getCmp('sdbDataGrid').getSelectionModel().getSelection()[0], 0);
					}
				}
			}]
		});

		this.control({
			'#sdbDataGrid': {
				itemcontextmenu: function (gridview, record, tr, index, event) {
					event.stopEvent();
					rowContextMenu.showAt(event.xy);
				},
				'selectionchange': function (selectionModel, selection) {
					Ext.getCmp('deleteRecordButton').setDisabled(selection.length === 0);
				}
			},
			'#addRecordButton': {
				'click': function () {
					var grid = Ext.getCmp('sdbDataGrid'), store = grid.getStore(), record = {};
					store.insert(0, record);
					grid.getPlugin().startEdit(store.getAt(0), 0);
				}
			},
			'#deleteRecordButton': {
				'click': function () {
					Ext.each(Ext.getCmp('sdbDataGrid').getSelectionModel().getSelection(), function (record) {
						Ext.getCmp('sdbDataGrid').getStore().remove(record);
					});
				}
			},
			'#addPropertyButton': {
				'click': function () {
					self.getController('DomainTree').addProperty();
				}
			},
			'#runQueryButton': {
				'click': function () {
					self.runQuery(Ext.getCmp('queryTextarea').getValue());
				}
			}
		});
    },

	runQuery: function (query) {
		var self = this, domainAttributesCounts = {}, queryParts = SdbNavigator.SimpleDb.getQueryParts(query),
			sdbDataGridPanelContainer = Ext.getCmp('sdbDataGridPanelContainer');

		//first get all data from the selected domain to build a fitting store
		SdbNavigator.SimpleDb.select(query, function (resultData) {
			//domainAttributesCounts['itemName()']++;
			//we have the data, now get the store up and running!
			//First we need to check if the known columns are sufficient for the result
			var domainNode = Ext.getCmp('domainTreePanel').getRootNode().findChild('expanded', true), domain = domainNode.data.text,
				existingColumns = ['itemName()'], missingColumns = null, fields = [], columns = [],	sortData, sortDirection, columnHeader;

			Ext.each(resultData, function (record) {
				Ext.each(Ext.Object.getKeys(record), function (recordProperty) {
					if (typeof domainAttributesCounts[recordProperty] === 'undefined') {
						domainAttributesCounts[recordProperty] = 0;
					}
					domainAttributesCounts[recordProperty] += 1;
				});
			});

			Ext.each(domainNode.childNodes, function (node) {
				existingColumns.push(node.data.text);
			});

			missingColumns = Ext.Array.difference(Ext.Object.getKeys(domainAttributesCounts), existingColumns);
			Ext.each(missingColumns, function (missingColumn) {
				domainNode.appendChild({ text: missingColumn, leaf: true });
				existingColumns.push(missingColumn);
			});

			Ext.each(existingColumns, function (attribute) {
				fields.push({name: attribute,  type: 'string'});
				columns.push({
					text: attribute,
					dataIndex: attribute,
					flex: 1,
					editable: false,
					editor:  {
						xtype: 'textfield',
						editable: false,
						allowBlank: (attribute !== 'itemName()')
					}
				});
			});

			Ext.getCmp('addRecordButton').setDisabled(columns.length === 1);

			//connect it to the grid view!
			sdbDataGridPanelContainer.removeAll();
			sdbDataGridPanelContainer.add({
				xtype: 'gridpanel',
				id: 'sdbDataGrid',
				store: new Ext.data.Store({
					'fields': fields,
					data: resultData,
					proxy: 'memory',
					sort: function (sortOptions) {
						var newQuery;
						if (Ext.isObject(sortOptions)) {
							queryParts.where =  SdbNavigator.SimpleDb.quoteAttribute(sortOptions.property) + ' is not null';
							queryParts.sort = SdbNavigator.SimpleDb.quoteAttribute(sortOptions.property) + ' ' + sortOptions.direction;
							newQuery = SdbNavigator.SimpleDb.mergeQueryParts(queryParts);
							Ext.getCmp('queryTextarea').setValue(newQuery);
							self.runQuery(newQuery);
						} else {
							return false;
						}
					}
				}),
				'columns': columns,
				selModel: new Ext.selection.CheckboxModel(),
				plugins: [
					new Ext.grid.plugin.RowEditing({
						clicksToEdit: 2,
						listeners: {
							beforeedit: function (context) {
								this.editor.query('textfield[name="itemName()"]')[0].setDisabled(!Ext.isEmpty(context.record.data.name));
							},
							edit: function (context) {
								var updateRecord = function (record) {
									var propCount = 1, params = {
										DomainName:  domain,
										Action: 'PutAttributes',
										ItemName: record.get('itemName()')
									};
									Ext.Object.each(record.data, function (propName, propValue) {
										if (propName !== 'itemName()') {
											params['Attribute.' + propCount + '.Name'] = propName;
											params['Attribute.' + propCount + '.Value'] = propValue;
											propCount += 1;
										}
									});
									SdbNavigator.SimpleDb.doQuery('GET', params, function () {
										record.commit();
									});
								};

								if (Ext.isEmpty(context.record.raw)) {
									SdbNavigator.SimpleDb.select('select COUNT(*) from ' +  SdbNavigator.SimpleDb.quoteAttribute(domain) + ' where itemName() = ' + SdbNavigator.SimpleDb.quoteValue(context.record.get('itemName()')), function (data) {
										if (parseInt(data[0].Count, 10) === 0) {
											updateRecord(context.record);
										} else {
											Ext.Msg.alert('Error', 'A record with this itemName() already exists!');
										}
									});
								} else {
									//we will update this existing record
									updateRecord(context.record);
								}
							}
						},
						errorSummary: false
					})
				]
			});

			// try to detect the sorting column and direction, so we can highlight it!
			if (!Ext.isEmpty(queryParts.sort)) {
				sortData = queryParts.sort.split(' ');
				sortDirection = sortData.pop();
				columnHeader = sdbDataGridPanelContainer.query('gridcolumn[dataIndex=' +  SdbNavigator.SimpleDb.unquoteAttribute(sortData.join(' ')) + ']');
				if (!Ext.isEmpty(columnHeader)) {
					columnHeader[0].setSortState(sortDirection, false, true);
				}
			}
		});
	}
});