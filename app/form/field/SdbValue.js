Ext.define('SdbNavigator.form.field.SdbValue', {
	extend: 'Ext.form.field.Picker',
	requires: ['Ext.form.Label', 'Ext.form.field.ComboBox', 'Ext.form.RadioGroup', 'Ext.form.field.Radio',
			'Ext.grid.plugin.CellEditing', 'Ext.grid.column.Action'],
	alias: 'widget.sdbvaluefield',
	matchFieldWidth: false,
	editable: true,
	enableKeyEvents: true,

	triggerCls: 'null-value-trigger',

	initComponent: function () {
		var me = this;
		this.on('keydown', function () {
			if (me.getValue() === null) {
				me.setValue('');
			}
		});
		return this.callParent(arguments);
	},

	createPicker: function () {
		var me = this, data = [], grid, setNewValue;

		if (Ext.isArray(me.value)) {
			Ext.Array.forEach(me.value, function (currentValue) {
				data.push({field1: currentValue});
			});
		}

		setNewValue = function () {
			var fieldValue = [];
			if (grid) {
				grid.getStore().each(function (record) {
					fieldValue.push(record.get('field1'));
				});
				me.value = fieldValue;
				me.inputEl.dom.value = fieldValue.join(',');
			}
		};

		grid = Ext.create('Ext.grid.Panel', {
			title: 'Array values',
			store: {
				data: data,
				fields: ['field1'],
				listeners: {
					datachanged: function (store) {
						setNewValue();
					}
				}
			},
			listeners: {
				'edit': function(editor, e) {
					e.record.commit();
					setNewValue();
				}
			},
			disabled: !Ext.isArray(me.value),
			plugins: [new Ext.grid.plugin.CellEditing({
				clicksToEdit: 1
			})],
			tbar: [{
				text: 'Add value',
				handler: function(){
					grid.getStore().insert(0, { field1: '' });
					grid.getPlugin().startEditByPosition({
						row: 0,
						column: 0
					});
				}
			}],
			columns: [
				{
					text: 'Value',
					dataIndex: 'field1',
					flex: 1,
					editor: {
						xtype: 'textfield'
					}
				},
				{
					xtype: 'actioncolumn',
					width: 30,
					sortable: false,
					menuDisabled: true,
					items: [{
						icon: '/resources/img/icons/delete.png',
						tooltip: 'Delete value',
						scope: this,
						handler: function(grid, rowIndex){
							grid.getStore().removeAt(rowIndex);
						}
					}]
				}
			],
			height: 200
		});

		return Ext.create('Ext.panel.Panel', {
			width: 400,
			floating: true,
			renderTo: Ext.getBody(),
			items:[{
				margin: 4,
				xtype: 'radiogroup',
				fieldLabel: 'Datatype',
				labelWidth: 60,
				items: [
					{ boxLabel: 'Null', name: 'dataType', inputValue: 'null', width: 50 },
					{ boxLabel: 'String', name: 'dataType', inputValue: 'string', checked: true, width: 60 },
					{ boxLabel: 'Array', name: 'dataType', inputValue: 'array' }
				],
				listeners: {
					change: function (radiogroup, newValue) {
						var currentValue = me.getValue();

						switch (newValue.dataType) {
						case 'string':
							me.setValue((Ext.isArray(currentValue) && (currentValue.length > 0))
								? currentValue.shift() : '');
							break;
						case 'null':
							me.setValue(null);
							break;
						case 'array':
							me.setValue(Ext.isString(currentValue) ? [currentValue] : []);
							break;
						}
					}
				}
			}, grid]
		});
	},

	setValue: function (value) {
		var picker, grid, arrayData = [];

		if (Ext.isArray(value)) {
			this.triggerCls = 'array-value-trigger';
			this.setEditable(false);
			Ext.Array.forEach(value, function (currentValue) {
				arrayData.push({field1: currentValue});
			});
		} else {
			this.triggerCls = (Ext.isString(value) ? 'string-value-trigger' : 'null-value-trigger');
			this.setEditable(true);
		}
		if (this.triggerEl) {
			this.triggerEl.removeCls(['string-value-trigger', 'null-value-trigger', 'array-value-trigger']);
			this.triggerEl.addCls(this.triggerCls);
		}
		if (this.isExpanded) {
			picker = this.getPicker();
			grid = picker.down('grid');
			picker.down('[inputValue=' + this.triggerCls.split('-').shift() + ']').setValue(true);
			grid.getStore().loadData(arrayData);
			grid.setDisabled(!Ext.isArray(value));
		}
		return this.callParent(arguments);
	},

	getModelData: function () {
		var result = {};
		result[this.getName()] = this.getValue();
		return result;
	},

	valueToRaw: function (value) {
		if (Ext.isString(value)) {
			return value;
		}
		if (Ext.isArray(value)) {
			return value.join(',');
		}
		return '';
	},

	rawToValue: function (rawValue) {
		if (Ext.isString(this.value)) {
			return rawValue;
		} else {
			return this.value;
		}
	},

	processRawValue: function (rawValue) {
		if (Ext.isString(this.value)) {
			return rawValue;
		} else {
			return this.value
		}
	},

	getErrors: function (value) {
		if (!Ext.isString(value)) {
			return [];
		}
		return this.callParent(arguments);
	}
});