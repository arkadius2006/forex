var pairs = ['usdjpy', 'gbpusd', 'eurusd'];

var names = {
    'usdjpy': 'USDJPY',
    'gbpusd': 'GBPUSD',
    'eurusd': 'EURUSD'
};

var getQuote = function () {
    // todo this is simulation
    var mean = 110.680;
    var dev = 0.010;
    var q = mean + dev * Math.random();
    return q.toFixed(5);
};


var status = 'not-working';
var quotes = [];

var startPolling = function () {
    poll();
};

var pollInterval = 60000;

var poll = function () {
    quotes = [];

    var now = new Date();
    var expiry = new Date(now.getTime() + pollInterval);
    var i;
    var pair;
    var quote;
    var name;

    for (i = 0; i < pairs.length; i += 1) {
        pair = pairs[i];
        name = names[pair];
        quote = {'pair': pair, 'name': name, 'lastUpdated': now, 'expiry': expiry, 'value': getQuote()};
        quotes.push(quote);
    }

    setTimeout(poll, pollInterval);
};

var startPublishing = function () {
    startPolling();

    publish();
};

var publishInterval = 1000;

var publish = function () {
    postMessage({'responseType': 'quotes', 'quotes': quotes});
    setTimeout(publish, publishInterval);
};


onmessage = function (e) {
    var request = e.data;
    var requestType = request['requestType'];

    switch (requestType) {
        case 'startPolling': {
            if (status === 'not-working') {
                status = 'working';
                startPublishing();
            } else {
                throw new Error('Cannot start polling, cause status is ' + status);
            }

            break;
        }

        default: {
            throw new Error('Unknown request type: ' + requestType);
        }
    }
};
