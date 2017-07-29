var worker = new Worker('worker.js');

var quote = {'value': '', 'lastUpdated': '', 'expiry': ''};

worker.onmessage = function (e) {
    var response = e.data;
    var responseType = response['responseType'];
    switch (responseType) {
        case 'quote': {

            quote['value'] = response['value'];
            quote['lastUpdated'] = response['lastUpdated'];
            quote['expiry'] = response['expiry'];

            updateQuoteView();

            break;
        }

        default: {
            throw new Error('Unknown response type: ' + responseType);
        }
    }
};

var updateQuoteView = function () {
    document.getElementById('value').textContent = quote['value'];
    document.getElementById('lastUpdated').textContent = 'last updated: ' + quote['lastUpdated'];

    var exp = quote['expiry'];
    var now = new Date();
    var diff_millis = exp - now;
    var diff_seconds = (diff_millis / 1000).toFixed(0);
    document.getElementById('expires-in').textContent = 'expires in: ' + diff_seconds + ' seconds';
};

var init = function () {
    worker.postMessage({'requestType': 'startPolling'});
    updateBalance();
};

var portfolio = {
    'usd': 0,
    'jpy': 0
};

var getQuantity = function () {
    var str = document.getElementById('quantity').value;
    var num = parseFloat(str);
    if (num > 0) {
        return num;
    } else {
        return '';
    }
};


var buy = function () {
    var quantity = getQuantity();
    if (quantity > 0) {
        // make snapshot ot shared vars
        var value = quote['value'] + '';
        var expiry = new Date(quote['expiry'].getTime());

        var decision = confirm("Do you want to buy " + quantity + " USDJPY @ " + value + "?");
        if (decision) {
            // check expiry
            var now = new Date();
            if (now.getTime() < expiry.getTime()) {
                portfolio.usd += quantity;
                portfolio.jpy -= quantity * value;
            } else {
                alert('Quote already expired, please submit new order');
            }
        }

        updateBalance();
    } else {
        alert("Invalid quantity format");
    }
};


var sell = function () {
    var quantity = getQuantity();
    if (quantity > 0) {
        var value = quote['value'] + '';
        var expiry = new Date(quote['expiry'].getTime());

        var decision = confirm("Do you want to sell " + quantity + " USDJPY @ " + value + "?");
        if (decision) {
            //check expiry
            var now = new Date();
            if (now.getTime() < expiry.getTime()) {
                portfolio.usd -= quantity;
                portfolio.jpy += quantity * value;
            } else {
                alert('Quote already expired, please submit new order');
            }
        }

        updateBalance();
    } else {
        alert("Invalid quantity format");
    }
};

var updateBalance = function () {
    document.getElementById('balance').textContent = "USD: " + formatQuantity(portfolio.usd)
        + ", " + "JPY: " + formatQuantity(portfolio.jpy);
};

var formatQuantity = function (quantity) {
    return quantity.toFixed(2);
};