var secret = {
    '1forge.com': {
        'api_key': 'vO3LdQiJcUjzle3R8WcYj2I8v7QYMnPf'
    }
};

var requestQuote = function () {
    var request = new XMLHttpRequest();
    var url = 'https://forex.1forge.com/1.0.2/quotes?pairs=USDJPY&api_key=' + secret['1forge.com']['api_key'];

    request.open('GET', url, true);

    request.onreadystatechange = function () {
        var quote_array;
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                console.log(request.response);
                console.log(typeof request.response);
                quote_array = JSON.parse(request.response);
                console.log(quote_array);
            } else {
                console.log("Some error with request");
                console.log(request);
            }
        }
    };

    request.send();
};