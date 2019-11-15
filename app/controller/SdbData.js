/*jslint unparam: true, sloppy: true, maxerr: 50, indent: 4 */
/*global Ext:false, SdbNavigator: false, uuid: false, saveAs: false, S:false */

Ext.define('SdbNavigator.controller.SdbData', {
	extend: 'Ext.app.Controller',
	views: ['SdbDataPanel'],

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
				render: function (grid) {
					grid.getStore().addListener('remove', function (store, record) {
						if (!record.phantom) {
							SdbNavigator.SimpleDb.doQuery('GET', {
								Action: 'DeleteAttributes',
								DomainName: Ext.getCmp('domainTreePanel').getRootNode().findChild('expanded', true).data.text,
								ItemName: record.get('itemName()')
							});
						}
					});
				},
				itemcontextmenu: function (gridview, record, tr, index, event) {
					event.stopEvent();
					rowContextMenu.showAt(event.xy);
				},
				selectionchange: function (selectionModel, selection) {
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
					Ext.Msg.confirm('Are you sure?', 'Are you sure you want to delete the selection?', function (response) {
						if (response === 'yes') {
							Ext.each(Ext.getCmp('sdbDataGrid').getSelectionModel().getSelection(), function (records) {
								Ext.getCmp('sdbDataGrid').getStore().remove(records);
							});
						}
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
					self.runQuery(Ext.getCmp('queryTextArea').getValue());
				}
			},
			'#queryTextArea': {
				keydown: function (textarea, event) {
					if ((event.getKey() === Ext.EventObject.ENTER) && event.shiftKey) {
						self.runQuery(Ext.getCmp('queryTextArea').getValue());
					}
				}
			},
			'#importJsonButton': {
				'click': function () {
					var window = Ext.create('Ext.window.Window', {
						title: 'Import JSON - please paste your (valid) JSON code',
						height: 400,
						width: 400,
						autoShow: true,
						modal: true,
						layout: 'fit',
						items: [{
							xtype: 'textarea',
							id: 'importJsonTextArea'
						}],
						buttons: [
							{
								text: 'Start import',
								listeners: {
									click: function () {
										var domain, inputValue, itemCount = 1, propCount = 1, chunk = {}, chunks = [], importedChunkCount = 0, doImport;

										domain = Ext.getCmp('domainTreePanel').getRootNode().findChild('expanded', true).data.text;
										inputValue = Ext.JSON.decode(Ext.getCmp('importJsonTextArea').getValue(), true);

										if (!Ext.isArray(inputValue)) {
											Ext.Msg.alert('Import failed', 'Please provide a valid, JSON formatted array');
										} else {
											window.setLoading(true);

											// chunk per 25, as stated in the manual
											inputValue.forEach(function (record) {
												if (record['itemName()'] === undefined) {
													record['itemName()'] = uuid.v1();
												}

												propCount = 1;
												Ext.Object.each(record, function (propName, propValue) {
													if (propName === 'itemName()') {
														chunk['Item.' + itemCount + '.ItemName'] = propValue;
													} else {
														chunk['Item.' + itemCount + '.Attribute.' + propCount + '.Name'] = propName;
														chunk['Item.' + itemCount + '.Attribute.' + propCount + '.Value'] = propValue;
														chunk['Item.' + itemCount + '.Attribute.' + propCount + '.Replace'] = true;
														propCount += 1;
													}
												});
												if (++itemCount === 26) {
													chunks.push(chunk);
													chunk = {};
													itemCount = 1;
												}
											});
											if (itemCount > 1) {
												//add the last chunk;
												chunks.push(chunk);
											}

											doImport = function() {
												var chunk;
												if (chunks[importedChunkCount] !== undefined) {
													chunk = chunks[importedChunkCount];
													chunk.DomainName = domain;
													chunk.Action = 'BatchPutAttributes';
													SdbNavigator.SimpleDb.doQuery('GET', chunk, function () {
														importedChunkCount += 1;
														doImport();
													});
												} else {
													window.close();
													self.runQuery(Ext.getCmp('queryTextArea').getValue());
												}
											};
											doImport();
										}
									}
								}
							}
						]
					});
				}
			},

			'#exportButton': {
				click: function (button) {
					button.showMenu();
				}
			},

			'#exportJsonButton': {
				'click': function () {
					var domain = Ext.getCmp('domainTreePanel').getRootNode().findChild('expanded', true).data.text;
					SdbNavigator.SimpleDb.select(Ext.getCmp('queryTextArea').getValue(), function (resultData) {
						const blob = new Blob([Ext.JSON.encode(resultData)], {type: "application/json" });
						const url = URL.createObjectURL(blob);
						chrome.downloads.download({
							url: url
						  });
					});
				}
			},

			'#exportCsvButton': {
				'click': function () {
					var domain = Ext.getCmp('domainTreePanel').getRootNode().findChild('expanded', true).data.text;
					SdbNavigator.SimpleDb.select(Ext.getCmp('queryTextArea').getValue(), function (resultData) {
						//BOM
						var result = ['\ufeff'];
						Ext.Array.forEach(resultData, function (rowData) {
							result.push(S(rowData).toCSV({delimiter: ';'}).s + "\r\n");
						});
						const blob = new Blob(result, {type: "text/csv" });
						const url = URL.createObjectURL(blob);
						chrome.downloads.download({
							url: url
						  });
					});
				}
			}
		});
    },

	runQuery: function (query) {
		var self = this, domainAttributesCounts = {}, queryParts = SdbNavigator.SimpleDb.getQueryParts(query),
			sdbDataGridPanelContainer = Ext.getCmp('sdbDataGridPanelContainer');

		//first get all data from the selected domain to build a fitting store
		SdbNavigator.SimpleDb.select(query, function (resultData) {
			var domainNode, domain, existingColumns, missingColumns, fields, sortData, sortDirection, uniqueId, columns, sorters;

			//we have the data, now get the store up and running!
			//First we need to check if the known columns are sufficient for the result
			domainNode = Ext.getCmp('domainTreePanel').getRootNode().findChild('expanded', true);
			domain = domainNode.data.text;
			existingColumns = ['itemName()'];
			fields = [];
			uniqueId = Ext.id();
			columns = [];
			sorters = [];

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

			Ext.each(existingColumns, function (attribute, index) {
				fields.push({ name: attribute, defaultValue: null });
				columns.push({
					text: attribute,
					dataIndex: attribute,
					id: uniqueId + '_' + index,
					flex: 1,
					editor:  {
						xtype: ((attribute === 'itemName()') ? 'textfield' : 'sdbvaluefield'),
						allowBlank: (attribute !== 'itemName()')
					}
				});
			});

			Ext.getCmp('addRecordButton').setDisabled(columns.length === 1);

			// try to detect the sorting column and direction, so we can highlight it!
			if (!Ext.isEmpty(queryParts.sort)) {
				sortData = queryParts.sort.split(' ');
				sortDirection = sortData.pop();
				sorters.push({
					direction: sortDirection,
					property: SdbNavigator.SimpleDb.unquoteAttribute(sortData.join(' ')),
					sorterFn: function () { return 0; }
				});
			}

			//connect it to the grid view!
			sdbDataGridPanelContainer.removeAll();
			sdbDataGridPanelContainer.add({
				xtype: 'gridpanel',
				id: 'sdbDataGrid',
				store: {
					fields: fields,
					data: resultData,
					proxy:{
						type: 'memory',
						reader: {
							type: 'json',
							idProperty: 'itemName()',
							//http://www.sencha.com/forum/showthread.php?205662
							useSimpleAccessors: true
						}
					},
					remoteSort: true,
					sortOnLoad: false,
					sorters: sorters,
					sort: function (sortOptions) {
						var newQuery;
						if (Ext.isObject(sortOptions)) {
							queryParts.where =  SdbNavigator.SimpleDb.quoteAttribute(sortOptions.property) + ' is not null';
							queryParts.sort = SdbNavigator.SimpleDb.quoteAttribute(sortOptions.property) + ' ' + sortOptions.direction;
							newQuery = SdbNavigator.SimpleDb.mergeQueryParts(queryParts);
							Ext.getCmp('queryTextArea').setValue(newQuery);
							self.runQuery(newQuery);
						}
					}
				},
				columns: columns,
				selModel: Ext.create('Ext.selection.CheckboxModel'),
				plugins: [
					Ext.create('Ext.grid.plugin.RowEditing', {
						clicksToEdit: 2,
						listeners: {
							beforeedit: function (editor, context) {
								this.editor.query('textfield[name="itemName()"]')[0].setDisabled(!context.record.phantom);
							},
							canceledit: function (editor, context) {
								if (context.record.phantom) {
									context.store.remove(context.record);
								}
							},
							edit: function (editor, context) {
								var updateRecord = function (record) {
									var putPropCount = 0, deletePropCount = 0, putParams, deleteParams;

									putParams = {
										DomainName:  domain,
										Action: 'PutAttributes',
										ItemName: record.get('itemName()')
									};
									deleteParams = {
										DomainName: domain,
										Action: 'DeleteAttributes',
										ItemName: record.get('itemName()')
									};
									Ext.Array.forEach(fields, function (field) {
										var propName = field.name;
										if (propName === 'itemName()') {
											return;
										}
										var propValue = record.get(propName);
										var recipientParamConfigObject = ((propValue === null) ? deleteParams : putParams);
										//has it been set to null?
										if (propValue === null) {
											if (context.originalValues[propName] !== null) {
												Ext.Array.each(Ext.Array.from(context.originalValues[propName]), function (originalValue) {
													deletePropCount += 1;
													deleteParams['Attribute.' + deletePropCount + '.Name'] = propName;
													deleteParams['Attribute.' + deletePropCount + '.Value'] = originalValue;
												});
											}
											return;
										}

										Ext.Array.each(Ext.Array.from(propValue), function (singleValue) {
											putPropCount += 1;
											recipientParamConfigObject['Attribute.' + putPropCount + '.Name'] = propName;
											recipientParamConfigObject['Attribute.' + putPropCount + '.Value'] = singleValue;
											recipientParamConfigObject['Attribute.' + putPropCount + '.Replace'] = true;
										});
									});
									if (Ext.Object.getSize(putParams) > 3) {
										SdbNavigator.SimpleDb.doQuery('GET', putParams, function () {
											record.commit();
											record.raw = record.data;
										});
									}
									if (Ext.Object.getSize(deleteParams) > 3) {
										SdbNavigator.SimpleDb.doQuery('GET', deleteParams, function () {
											record.commit();
										});
									}
								};

								if (context.record.phantom) {
									SdbNavigator.SimpleDb.select('select COUNT(*) from ' +  SdbNavigator.SimpleDb.quoteAttribute(domain) + ' where itemName() = ' + SdbNavigator.SimpleDb.quoteValue(context.record.get('itemName()')), function (data) {
										var grid;
										if (parseInt(data[0].Count, 10) === 0) {
											updateRecord(context.record);
										} else {
											grid = Ext.getCmp('sdbDataGrid');
											Ext.Msg.alert('Error', 'A record with this itemName() already exists!', function () {
												grid.getPlugin().startEdit(context.record, 0);
											});
										}
									});
								} else {
									//we will update this existing record
									updateRecord(context.record);
								}
							}
						}
					}),
					'bufferedrenderer'
				]
			});
		});
	}
});