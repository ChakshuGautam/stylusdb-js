var axon = require('axon');
var sock = axon.socket('rep');

sock.connect(8080);

// Global raft externals
sock.on('leaderChange', function (msg) {
    console.log('leaderChange', msg);
});

const sendGET = (key, fn) => {
    sock.send('GET', { 'key': key }, function (res) {
        fn(res);
    });
}

const sendSET = (key, value, fn) => {
    sock.send('SET', { [key]: value }, function (res) {
        fn('ack');
    });
}

