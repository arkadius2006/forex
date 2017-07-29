var worker = new Worker('worker.js');

var quote = '';

worker.onmessage = function (e) {
    var response = e.data;
    var responseType = response['responseType'];
    switch (responseType) {
        case 'quote': {
            quote = response['quote'];
            document.getElementById('quote').textContent = quote;
            break;
        }

        default: {
            throw new Error('Unknown response type: ' + responseType);
        }
    }
};

var init = function () {
    worker.postMessage({'requestType': 'startPolling'});
    updateBalance();
};

var portfolio = {
    'usd': 0,
    'jpy': 0
};

var getQuantity = function() {
    var str = document.getElementById('quantity').value;
    var num = parseFloat(str);
    if (num > 0) {
        return num;
    } else {
        return '';
    }
};


var buy = function () {
    var quantity = getQuantity();
    if (quantity > 0) {
        var decision = confirm("Do you want to buy "  + quantity + " USDJPY?");
        if (decision) {
            portfolio.usd += quantity;
            portfolio.jpy -= quantity * quote;
        }

        updateBalance();
    } else {
        alert("Invalid quantity format");
    }
};


var sell = function () {
    var quantity = getQuantity();
    if (quantity > 0) {
        var decision = confirm("Do you want to buy "  + quantity + " USDJPY?");
        if (decision) {
            portfolio.usd -= quantity;
            portfolio.jpy += quantity * quote;
        }

        updateBalance();
    } else {
        alert("Invalid quantity format");
    }
};

var updateBalance = function () {
    document.getElementById('balance').textContent = "USD: " + formatQuantity(portfolio.usd)
        + ", " + "JPY: " + formatQuantity(portfolio.jpy);
};

var formatQuantity = function(quantity) {
    return quantity.toFixed(2);
};