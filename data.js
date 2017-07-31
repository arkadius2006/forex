var quotesController = function ($scope) {

    $scope.symbols = ['EURUSD', 'USDJPY', 'GBPUSD', 'USDCHF', 'EURGBP', 'EURJPY', 'EURCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'];

    $scope.quote_list = [
        {
            'symbol': 'EURUSD',
            'price': 1.23,
            'timestamp': 12345678
        },
        {
            'symbol': 'USDJPY',
            'price': 1.23,
            'timestamp': 12345678
        },
        {
            'symbol': 'GBPUSD',
            'price': 1.23,
            'timestamp': 12345678
        },
        {
            'symbol': 'USDCHF',
            'price': 1.23,
            'timestamp': 12345678
        },
        {
            'symbol': 'EURGBP',
            'price': 1.23,
            'timestamp': 12345678
        },
        {
            'symbol': 'EURJPY',
            'price': 1.23,
            'timestamp': 12345678
        },
        {
            'symbol': 'EURCHF',
            'price': 1.23,
            'timestamp': 12345678
        },
        {
            'symbol': 'AUDUSD',
            'price': 1.23,
            'timestamp': 12345678
        },
        {
            'symbol': 'USDCAD',
            'price': 1.23,
            'timestamp': 12345678
        },
        {
            'symbol': 'NZDUSD',
            'price': 1.23,
            'timestamp': 12345678
        }
    ];

    $scope.position_list = [
        {
            'currency': 'USD',
            'value': 100
        },
        {
            'currency': 'EUR',
            'value': -200
        },
        {
            'currency': 'GBP',
            'value': 300
        }
    ];

    $scope.operation_list = [
        {
            'timestamp': 12345,
            'symbol': 'USDJPY',
            'side': 'buy',
            'price': 100.2

        },
        {
            'timestamp': 12345,
            'symbol': 'EURUSD',
            'side': 'sell',
            'price': 1.54

        },
        {
            'timestamp': 12345,
            'symbol': 'GBPUSD',
            'side': 'buy',
            'price': 1.345

        }

    ];
};
