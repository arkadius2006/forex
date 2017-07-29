var getQuote = function () {
    // todo this is simulation
    var mean = 110.680;
    var dev = 0.010;
    var q = mean + dev * Math.random();
    return q.toFixed(5);
};


var status = 'not-working';
var quote = {'value': '', 'expiry': ''};

var startPolling = function () {
    poll();
};

var pollInterval = 60000;

var poll = function () {
    var now = new Date();
    quote['value'] = getQuote();
    quote['lastUpdated'] = now;
    quote['expiry'] = new Date(now.getTime() + pollInterval);
    setTimeout(poll, pollInterval);
};

var startPublishing = function () {
    startPolling();

    publish();
};

var publishInterval = 1000;

var publish = function () {
    postMessage({'responseType': 'quote', 'value': quote['value'], 'lastUpdated': quote['lastUpdated'],'expiry': quote['expiry']});
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
