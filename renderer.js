// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer } = require('electron')
const log4js = require('log4js')

let log_path = ipcRenderer.sendSync('get_log_path')
log4js.configure({
    appenders: { bank: { type: "file", filename: log_path } },
    categories: { default: { appenders: ["bank"], level: "info" } }
})
const logger = log4js.getLogger('bank')
const mysql = require('mysql')

new Vue({
    el: '#app',
    data() {
        return {
            username: '',
            password: '',
        }
    },
    methods: {
        login() {
            login(this.username, this.password);
        }

    }
})


function login(username, password) {
    // 连接数据库
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'admin',
        password: 'admin',
        database: 'lab4',
    });
    if (username == 'admin') {
        ipcRenderer.send('login', username);
    }
    else {
        console.log(username)
        db.query('SELECT * FROM bank WHERE username = ?',
            [username], (err, result) => {
                if (err) {
                    logger.error('尝试登陆失败！无此用户：' + username);
                    console.log(err);
                    return
                }
                if (result[0].valid == 0) {
                    alert('尝试登陆失败！该用户：' + username + '有效位为0')
                    logger.error('尝试登陆失败！该用户：' + username + '有效位为0');
                } else {
                    ipcRenderer.send('login', username);
                }
            });
    }
}