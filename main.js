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

            // clear things
            $scope.currentQuantity = '';
            $scope.quoteSearchForSymbol = '';
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

            // clear things
            $scope.currentQuantity = '';
            $scope.quoteSearchForSymbol = '';
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
        for (i = 0; i < $scope.position_list.length; i += 1) {
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

            console.error('Cannot convert ' + xxx + ' to USD');
            return 0; // todo handle properly case when we have no USD equivalent for xxx
        }
    };

    // clock todo move to separate js file

    var drawClock = function (ctx, radius) {
        drawFace(ctx, radius);
        drawNumbers(ctx, radius);
        drawTime(ctx, radius);
    };

    var drawFace = function (ctx, radius) {
        var grad;

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();

        grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
        grad.addColorStop(0, '#333');
        grad.addColorStop(0.5, 'white');
        grad.addColorStop(1, '#333');
        ctx.strokeStyle = grad;
        ctx.lineWidth = radius * 0.1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();
    };

    function drawNumbers(ctx, radius) {
        var ang;
        var num;
        ctx.font = radius * 0.15 + "px arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        for (num = 1; num < 13; num++) {
            ang = num * Math.PI / 6;
            ctx.rotate(ang);
            ctx.translate(0, -radius * 0.85);
            ctx.rotate(-ang);
            ctx.fillText(num.toString(), 0, 0);
            ctx.rotate(ang);
            ctx.translate(0, radius * 0.85);
            ctx.rotate(-ang);
        }
    }

    var drawTime = function (ctx, radius) {
        var now = new Date();
        var hour = now.getHours();
        var minute = now.getMinutes();
        var second = now.getSeconds();
        //hour
        hour = hour % 12;
        hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
        drawHand(ctx, hour, radius * 0.5, radius * 0.07);
        //minute
        minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
        drawHand(ctx, minute, radius * 0.8, radius * 0.07);
        // second
        second = (second * Math.PI / 30);
        drawHand(ctx, second, radius * 0.9, radius * 0.02);
    };

    var drawHand = function (ctx, pos, length, width) {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.moveTo(0, 0);
        ctx.rotate(pos);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.rotate(-pos);
    };

    var getClockParam = function (city) {
        console.log('getparams lodon');
        var citycanvas = document.getElementById(city);
        var cityctx = citycanvas.getContext("2d");
        var cityraduis = citycanvas.height / 2;
        cityctx.translate(cityraduis, cityraduis);
        return {'ctx': cityctx, 'radius': cityraduis};
    };

    var startClock = function (city) {
        var params = getClockParam(city);

        setInterval(function () {
            drawClock(params['ctx'], params['radius'])
        }, 1000);
    };

    // todo fix time zones
    startClock('london');
    startClock('tokio');
    startClock('newyork');
    startClock('moscow');
};
