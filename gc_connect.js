// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, callback) {
    // If the received message has the expected format...
    if (msg.text === "report_back") {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://connect.garmin.com/modern/proxy/workout-service/workout', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
        xhr.setRequestHeader('Nk', 'NT');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('X-App-Ver', '4.44.0.14');
        xhr.setRequestHeader('X-Lang', 'en-US');
        xhr.withCredentials = true;
        xhr.send(JSON.stringify(msg.payload))

        return callback(xhr);
    }
});