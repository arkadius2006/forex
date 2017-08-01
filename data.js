var quotesController = function ($scope, $http) {

    $scope.symbols = ['EURUSD', 'USDJPY', 'GBPUSD', 'USDCHF', 'EURGBP', 'EURJPY', 'EURCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'];

    $scope.quote_list = [];

    $scope.position_list = [];

    $scope.operation_list = [];

    $scope.quoteSearchForSymbol = '';

    $scope.currentQuantity = '';

    $scope.select_quote = function (theQuote) {
        $scope.quoteSearchForSymbol = theQuote.symbol;
    };

    $scope.new_order = {};

    $scope.buy = function () {
        var order;

        order = getOrder();
        if (!order) {
            return;
        }

        order['side'] = 'buy';

        // confirm
        var decision = confirm('Do you want to ' + order['side'] + ' ' + order['quantity'] + ' ' + order['symbol'] + " @ " + order['price'] + "?");
        if (decision) {
            order['timestamp'] = new Date();
            submitOrder(order);
        }
    };

    $scope.sell = function () {
        var order;

        order = getOrder();
        if (!order) {
            return;
        }

        order['side'] = 'sell';

        // confirm
        var decision = confirm('Do you want to ' + order['side'] + ' ' + order['quantity'] + ' ' + order['symbol'] + " @ " + order['price'] + "?");
        if (decision) {
            order['timestamp'] = new Date();
            submitOrder(order);
        }
    };

    var getOrder = function () {
        // figure out which quotes are shown
        var shown_quote_list = [];
        var i, q;
        var filter;
        if ($scope.quoteSearchForSymbol) {
            filter = $scope.quoteSearchForSymbol;
        } else {
            filter = '';
        }

        for (i = 0; i < $scope.quote_list.length; i += 1) {
            q = $scope.quote_list[i];

            if (q['symbol'].indexOf(filter) > -1) {
                shown_quote_list.push(q);
            }
        }

        if (shown_quote_list.length === 0) {
            alert('No matching quotes');
            return undefined;
        }

        if (shown_quote_list.length > 1) {
            alert('More than 1 matching quote');
            return undefined;
        }

        var theQuote = shown_quote_list[0];
        var theSymbol = theQuote.symbol;
        var thePrice = theQuote['price'];

        if (!$scope.currentQuantity) {
            alert('Please enter quantity');
            return undefined;
        }

        var theQuantity = parseFloat($scope.currentQuantity);
        if (theQuantity > 0) {
            // ok
        } else {
            alert('Invalid quantity.');
            return undefined;
        }

        return {'symbol': theSymbol, 'price': thePrice, 'quantity': theQuantity};
    };

    var adjust = function (ccy, amount) {
        // search for position
        var pos, i;
        var thePosition = undefined;
        for (i = 0; i < $scope.position_list.length; i += 1) {
            pos = $scope.position_list[i];
            if (pos['currency'] === ccy) {
                thePosition = pos;
                break;
            }
        }

        if (thePosition) {
            //
        } else {
            thePosition = {};
            thePosition['currency'] = ccy;
            thePosition['position'] = 0;
            $scope.position_list.push(thePosition);
        }

        thePosition['position'] += amount;
    };

    var submitOrder = function (order) {
        console.log('Processing order: ' + JSON.stringify(order));

        var ccy1 = order['symbol'].substr(0, 3);
        var ccy2 = order['symbol'].substr(3, 3);

        switch (order['side']) {
            case 'buy': {
                adjust(ccy1, order['quantity']);
                adjust(ccy2, -order['quantity'] * order['price']);
                break;
            }
            case 'sell': {
                adjust(ccy1, -order['quantity']);
                adjust(ccy2, order['quantity'] * order['price']);
                break;
            }
            default: {
                console.error('Unexpected side: ' + order['side']);
                return;
            }
        }

        $scope.operation_list.push({
            'timestamp': order['timestamp'],
            'symbol': order['symbol'],
            'quantity': order['quantity'],
            'side': order['side'],
            'price': order['price']
        });

        $scope.PnL = computePnl();
    };


    // 1forge.com api key
    var secret = {
        '1forge.com': {
            'api_key': 'vO3LdQiJcUjzle3R8WcYj2I8v7QYMnPf'
        }
    };

    var pairsString = '';
    var i;
    for (i = 0; i < $scope.symbols.length; i += 1) {
        pairsString += $scope.symbols[i];
        if (i < $scope.symbols.length - 1) {
            pairsString += ',';
        }
    }

    var pollInterval = 10000;

    var processForgeQuotes = function (data) {
        $scope.quote_list = [];

        var i, q;
        for (i = 0; i < data.length; i += 1) {
            q = data[i];
            $scope.quote_list.push(
                {
                    'symbol': q['symbol'],
                    'price': q['price'],
                    'timestamp': new Date()
                }
            );
        }

        $scope.PnL = computePnl();

        // schedule new poll
        setTimeout(requestForQuotes, pollInterval);
    };

    var requestForQuotes = function () {
        $http({
            method: 'GET',
            url: 'https://forex.1forge.com/1.0.2/quotes?pairs=' + pairsString + '&api_key=' + secret['1forge.com']['api_key']
        }).then(function successCallback(response) {
            processForgeQuotes(response.data);
        }, function errorCallback(response) {
            console.log("Received error response: " + JSON.stringify(response));
        });
    };

    requestForQuotes();

    $scope.PnL = 0;

    var computePnl = function () {
        var sum = 0;
        var i, pos;
        var incr;
        for (i = 0; i <  $scope.position_list.length; i += 1) {
            pos = $scope.position_list[i];
            incr = toUsdValue(pos['currency'], pos['position']);
            sum += incr;
        }

        return sum;
    };

    var toUsdValue = function (xxx, quantity) {
        var ccy1, ccy2, q, i, symbol, price;

        if (xxx === 'USD') {
            return quantity;
        } else {
            // lookup USDxxx or xxxUSD quote
            for (i = 0; i < $scope.quote_list.length; i += 1) {
                q = $scope.quote_list[i];
                console.log(JSON.stringify(q));

                symbol = q['symbol'];
                price = q['price'];

                ccy1 = symbol.substr(0, 3);
                ccy2 = symbol.substr(3, 3);

                if (ccy1 === 'USD' && ccy2 === xxx) {
                    return quantity / price;
                } else if (ccy1 === xxx && ccy2 === 'USD') {
                    return quantity * price;
                }
            }

            console.error('Cannot convert ' + xxx +' to USD');
            return 0; // todo handle properly case when we have no USD equivalent for xxx
        }
    };

};