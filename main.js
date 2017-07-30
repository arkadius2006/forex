var portfolio = {};
var operations = [];

// live quotes from 1forge.com
var symbols = ['EURUSD', 'USDJPY', 'GBPUSD', 'USDCHF', 'EURGBP', 'EURJPY', 'EURCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'];
var quote_list = [];
var quote_map = {};

// configuration
var expirationInterval = 60000;
var pollInterval = 60000;
var updateInterval = 1000;

// 1forge.com api key
var secret = {
    '1forge.com': {
        'api_key': 'vO3LdQiJcUjzle3R8WcYj2I8v7QYMnPf'
    }
};

var updateQuotesView = function () {
    document.getElementById('your-quotes').innerHTML = createQuotesElement();
};

var createQuotesElement = function () {
    var str = '';
    var i, q;

    for (i = 0; i < quote_list.length; i += 1) {
        q = quote_list[i];
        str += createQuoteElement(q['symbol'], q['price'], q['timestamp']);
    }

    return str;
};

var createQuoteElement = function (symbol, price, timestamp) {
    var expiry = new Date(timestamp.getTime() + expirationInterval);
    var now = new Date();
    var seconds_to_expiry = ((expiry.getTime() - now.getTime()) / 1000).toFixed(0);

    return '<p>'
        + symbol + ' = ' + price
        + ', will expire in ' + seconds_to_expiry + ' sec'
        + '</p>';
};


var init = function () {
    try {
        updateQuotesView();
        updatePortfolioView();
        updateSymbolList();
        updateYourPrice();
        startPolling();

        // time is ticking, prices are the same by they got expired as time goes by.
        setInterval(updateQuotesView, updateInterval);

        document.getElementById('symbol-list').onclick = selectSymbol;
    } catch (e) {
        alert(JSON.stringify(e));
    }
};

var getYourQuantity = function () {
    var str = document.getElementById('your-quantity').value;
    var num = parseFloat(str);
    if (num > 0) {
        return num;
    } else {
        return '';
    }
};


var buy = function () {
    var symbol = getYourSymbol();
    var quantity = getYourQuantity();
    var ccy1 = symbol.substr(0, 3);
    var ccy2 = symbol.substr(3, 3);

    var quote;
    var price;
    var timestamp;
    var expiry;

    var decision;
    var now;

    if (symbol && quantity > 0) {
        quote = quote_map[symbol];

        if (quote) {
            // make snapshot of shared vars
            price = quote['price'];
            timestamp = quote['timestamp'];
            expiry = new Date(timestamp.getTime() + expirationInterval);

            decision = confirm("Do you want to buy " + quantity + " " + symbol + " @ " + price + "?");
            if (decision) {
                // check expiry
                now = new Date();

                if (now.getTime() < expiry.getTime()) {
                    adjust(ccy1, quantity);
                    adjust(ccy2, -quantity * price);

                    operations.push({
                        'timestamp': now,
                        'symbol': symbol,
                        'quantity': quantity,
                        'side': 'bot',
                        'price': price
                    });

                    updatePortfolioView();
                    updateHistoryView();
                } else {
                    alert('Quote already expired, please submit new order');
                }
            }
        } else {
            alert("No quote found for symbol: " + symbol);
        }
    } else {
        alert("Invalid symbol or quantity format");
    }
};


var sell = function () {
    var symbol = getYourSymbol();
    var quantity = getYourQuantity();
    var ccy1 = symbol.substr(0, 3);
    var ccy2 = symbol.substr(3, 3);

    var quote;
    var price;
    var timestamp;
    var expiry;

    var decision;
    var now;

    if (symbol && quantity > 0) {
        quote = quote_map[symbol];

        if (quote) {
            // make snapshot of shared vars
            price = quote['price'];
            timestamp = quote['timestamp'];
            expiry = new Date(timestamp.getTime() + expirationInterval);

            decision = confirm("Do you want to sell " + quantity + " " + symbol + " @ " + price + "?");
            if (decision) {
                // check expiry
                now = new Date();

                if (now.getTime() < expiry.getTime()) {
                    adjust(ccy1, -quantity);
                    adjust(ccy2, quantity * price);

                    operations.push({
                        'timestamp': now,
                        'symbol': symbol,
                        'quantity': quantity,
                        'side': 'sold',
                        'price': price
                    });

                    updatePortfolioView();
                    updateHistoryView();
                } else {
                    alert('Quote already expired, please submit new order');
                }
            }
        } else {
            alert("No quote found for symbol: " + symbol);
        }
    } else {
        alert("Invalid symbol or quantity format");
    }
};

