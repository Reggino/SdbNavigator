/*jslint unparam: true, sloppy: true */
/*global Ext:false, SdbNavigator: false, AWSV2Signer: false */

Ext.define('SdbNavigator.SimpleDb', {
	singleton: true,
	boxUsage: 0.0,

	getQueryParts: function (query) {
		// select output_list from domain_name [where expression] [sort_instructions] [limit limit]
		var queryParts = {}, queryAnalysis = new RegExp('^select (.*) from (.*?)( where (.*?))?( order by (.*?))?( limit (.*?))?$', 'i').exec(Ext.String.trim(query));
		if (Ext.isEmpty(queryAnalysis)) {
			Ext.Error.raise({
				msg: 'Invalid query!',
				debug: Ext.String.trim(query)
			});
		} else {
			queryParts.select = queryAnalysis[1];
			queryParts.from = queryAnalysis[2];
			if (Ext.isDefined(queryAnalysis[4])) {
				queryParts.where = queryAnalysis[4];
			}
			if (Ext.isDefined(queryAnalysis[6])) {
				queryParts.sort = queryAnalysis[6];
			}
			if (Ext.isDefined(queryAnalysis[8])) {
				queryParts.limit = queryAnalysis[8];
			}
			return queryParts;
		}
	},

	mergeQueryParts: function (queryParts) {
		var result = 'select ' + queryParts.select + ' from ' + queryParts.from;
		if (Ext.isDefined(queryParts.where)) {
			result += ' where ' + queryParts.where;
		}
		if (Ext.isDefined(queryParts.sort)) {
			result += ' order by ' + queryParts.sort;
		}
		if (Ext.isDefined(queryParts.limit)) {
			result += ' limit ' + queryParts.limit;
		}
		return result;
	},

	quoteAttribute: function (attributeName) {
		return (attributeName === 'itemName()') ? attributeName : '`' + attributeName.replace('`', '``') + '`';
	},

	unquoteAttribute: function (attributeName) {
		var attributeAnalysis = new RegExp('^`(.*)`$').exec(attributeName);
		if (Ext.isEmpty(attributeAnalysis)) {
			return attributeName;
		} else {
			return attributeAnalysis[1].replace('``', '`');
		}
	},

	quoteValue: function (value) {
		return "'"  + value.replace("'", "''") + "'";
	},

	select: function (query, callback) {
		var self = this, resultData = [], queryParts = this.getQueryParts(query), queryLimit = -1, params = { Action: 'Select', SelectExpression: query }, doSelect;

		if (Ext.isDefined(queryParts.limit)) {
			queryLimit = parseInt(queryParts.limit, 10);
		}

		doSelect = function () {
			self.doQuery('GET', params, function (response) {
				Ext.each(Ext.DomQuery.select('SelectResult Item', response.responseXML), function (node) {
					var result = {}, attributeNode = node.firstChild, attributeValueNode;
					result['itemName()'] = attributeNode.firstChild.nodeValue;
					attributeNode = attributeNode.nextSibling;
					while (attributeNode !== null) {
						attributeValueNode =  attributeNode.childNodes[1].firstChild;
						result[attributeNode.childNodes[0].firstChild.nodeValue] = (Ext.isEmpty(attributeValueNode) ? '' : attributeValueNode.nodeValue);
						attributeNode = attributeNode.nextSibling;
					}
					resultData.push(result);
				});
				params.NextToken = Ext.DomQuery.selectValue('NextToken', response.responseXML);
				if (!Ext.isEmpty(params.NextToken) && ((queryLimit < 0) || (queryLimit > resultData.length))) {
					doSelect();
				} else {
					Ext.getCmp('sdbDataGridPanelContainer').setLoading(false);
					callback(resultData);
				}
			});
		};
		Ext.getCmp('sdbDataGridPanelContainer').setLoading(true);
		doSelect();
	},

	doQuery: function (method, params, callback) {
		var host, signer, self = this;
		host = Ext.getCmp('region').getValue();
		signer = new AWSV2Signer(Ext.getCmp('awsAccessKey').getValue(), Ext.getCmp('awsSecretKey').getValue());

		Ext.Ajax.request({
			url: 'https://' + host,
			params: signer.sign(Ext.merge(
				params,
				{
					Version: '2009-04-15'
				}
			), new Date(), {
				"verb": method,
				"host": host,
				"uriPath": "/"
			}),
			method: method,
			success: function (response) {
				var lastBoxUsage = parseFloat(Ext.DomQuery.selectValue('BoxUsage', response.responseXML))
				self.boxUsage += lastBoxUsage;
				Ext.getCmp('boxUsageValue').setText(Ext.util.Format.round(lastBoxUsage, 10));
				Ext.getCmp('boxUsageValueTotal').setText(Ext.util.Format.round(self.boxUsage, 10));
				if (Ext.isDefined(callback)) {
					callback(response);
				}
			},
			failure: function (response) {
				Ext.Msg.alert('Error', Ext.DomQuery.selectValue('Message', response.responseXML));
			},
			disableCaching: false
		});
	}
});