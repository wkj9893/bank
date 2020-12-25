const { ipcRenderer } = require('electron')
const log4js = require('log4js')

let log_path = ipcRenderer.sendSync('get_log_path')
log4js.configure({
    appenders: { bank: { type: "file", filename: log_path } },
    categories: { default: { appenders: ["bank"], level: "info" } }
})
const logger = log4js.getLogger('bank')
const mysql = require('mysql')
let tableData = ipcRenderer.sendSync('get_data', 'admin')

const app = new Vue({
    el: '#app',
    data() {
        return {
            tableData: tableData,
            dialogVisible: false,
            dialogFormVisible: false,
            msg: "",
            form: {
                username: '',
                money: '',
                choice: '',
                date1: '',
                date2: '',
                delivery: false,
                type: [],
                resource: '',
                desc: ''
            },
            formLabelWidth: '120px'
        }
    },
    methods: {
        handleClose(done) {
            this.$confirm('确认关闭？')
                .then(_ => {
                    done();
                })
                .catch(_ => { });
        },
        show_dialog() {
            this.dialogVisible = true;
        },
        submit() {
            connect_mysql(recv_data);
            this.dialogVisible = false;
        },
    }
})



let recv_data;
const net = require('net');
const server = net.createServer();


server.on('connection', function (socket) {
    socket.setEncoding('utf8')
    socket.on('data', function (data) {
        recv_data = JSON.parse(data);
        if (recv_data.operation == 'logout') {
            logger.info('用户' + recv_data.username + '请求注销');
            app.msg = '用户' + recv_data.username + '请求注销';
            app.show_dialog()
        } else {
            logger.info('用户' + recv_data.username + '请求' + (recv_data.operation == 'deposit' ? '存入' : '取出') + recv_data.money + '元');
            app.msg = '用户' + recv_data.username + '请求' + (recv_data.operation == 'deposit' ? '存入' : '取出') + recv_data.money + '元'
            app.show_dialog();
        }
    })
})
server.on('listening', function () {
    logger.info('服务器监听端口5000')
});
server.listen(5000);




function connect_mysql(data) {

    // 连接数据库
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'admin',
        password: 'admin',
        database: 'lab4',
    })
    if (data.operation == 'logout') {
        db.query("UPDATE bank SET valid = 0 WHERE username = ?", [data.username], (err) => {
            if (err) {
                console.log(err);
                logger.error("admin连接数据库失败")
            }
            logger.info('管理员注销用户' + data.username);
            alert('admin操作成功');
            return;

        })
    }

    const operation = (data.operation == 'deposit' ? '存入 ' : '取出 ');
    db.query('SELECT * FROM bank WHERE username = ?',
        [data.username], (err, result) => {
            if (err) {
                console.log(err);
                return
            }

            if (data.operation == "withdraw") {
                const remain_money = parseFloat(result[0].currency) - parseFloat(data.money);
                if (remain_money < 0) {
                    logger.warn('用户' + data.username + ' 请求失败：余额不足')
                    return
                } else {
                    db.query("UPDATE bank SET currency = ? WHERE username = ?", [remain_money, data.username], (err) => {
                        if (err) {
                            console.log(err);
                            logger.error("admin连接数据库失败")
                        }
                        logger.info('用户' + data.username + '成功' + operation + data.money + '元')
                        alert('操作成功');
                        return;

                    })

                }
            } else {
                const remain_money = parseFloat(result[0].currency) + parseFloat(data.money);
                console.log(remain_money)
                db.query("UPDATE bank SET currency = ? WHERE username = ?", [remain_money, data.username], (err) => {
                    if (err) {
                        console.log(err);
                        logger.error("admin连接数据库失败")
                    }
                    logger.info('用户' + data.username + '成功' + operation + data.money + '元')
                    alert('操作成功');
                    return;

                })

            }
        })
}







