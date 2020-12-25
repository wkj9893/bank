const { ipcRenderer } = require('electron')
const log4js = require('log4js')

let log_path = ipcRenderer.sendSync('get_log_path')
log4js.configure({
    appenders: { bank: { type: "file", filename: log_path } },
    categories: { default: { appenders: ["bank"], level: "info" } }
})
const logger = log4js.getLogger('bank')
const username = ipcRenderer.sendSync('get_username')
let tableData = ipcRenderer.sendSync('get_data', username)

new Vue({
    el: '#app',
    data() {
        return {
            tableData: tableData,
            dialogVisible: false,
            dialogFormVisible: false,
            form: {
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
        };
    },
    methods: {
        handleClose(done) {
            this.$confirm('确认关闭？')
                .then(_ => {
                    done();
                })
                .catch(_ => { });
        },
        submit_form() {
            sumbit(this.form.money, this.form.choice);
            this.dialogFormVisible = false;

        },
        submit() {
            const net = require('net');
            const client = new net.Socket();
            client.connect({
                port: 5000
            });
            client.setEncoding('utf8')

            client.on('connect', function () {
                logger.info('用户' + username + '尝试注销')
                client.write(JSON.stringify({
                    username: username,
                    operation: 'logout',
                }))

            })
            client.on('data', function (data) {
                result = JSON.parse(data)
                if (result.message == 'true') {
                    alert('操作成功');
                    logger.info('用户操作成功');
                }
            });
            this.dialogVisible = false;
        }

    }
})


function sumbit(money, choice) {
    if (choice != "deposit" && choice != "withdraw") {
        alert("请选择取款或存款！")
        return
    }
    if (typeof money == 'undefined' || money == null || money == '' || !/^[0-9]*$/.test(money) || parseFloat(money) <= 0) {
        alert('输入不合法！')
        return
    }
    const net = require('net');
    const client = new net.Socket();
    client.connect({
        port: 5000
    });
    client.setEncoding('utf8')

    client.on('connect', function () {
        if (choice == "deposit") {
            logger.info('用户' + username + '尝试存入' + money + ' 元')
            client.write(JSON.stringify({
                username: username,
                operation: 'deposit',
                money: money
            }))
        }
        if (choice == "withdraw") {
            logger.info('用户' + username + '尝试取出' + money + ' 元')
            client.write(JSON.stringify({
                username: username,
                operation: 'withdraw',
                money: money
            }))
        }
    })
    client.on('data', function (data) {
        result = JSON.parse(data)
        if (result.message == 'true') {
            alert('操作成功');
            logger.info('用户操作成功');
        }
    });
}

