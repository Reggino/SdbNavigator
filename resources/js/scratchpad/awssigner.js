/*global Ext:false */

function AWSSigner(accessKeyId, secretKey, stsARN) {
    if (typeof stsARN !== "string" || stsARN.length === 0) {
        this.accessKeyId = accessKeyId;
        this.secretKey = secretKey;
        this.sessionToken = null;
        this.stsARN = null;
    } else {
        this.accessKeyId = null;
        this.secretKey = null;
        this.sessionToken = null;
        this.stsARN = stsARN;

        this.stsClientAccessKeyId = accessKeyId;
        this.stsClientSecretKey = secretKey;
    }
}

AWSSigner.prototype.asyncSign = function(params, time, requestInfo, cb) {
    if (this.accessKeyId !== null) {
        signedParams = this.sign(params, time, requestInfo);
        cb(signedParams);
        return;
    }
    console.log("Calling STS");

    var stsCallParams = {
        'Version': '2011-06-15',
        'Action': 'AssumeRole',
        'RoleSessionName': 'GoogleChromeSdbNavigator',
        'RoleArn': this.stsARN
    };

    var stsRequestInfo = {
        "verb": "GET",
        "host": "sts.amazonaws.com",
        "uriPath": "/"
    };

    var stsSigner = new AWSV2Signer(this.stsClientAccessKeyId, this.stsClientSecretKey);
    var signedParams = stsSigner.sign(
        stsCallParams,
        new Date(),
        stsRequestInfo
    );

    var _this = this;

    Ext.Ajax.request({
        method: stsRequestInfo.verb,
        url: "https://" + stsRequestInfo.host + stsRequestInfo.uriPath,
        params: signedParams,
        success: function (response) {
            _this.accessKeyId = Ext.DomQuery.selectValue("Credentials/AccessKeyId", response.responseXML);
            _this.secretKey = Ext.DomQuery.selectValue("Credentials/SecretAccessKey", response.responseXML);
            _this.sessionToken = Ext.DomQuery.selectValue("Credentials/SessionToken", response.responseXML);

            cb(_this.sign(params, time, requestInfo));
        },
        failure: function (response) {
            Ext.Msg.alert(
                'Error',
                ((response.responseXML === null)
                    ? '<' + 'b>Did not receive response to AJAX request.</b><p>' +
                      '</p><p>Please check the following:</p> <ul>' +
                      '<li>- Is there an active internet connection?</li>' +
                      '<li>- Is the any software running that may block cross-domain requests?</li>' +
                      '<li>- In development mode, make sure the browser is able to make cross-domain requests: start ' +
                      'chrome with --disable-web-security .</li>' +
                      '</ul>'
                    : Ext.DomQuery.selectValue('Message', response.responseXML)
                )
            );
        },
        disableCaching: false
    });
};

AWSSigner.prototype.sign = function (params, time, requestInfo) {
    var timeUtc = time.toISO8601();
    params = this.addFields(params, timeUtc);
    params.Signature = this.generateSignature(this.canonicalize(params, requestInfo));
    return params;
}

AWSSigner.prototype.addFields = function (params, time) {
    params.AWSAccessKeyId = this.accessKeyId;
    params.SignatureVersion = this.version;
    params.SignatureMethod = "HmacSHA1";
    params.Timestamp = time;

    if (this.sessionToken !== null) {
        params.SecurityToken = this.sessionToken;
    }
    return params;
}

AWSSigner.prototype.generateSignature = function (str) {
    return b64_hmac_sha1(this.secretKey, str);
}

AWSV2Signer.prototype = new AWSSigner();

function AWSV2Signer(accessKeyId, secretKey, stsArn) {
    AWSSigner.call(this, accessKeyId, secretKey, stsArn);
    this.version = 2;
}

function urlEncode(url) {
    return encodeURIComponent(url)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A');
}

AWSV2Signer.prototype.canonicalize = function (params, requestInfo) {
    var verb = requestInfo.verb;
    var host = requestInfo.host.toLowerCase();
    var uriPath = requestInfo.uriPath;
    var canonical = verb + "\n" + host + "\n" + uriPath + "\n";
    var sortedKeys = filterAndSortKeys(params, signatureFilter, caseSensitiveComparator);
    var first = true;
    for (var i = 0; i < sortedKeys.length; i++) {
        if (first) {
            first = false;
        } else {
            canonical += "&";
        }
        var key = sortedKeys[i];
        canonical += urlEncode(key);
        if (params[key] !== null) {
            canonical += "=" + urlEncode(params[key]);
        }
    }
    return canonical;
}

function filterAndSortKeys(obj, filter, comparator) {
    var keys = new Array();
    for (var key in obj) {
        if (!filter(key, obj[key])) {
            keys.push(key);
        }
    }
    return keys.sort(comparator);
}

function signatureFilter(key, value) {
    return key === "Signature" || value === null;
}

function caseInsensitiveComparator(a, b) {
    return simpleComparator(a.toLowerCase(), b.toLowerCase());
}

function caseSensitiveComparator(a, b) {
    var length = a.length;
    if (b.length < length) {
        length = b.length;
    }

    for (var i = 0; i < length; i++) {
        var comparison = simpleComparator(a.charCodeAt(i), b.charCodeAt(i));
        if (comparison !== 0) {
            return comparison;
        }
    }

    if (a.length == b.length) {
        return 0;
    }
    if (b.length > a.length) {
        return 1;
    }
    return -1;
}

function simpleComparator(a, b) {
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    }
    return 0;
}

Date.prototype.toISO8601 = function () {
    return this.getUTCFullYear() + "-"
    + pad(this.getUTCMonth() + 1) + "-"
    + pad(this.getUTCDate()) + "T"
    + pad(this.getUTCHours()) + ":"
    + pad(this.getUTCMinutes()) + ":"
    + pad(this.getUTCSeconds()) + ".000Z";
}

function pad(n) {
    return (n < 0 || n > 9 ? "" : "0") + n;
}
