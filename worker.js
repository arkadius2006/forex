var getQuote = function () {
    // todo this is simulation
    var mean = 110.680;
    var dev = 0.010;
    var q = mean + dev * Math.random();
    return q.toFixed(5);
};


var status = 'not-working';
var timer;

var pollQuote = function () {
    var q = getQuote();

    postMessage({'responseType': 'quote', 'quote': q});
    timer = setTimeout(pollQuote, 1000);
};

var stopPolling = function() {
    status = 'not-working';
    clearTimeout(timer);
};

onmessage = function (e) {
    var request = e.data;
    var requestType = request['requestType'];

    switch (requestType) {
        case 'startPolling': {
            if (status === 'not-working') {
                status = 'working';
                pollQuote();
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
