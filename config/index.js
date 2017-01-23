module.exports = {
    port: 3000,
    mongoose: {
        uri: 'mongodb://localhost/session',
        options: {
            server: {
                socketOptions: {
                    keepAlive: 1
                },
                poolSize: 5
            }
        }
    }
};
