// data structures
var ccys = {
    'usd': 'USD',
    'jpy': 'JPY',
    'gbp': 'GBP',
    'eur': 'EUR'
};


var portfolio = {};

var quotes = undefined;

var worker = new Worker('worker.js');

worker.onmessage = function (e) {
    var response = e.data;
    var responseType = response['responseType'];

    switch (responseType) {
        case 'quotes': {
            quotes = response['quotes'];

            updateQuotesView();
            updatePortfolioView();
            updatePairsList();
            updateYourRate();
            break;
        }

        default: {
            throw new Error('Unknown response type: ' + responseType);
        }
    }
};

var updateQuotesView = function () {
    document.getElementById('your-quotes').innerHTML = createQuotesElement();
};

var createQuotesElement = function () {
    var str = '';
    var pair;
    var q;

    if (quotes) {
        var values = quotes['values'];
        if (values) {
            for (pair in values) {
                q = values[pair];
                str += createQuoteElement(q['name'], q['value']);
            }
        }

        str += createExpiryElement(quotes['lastUpdated'], quotes['expiry']);
    }

    return str;
};

var createQuoteElement = function (name, value) {
    return '<p>'
        + name + ' = ' + value
        + '</p>';
};

var createExpiryElement = function (lastUpdated, expiry) {
    var now = new Date();
    var seconds_to_expiry = ((expiry.getTime() - now.getTime()) / 1000).toFixed(0);

    return '<p align="right">'
        + "Will expire in " + seconds_to_expiry + ' sec'
        + '</p>';
};

var init = function () {
    try {
        updateQuotesView();
        updatePortfolioView();
        updatePairsList();
        updateYourRate();

        document.getElementById('pairs-list').onclick = selectPair;
    } catch (e) {
        alert(JSON.stringify(e));
    }

    worker.postMessage({'requestType': 'startPolling'});
};

var getQuantity = function () {
    var str = document.getElementById('your-quantity').value;
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
    var rate;
    var ccy1 = pair.substr(0, 3);
    var ccy2 = pair.substr(3, 3);

    expiry = new Date(quotes['expiry'].getTime());

    if (pair && quantity > 0) {
        // make snapshot of shared vars
        quote = quotes['values'][pair];
        rate = quote['value'] + '';

        decision = confirm("Do you want to buy " + quantity + " " + pairname + " @ " + rate + "?");
        if (decision) {
            // check expiry
            now = new Date();
            if (now.getTime() < expiry.getTime()) {
                adjust(ccy1, quantity);
                adjust(ccy2, -quantity * rate);

                updatePortfolioView();
            } else {
                alert('Quote already expired, please submit new order');
            }
        }
    } else {
        alert("Invalid pair or quantity format: " + pair);
    }
};


