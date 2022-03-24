/*jslint unparam: true, sloppy: true */
/*global Ext:false, AWSV2Signer: false */

Ext.define('SdbNavigator.SimpleDb', {
	singleton: true,
	boxUsage: 0.0,
	signer: null,

	resetConnection: function () {
		this.signer = null;
	},

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
		}
		return queryParts;
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
		var self, resultData, queryParts, queryLimit, params, sdbDataGridPanelContainer, doSelect;
		self = this;
		resultData = [];
		queryParts = this.getQueryParts(query);
		queryLimit = -1;
		params = { Action: 'Select', SelectExpression: query };

		sdbDataGridPanelContainer = Ext.getCmp('sdbDataGridPanelContainer');
		if (!sdbDataGridPanelContainer) {
			return;
		}
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
						if (result[attributeNode.childNodes[0].firstChild.nodeValue] === undefined) {
							result[attributeNode.childNodes[0].firstChild.nodeValue] = (Ext.isEmpty(attributeValueNode) ? '' : attributeValueNode.nodeValue);
						} else {
							if (!Ext.isArray(result[attributeNode.childNodes[0].firstChild.nodeValue])) {
								result[attributeNode.childNodes[0].firstChild.nodeValue] = [result[attributeNode.childNodes[0].firstChild.nodeValue]];
							}
							result[attributeNode.childNodes[0].firstChild.nodeValue].push((Ext.isEmpty(attributeValueNode) ? '' : attributeValueNode.nodeValue));
						}
						attributeNode = attributeNode.nextSibling;
					}
					resultData.push(result);
				});
				params.NextToken = Ext.DomQuery.selectValue('NextToken', response.responseXML);
				if (!Ext.isEmpty(params.NextToken) && ((queryLimit < 0) || (queryLimit > resultData.length))) {
					doSelect();
				} else {
					sdbDataGridPanelContainer.setLoading(false);
					callback(resultData);
				}
			});
		};
		sdbDataGridPanelContainer.setLoading(true);
		doSelect();
	},

	doQuery: function (method, params, callback) {
		var host, signer, self = this;
		var _this = this;

		host = Ext.getCmp('region').getValue();

		if (this.signer == null) {
			this.signer = new AWSV2Signer(
				Ext.getCmp('awsAccessKey').getValue(),
				Ext.getCmp('awsSecretKey').getValue(),
				Ext.getCmp('awsStsArn').getValue(),
				Ext.getCmp('awsSessionToken').getValue()
			);
		}

		this.signer.asyncSign(
			Ext.merge(
				params,
				{
					Version: '2009-04-15'
				}
			), new Date(), {
				"verb": method,
				"host": host,
				"uriPath": "/"
			},
            function(signedParams) {
                _this.doQuery2(method, params, callback, signedParams);
            }
		);
	},

	doQuery2: function(method, params, callback, signedParams) {
		var self = this;
		var host = Ext.getCmp('region').getValue();
		Ext.Ajax.request({
			url: 'https://' + host,
			params: signedParams,
			method: method,
			success: function (response) {
				var lastBoxUsage = parseFloat(Ext.DomQuery.selectValue('BoxUsage', response.responseXML));
				self.boxUsage += lastBoxUsage;
				Ext.getCmp('boxUsageValue').setText(Ext.util.Format.round(lastBoxUsage, 10));
				Ext.getCmp('boxUsageValueTotal').setText(Ext.util.Format.round(self.boxUsage, 10));
				if (Ext.isDefined(callback)) {
					callback(response);
				}
			},
			failure: function (response) {
				Ext.Msg.alert('Error', ((response.responseXML === null)
				? '<' + 'b>Did not receive response to AJAX request.</b><p>' +
					'</p><p>Please check the following:</p> <ul>' +
					'<li>- Is there an active internet connection?</li>' +
					'<li>- Is the any software running that may block cross-domain requests?</li>' +
					'<li>- In development mode, make sure the browser is able to make cross-domain requests: start ' +
					'chrome with --disable-web-security .</li>' +
				'</ul>'
				: Ext.DomQuery.selectValue('Message', response.responseXML)));
			},
			disableCaching: false
		});
	}
});
