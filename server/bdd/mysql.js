require('dotenv').config();
const fs = require('fs');
const net = require('net');
const mysql = require('mysql2');
const { Client } = require('ssh2');

const dbConfig = {
    host: '127.0.0.1',
    port: 3306,
    user: process.env.BDD_USER,
    password: process.env.BDD_PASSWORD,
    database: process.env.DATABASE,
    timezone: 'Z',
    waitForConnections: true,
    connectionLimit: 5,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
};

let poolPromise = null;

if (process.env.DATABASE) {
    poolPromise = process.env.SSH_HOST
        ? createTunnelPool()
        : Promise.resolve(mysql.createPool(dbConfig));
}

function createTunnelPool() {
    return new Promise((resolve, reject) => {
        const ssh = new Client();

        ssh.on('ready', () => {
            const server = net.createServer((socket) => {
                ssh.forwardOut('127.0.0.1', socket.remotePort || 0, dbConfig.host, dbConfig.port, (err, stream) => {
                    if (err) return socket.destroy();
                    stream.on('error', () => socket.destroy());
                    socket.on('error', () => stream.end());
                    socket.pipe(stream).pipe(socket);
                });
            });

            server.listen(0, '127.0.0.1', () => {
                resolve(mysql.createPool({
                    ...dbConfig,
                    port: server.address().port,
                    multipleStatements: true,
                }));
            });
        });

        ssh.on('error', reject);

        ssh.connect({
            host: process.env.SSH_HOST,
            port: 22222,
            username: 'coto',
            password: process.env.SSH_PASSWORD,
            privateKey: fs.readFileSync('C:/Users/coto-/.ssh/id_ed25519'),
        });
    });
}

function sql(query, values, callback) {
    if (!poolPromise) {
        return callback({ error: new Error('DATABASE non configurée'), rows: null });
    }
    poolPromise
        .then((pool) => {
            pool.query(query, values, (error, rows) => {
                if (error) console.error('[mysql]', error.code, error.message);
                callback({ error, rows });
            });
        })
        .catch((error) => {
            console.error('[mysql pool]', error.code, error.message);
            callback({ error, rows: null });
        });
}

module.exports = { sql };