var sell = function () {
    var pairname = getPairName();
    var pair = lookupPairByName(pairname);
    var quantity = getQuantity();

    var quote;
    var expiry;
    var decision;
    var now;
    var rate;
    var ccy1 = pair.substr(0, 3);
    var ccy2 = pair.substr(3, 3);

    expiry = new Date(quotes['expiry'].getTime());

    if (pair && quantity > 0) {
        // make snapshot of shared vars
        quote = quotes['values'][pair];
        rate = quote['value'] + '';

        decision = confirm("Do you want to sell " + quantity + " " + pairname + " @ " + rate + "?");
        if (decision) {
            // check expiry
            now = new Date();
            if (now.getTime() < expiry.getTime()) {
                adjust(ccy1, -quantity);
                adjust(ccy2, quantity * rate);

                updatePortfolioView();
            } else {
                alert('Quote already expired, please submit new order');
            }
        }
    } else {
        alert("Invalid pair or quantity format: " + pair);
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

var computePnl = function () {
    var ccy;
    var quantity;
    var sum = 0;
    var usdvalue;
    for (ccy in portfolio) {
        quantity = portfolio[ccy];
        usdvalue = toUsdValue(ccy, quantity);
        sum += usdvalue;
    }

    return sum;
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
    for (pair in quotes['values']) {
        ccy1 = pair.substr(0, 3);
        ccy2 = pair.substr(3, 3);
        quote = quotes['values'][pair];

        if (ccy1 === 'usd' && ccy2 === ccy) {
            return 1 / quote['value'];
        } else if (ccy1 === ccy && ccy2 === 'usd') {
            return quote['value'];
        }
    }

    return 0;
};

var getYourPair = function () {
    var pairname = getPairName();
    return lookupPairByName(pairname);
};

var getPairName = function () {
    return document.getElementById('your-pair').value;
};

var lookupPairByName = function (pairname) {
    var pair;
    var q;
    var values;

    if (quotes) {
        values = quotes['values'];
        if (values) {
            for (pair in values) {
                q = values[pair];
                if (pairname === q['name']) {
                    return pair;
                }
            }
        }
    }

    return '';
};

var createPortfolioCurrencyElement = function (ccyname, position) {
    return '<p>'
        + ccyname + ' ' + position.toFixed(2)
        + '</p>';
};

var createPortfolioHeaderElement = function () {
    return '<p>'
        + 'Currency' + ' ' + 'Position'
        + '</p>';
};

var createPortfolioElement = function () {
    if (isPortfolioEmpty()) {
        return 'You portfolio is empty. Please submit an order.';
    }

    // non-empty case
    var str = '';
    str += createPnlElement();
    str += createPortfolioHeaderElement();

    var ccy;
    var ccyname;
    var position;
    for (ccy in portfolio) {
        ccyname = ccys[ccy];
        position = portfolio[ccy];

        str += createPortfolioCurrencyElement(ccyname, position);
    }

    return str;
};

var isPortfolioEmpty = function () {
    var item;
    if (portfolio) {
        for (item in portfolio) {
            if (portfolio.hasOwnProperty(item)) {
                return false;
            }
        }
    }

    return true;
};

var createPnlElement = function () {
    var pnl = computePnl();
    var str = formatQuantity(pnl) + " USD";
    return '<p>'
        + 'Your PnL is ' + str
        + '</p>';
};

var updatePortfolioView = function () {
    document.getElementById('your-portfolio').innerHTML = createPortfolioElement();
};

var computeYourRate = function () {
    var yourQuantity = getQuantity();
    var yourPair = getYourPair();
    var yourQuote;
    var yourRate;

    if (yourPair && yourQuantity > 0) {
        yourQuote = quotes['values'][yourPair];

        if (yourQuote) {
            yourRate = yourQuote['value']
            if (yourRate) {
                return yourRate;
            }
        }
    }

    return 'N/A';
};

var updateYourRate = function () {
    document.getElementById('your-rate').innerHTML = computeYourRate();
};


function updatePairsList() {
    var input, filter, ul, li, a, i;

    var str = '';

    var count;

    if (quotes) {
        var values = quotes['values'];
        if (values) {
            var pair;
            if (values) {
                for (pair in values) {
                    str += '<li>' + values[pair]['name'] + '</li>';
                }
            }

            document.getElementById('pairs-list').innerHTML = str;


            // show only those matching user choice
            input = document.getElementById('your-pair');
            if (input.value) {
                filter = input.value.toUpperCase();
            } else {
                filter = '';
            }

            ul = document.getElementById('pairs-list');
            li = ul.getElementsByTagName('li');
            count = 0;
            for (i = 0; i < li.length; i += 1) {
                a = li[i];
                if (filter && a.innerHTML.toUpperCase().indexOf(filter) > -1) {
                    a.style.display = '';
                    count += 1;
                } else {
                    a.style.display = 'none';
                }
            }

            // in case exact match, hide all items
            if (count === 1) {
                for (i = 0; i < li.length; i += 1) {
                    a = li[i];
                    a.style.display = 'none';
                }
            }

        }
    }
}


var selectPair = function (event) {
    var target = event.target;

    document.getElementById('your-pair').value = target.innerHTML;
    updatePairsList();
};
