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

    $scope.position_list = [
        {
            'currency': 'USD',
            'position': 100
        },
        {
            'currency': 'EUR',
            'position': -200
        },
        {
            'currency': 'GBP',
            'position': 300
        }
    ];

    $scope.operation_list = [
        {
            'timestamp': 12345,
            'symbol': 'USDJPY',
            'side': 'buy',
            'quantity': 100,
            'price': 100.2

        },
        {
            'timestamp': 12345,
            'symbol': 'EURUSD',
            'side': 'sell',
            'quantity': 100,
            'price': 1.54

        },
        {
            'timestamp': 12345,
            'symbol': 'GBPUSD',
            'side': 'buy',
            'quantity': 100,
            'price': 1.345
        }

    ];
};
