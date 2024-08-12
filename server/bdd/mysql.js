const mysql = require('mysql2');
const { Client } = require('ssh2');
const sshClient = new Client();

const dbServer = {
    host: '127.0.0.1',
    port: 3306,
    user: 'coto-verse',
	password: 'GeaRM&5KxYYr5Dd!BPA9o$6MK7&y7MF#3T@43Qzj',
	database: 'coto_logea',
}
const tunnelConfig = {
    host: '176.144.14.240',
    port: 1234,
    username: 'coto',
    password: '271210062001'
}

const forwardConfig = {
    srcHost: '127.0.0.1',
    srcPort: 3306,
    dstHost: dbServer.host,
    dstPort: dbServer.port
};

const connectionMysql = new Promise((resolve, reject) => {
    sshClient.on('ready', () => {
        sshClient.forwardOut(
        forwardConfig.srcHost,
        forwardConfig.srcPort,
        forwardConfig.dstHost,
        forwardConfig.dstPort,
        (err, stream) => {
             if (err) reject(err);
             const updatedDbServer = {
                 ...dbServer,
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

function sql(query, values, callback){
	try {
        connectionMysql.then((conn) => {
            conn.query(query, values, (error, rows) => {
                callback({error, rows});
            });
        });
	}
	catch (e) {
        console.log(e);
    }
}

module.exports = {sql};