var adjust = function (ccy, amount) {
    if (portfolio[ccy] === undefined || portfolio[ccy] === '' || portfolio[ccy] === null) {
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
    for (ccy in portfolio) {
        quantity = portfolio[ccy];
        sum += toUsdValue(ccy, quantity);
    }

    return sum;
};

var toUsdValue = function (xxx, quantity) {
    var ccy1, ccy2, q, i, symbol, price;

    if (xxx === 'USD') {
        return quantity;
    } else {
        // lookup USDxxx or xxxUSD quote
        for (i = 0; i < quote_list.length; i += 1) {
            q = quote_list[i];
            symbol = q['symbol'];
            price = q['price'];

            ccy1 = symbol.substr(0, 3);
            ccy2 = symbol.substr(3, 3);

            if (ccy1 === 'USD' && ccy2 === xxx) {
                return 1 / price;
            } else if (ccy1 === xxx && ccy2 === 'USD') {
                return price;
            }
        }

        return 0; // todo handle properly case when we have no USD equivalent for xxx
    }
};

var getYourSymbol = function () {
    return document.getElementById('your-symbol').value;
};

var createPortfolioCurrencyElement = function (ccy, position) {
    return '<p>'
        + ccy + ' ' + position.toFixed(2)
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
    var position;
    for (ccy in portfolio) {
        position = portfolio[ccy];

        str += createPortfolioCurrencyElement(ccy, position);
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

var computeYourPrice = function () {
    var yourQuantity = getYourQuantity();
    var yourSymbol = getYourSymbol();
    var yourQuote;
    var yourPrice;

    if (yourSymbol && yourQuantity > 0) {
        yourQuote = quote_map[yourSymbol];

        if (yourQuote) {
            yourPrice = yourQuote['price'];
            if (yourPrice) {
                return yourPrice;
            }
        }
    }

    return 'N/A';
};

var updateYourPrice = function () {
    document.getElementById('your-price').innerHTML = computeYourPrice();
};


function updateSymbolList() {
    var i, q, symbol;
    var str = '';
    var input, filter, ul, li, a;

    for (i = 0; i < quote_list.length; i += 1) {
        q = quote_list[i];
        symbol = q['symbol'];

        str += '<li>' + symbol + '</li>';
    }

    document.getElementById('symbol-list').innerHTML = str;

    // show only those matching user choice
    input = document.getElementById('your-symbol');
    if (input && input.value) {
        filter = input.value.toUpperCase();
    } else {
        filter = '';
    }

    ul = document.getElementById('symbol-list');
    li = ul.getElementsByTagName('li');
    for (i = 0; i < li.length; i += 1) {
        a = li[i];
        if (filter && a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            a.style.display = '';
        } else {
            a.style.display = 'none';
        }
    }

    updateYourPrice();
}


var selectSymbol = function (event) {
    var target = event.target;

    document.getElementById('your-symbol').value = target.innerHTML;
    updateSymbolList();
};

var updateHistoryView = function () {
    var i;
    var str = '';
    var operation;

    for (i = 0; i < operations.length; i += 1) {
        operation = operations[i];

        str += operation['timestamp'] + ' '
            + 'You '
            + operation['side'] + ' '
            + operation['quantity'] + ' '
            + operation['symbol'] + ' '
            + ' @ ' + operation['price']
            + '\n';
    }

    document.getElementById('your-history-textarea').value = str;
};

var startPolling = function () {
    poll();
};

var poll = function () {
    var request = new XMLHttpRequest();

    var pairsString = '';
    var i;
    for (i = 0; i < symbols.length; i += 1) {
        pairsString += symbols[i];
        if (i < symbols.length - 1) {
            pairsString += ',';
        }
    }

    var url = 'https://forex.1forge.com/1.0.2/quotes?pairs=' + pairsString + '&api_key=' + secret['1forge.com']['api_key'];
    request.open('GET', url, true);

    request.onreadystatechange = function () {
        var forge_quote_array;
        var i;
        var forge_quote;
        var quote;
        var symbol;
        var timestamp;
        var price;
        var date;

        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                forge_quote_array = JSON.parse(request.responseText);

                quote_list = [];
                quote_map = {};

                for (i = 0; i < forge_quote_array.length; i += 1) {
                    forge_quote = forge_quote_array[i];
                    symbol = forge_quote['symbol'];
                    price = forge_quote['price'];

                    // todo temp since market is closed now
                    timestamp = forge_quote['timestamp']; // unix time in seconds
                    // date = new Date(timestamp * 1000);
                    date = new Date();

                    quote = {'symbol': symbol, 'price': price, 'timestamp': date};
                    quote_list.push(quote);
                    quote_map[symbol] = quote;
                }

                updateQuotesView();
                updatePortfolioView();
                updateSymbolList();
                updateYourPrice();

                // schedule next poll
                setTimeout(poll, pollInterval);

            } else {
                console.log("Some error with request, status = " + request.status);
                console.log(request);
                // todo schedule next poll???
            }
        }
    };

    request.send();
};
