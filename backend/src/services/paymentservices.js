const Jazzcash = require('jazzcash-checkout');
const crypto = require('crypto');

// initializes your jazzcash
Jazzcash.credentials({
    config: {
        merchantId: process.env.JAZZCASH_MERCHANT_ID, // Merchant Id
        password: process.env.JAZZCASH_PASSWORD, // Password
        hashKey: process.env.JAZZCASH_HASH_KEY, // Hash Key
    },
    environment: process.env.JAZZCASH_ENV, // available environment live or sandbox
});

const JazzcashService = {
    wallet: (data, callback) => {
        Jazzcash.setData(data);
        Jazzcash.createRequest('WALLET').then(res => {
            res = JSON.parse(res);
            console.log(res);

            // callback function
            callback(res);
        });
    },

    pay: (data, callback) => {
        Jazzcash.setData(data);
        Jazzcash.createRequest('PAY').then(res => {
            res = JSON.parse(res);
            console.log(res);

            // callback function
            callback(res);
        });
    },

    refund: (data, callback) => {
        Jazzcash.setData(data);
        Jazzcash.createRequest('REFUND').then(res => {
            res = JSON.parse(res);
            console.log(res);

            // callback function
            callback(res);
        });
    },

    inquiry: (data, callback) => {
        Jazzcash.setData(data);
        Jazzcash.createRequest('INQUIRY').then(res => {
            res = JSON.parse(res);
            console.log(res);

            // callback function
            callback(res);
        });
    },
};

module.exports = { JazzcashService };


