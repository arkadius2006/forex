// data structures
var portfolio = {};

var quotes = {};

var worker = new Worker('worker.js');

worker.onmessage = function (e) {
    var response = e.data;
    var responseType = response['responseType'];
    var i;
    var q;
    var pair;

    switch (responseType) {
        case 'quotes': {
            var newQuotes = response['quotes'];

            for (i = 0; i < newQuotes.length; i += 1) {
                q = newQuotes[i];
                pair = q['pair'];
                quotes[pair] = q;
            }

            updateQuotesView();
            updatePnl();
            break;
        }

        default: {
            throw new Error('Unknown response type: ' + responseType);
        }
    }
};

var updateQuotesView = function () {
    var str = '';
    var pair;
    var q;
    var quote;
    for (pair in quotes) {
        q = quotes[pair];
        quote = {'pair': pair, 'name': q['name'], 'value': q['value'], 'lastUpdated': q['lastUpdated'], 'expiry': q['expiry']};

        str += createQuoteElement(quote);
    }

    document.getElementById('article').innerHTML = str;
};

var createQuoteElement = function (quote) {
    var name = quote['name'];
    var value = quote['value'];
    var lastUpdated = quote['lastUpdated'];

    var exp = quote['expiry'];
    var now = new Date();
    var diff_millis = exp - now;
    var diff_seconds = (diff_millis / 1000).toFixed(0);


    return '<div>' +
        '<p>'
        + name + ' = ' + value
        + ', '
        + 'expires in ' + diff_seconds + ' sec'
        + '</p>'
        + '</div>';
};

var init = function () {
    worker.postMessage({'requestType': 'startPolling'});
    updatePnl();
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
    var pairname = getPairName();
    var pair = lookupPairByName(pairname);
    var quantity = getQuantity();

    var quote;
    var expiry;
    var decision;
    var now;
    var value;
    var ccy1 = pair.substr(0, 3);
    var ccy2 = pair.substr(3, 3);

    if (pair && quantity > 0) {
        // make snapshot of shared vars
        quote = quotes[pair];
        value = quote['value'] + '';
        expiry = new Date(quote['expiry'].getTime());

        decision = confirm("Do you want to buy " + quantity + " " + pairname + " @ " + value + "?");
        if (decision) {
            // check expiry
            now = new Date();
            if (now.getTime() < expiry.getTime()) {
                adjust(ccy1, quantity);
                adjust(ccy2, -quantity * value);

                updatePnl();
            } else {
                alert('Quote already expired, please submit new order');
            }
        }
    } else {
        alert("Invalid pair or quantity format: " + pair);
    }
};


var sell = function () {
    var quantity = getQuantity();
    if (quantity > 0) {
        // make snapshot of shared vars
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

    } else {
        alert("Invalid quantity format");
    }
};

var adjust = function (ccy, amount) {
    if (portfolio[ccy] === undefined || portfolio[ccy] === '') {
        portfolio[ccy] = amount;
    } else {
        portfolio[ccy] += amount;
    }
};

var formatQuantity = function (quantity) {
    return quantity.toFixed(2);
};

var updatePnl = function() {
    var ccy;
    var quantity;
    var sum = 0;
    var usdvalue;
    for (ccy in portfolio) {
        quantity = portfolio[ccy];
        usdvalue = toUsdValue(ccy, quantity);
        sum += usdvalue;
    }

    document.getElementById('pnl').textContent = formatQuantity(sum) + " USD";
};

var toUsdValue = function (ccy, quantity) {
    return quantity * parseFloat(getUsdQuote(ccy));
};

var getUsdQuote = function (ccy) {
    if (ccy === 'usd') {
        return 1;
    }

    var pair;
    var ccy1;
    var ccy2;
    var quote;
    for (pair in quotes) {
        ccy1 = pair.substr(0, 3);
        ccy2 = pair.substr(3, 3);
        quote = quotes[pair];

        if (ccy1 === 'usd' && ccy2 === ccy) {
            return 1/quote['value'];
        } else if (ccy1 === ccy && ccy2 === 'usd') {
            return quote['value'];
        }
    }

    return 0;
};

var getPairName = function () {
    return document.getElementById('pair-name').value;
};

var lookupPairByName = function (pairname) {
    var pair;
    var q;
    for (pair in quotes) {
        q = quotes[pair];
        if (pairname === q['name']) {
            return pair;
        }
    }

    return '';
};