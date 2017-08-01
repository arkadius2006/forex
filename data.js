var quotesController = function ($scope) {

    $scope.symbols = ['EURUSD', 'USDJPY', 'GBPUSD', 'USDCHF', 'EURGBP', 'EURJPY', 'EURCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'];

    $scope.quote_list = [
        {
            'symbol': 'EURUSD',
            'price': 1.23,
            'timestamp': 12345678,
            'expiresInSeconds': 1
        },
        {
            'symbol': 'USDJPY',
            'price': 1.23,
            'timestamp': 12345678,
            'expiresInSeconds': 1
        },
        {
            'symbol': 'GBPUSD',
            'price': 1.23,
            'timestamp': 12345678,
            'expiresInSeconds': 1
        },
        {
            'symbol': 'USDCHF',
            'price': 1.23,
            'timestamp': 12345678,
            'expiresInSeconds': 1
        },
        {
            'symbol': 'EURGBP',
            'price': 1.23,
            'timestamp': 12345678,
            'expiresInSeconds': 1
        },
        {
            'symbol': 'EURJPY',
            'price': 1.23,
            'timestamp': 12345678,
            'expiresInSeconds': 1
        },
        {
            'symbol': 'EURCHF',
            'price': 1.23,
            'timestamp': 12345678,
            'expiresInSeconds': 1
        },
        {
            'symbol': 'AUDUSD',
            'price': 1.23,
            'timestamp': 12345678,
            'expiresInSeconds': 1
        },
        {
            'symbol': 'USDCAD',
            'price': 1.23,
            'timestamp': 12345678,
            'expiresInSeconds': 1
        },
        {
            'symbol': 'NZDUSD',
            'price': 1.23,
            'timestamp': 12345678,
            'expiresInSeconds': 1
        }
    ];

    $scope.position_list = [];

    $scope.operation_list = [];

    $scope.quoteSearchForSymbol = '';

    $scope.currentQuote = undefined;

    $scope.select_quote = function (theQuote) {
        $scope.currentQuote = theQuote;
        $scope.quoteSearchForSymbol = theQuote.symbol;
    };

    $scope.new_order = {};

    $scope.buy = function () {
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
            return;
        }

        if (shown_quote_list.length > 1) {
            alert('More than 1 matching quote');
            return;
        }

        var theQuote = shown_quote_list[0];
        var theSymbol = theQuote.symbol;
        var ccy1 = theSymbol.substr(0, 3);
        var ccy2 = theSymbol.substr(3, 3);

        if (!$scope.currentQuantity) {
            alert('Please enter quantity');
            return;
        }

        var theQuantity = parseFloat($scope.currentQuantity);
        if (theQuantity > 0) {
            // ok
        } else {
            alert('Invalid quantity.');
            return;
        }

        // confirm
        var decision = confirm("Do you want to buy " + theQuantity + " " + theQuote.symbol + " @ " + theQuote.price + "?");
        if (decision) {
            console.log('Process buy ' + theQuote.symbol + ' ' + theQuote.price + ' ' + theQuantity);

            var now = new Date();
            adjust(ccy1, theQuantity);
            adjust(ccy2, -theQuantity * theQuote.price);

            $scope.operation_list.push({
                'timestamp': now,
                'symbol': theQuote.symbol,
                'quantity': theQuantity,
                'side': 'buy',
                'price': theQuote.price
            });
        }

        // clean selection
        $scope.currentQuote = undefined;
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

};