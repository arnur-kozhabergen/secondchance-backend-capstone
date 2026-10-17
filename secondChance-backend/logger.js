const pino = require('pino');

let logger;
const redact = ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'];

if (process.env.NODE_ENV !== 'production') {
    // In non-production environments, log to the console
    logger = pino({
        redact,
        level: 'debug',
        transport: {
            target: "pino-pretty",
        },
    });
} else {
    // production
    logger = pino({ redact });
}

module.exports = logger;
