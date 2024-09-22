require('dotenv').config();
const mysql = require('mysql2');
const { Client } = require('ssh2');

if (process.env.DATABASE) {
    let connectionMysql = null;
    const dbServer = {
        host: '127.0.0.1',
        port: 3306,
        user: process.env.BDD_USER,
        password: process.env.BDD_PASSWORD,
    }
    if (process.env.SSH_HOST) {
        const tunnelConfig = {
            host: process.env.SSH_HOST,
            port: 22222,
            username: 'coto',
            password: process.env.SSH_PASSWORD
        }
        const forwardConfig = {
            srcHost: '127.0.0.1',
            srcPort: 3306,
            dstHost: dbServer.host,
            dstPort: dbServer.port
        };

        const sshClient = new Client();
        connectionMysql = new Promise((resolve, reject) => {
            sshClient.on('ready', () => {
                sshClient.forwardOut(
                    forwardConfig.srcHost,
                    forwardConfig.srcPort,
                    forwardConfig.dstHost,
                    forwardConfig.dstPort,
                    (err, stream) => {
                        if (err) reject(err);
                        const updatedDbServer = {
                            ...{
                                ...dbServer,
                                database: process.env.DATABASE
                            },
                            stream
                        };
                        const connection = mysql.createConnection(updatedDbServer);
                        connection.connect((error) => {
                            if (error) {
                                reject(error);
                            }
                            resolve(connection);
                        });
                    });
            }).connect(tunnelConfig);
        });
    }
    else {
        connectionMysql = mysql.createConnection(dbServer);
    }

    function sql(query, values, callback) {
        try {
            connectionMysql.then((conn) => {
                conn.query(query, values, (error, rows) => {
                    callback({ error, rows });
                });
            });
        }
        catch (e) {
            console.log(e);
        }
    }

}

module.exports = { sql };