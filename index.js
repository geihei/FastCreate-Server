const Koa = require('koa')
const cors = require('koa2-cors')
const bodyParser = require('koa-body')
const compress = require('koa-compress')
const session = require('koa-session')
require('./src/global/globalError')

const storage = require('./src/storage')
const userAdapter = require('./src/user-adapter')
const permission = require('./src/permission')
const logger = require('./src/middleware/logger')()

const app = new Koa()
const router = require('./src/router/')
const auth = require('./src/middleware/auth')
const resful = require('./src/middleware/restful')
const adminInit = require('./src/super-admin-init')
const config = require('./global-config')

app.keys = ['geihei'] // 一串乱码,  session 用的


async function start() {

    // 设置跨域
    app.use(cors({
        origin: function (ctx) {
            const whiteList = [
                'https://127.0.0.1:8800',
                'http://127.0.0.1:8800',
            ]

            const referer = ctx.header.referer
            const url = referer && referer.substr(0, referer.length - 1)

            // 最终url
            if (whiteList.includes(url)) {
                return url
            }

            return 'http://127.0.0.1:8800'
        },
        exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'], // 设置获取其他自定义字段
        maxAge: 3600, // 超时时间
        credentials: true, // 是否允许携带cookie
        allowMethods: ['GET', 'PUT', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'Accept'], // 服务器支持的所有头信息字段
    }))
    
    await storage.init()

    // 初始化角色，并将角色写入表中，登录通过sso替代
    // todo 使用spc权限系统，去除用户表
    // todo 登录在表中插入两次用户信息
    const user = await userAdapter.init()
    // 初始化权限
    const perm = await permission.init()
    // 初始化超管
    // 设计思路 超管是自己 其他业务想接入需要申请超管权限
    adminInit.init(user, perm)

    app.use(compress({
        filter: content_type => /(text|javascript)/i.test(content_type),
        threshold: 2048,
        flush: require('zlib').Z_SYNC_FLUSH,
    }))
    app.use(logger)
    app.use(session({
        key: 'sso', /** (string) cookie key (default is koa:sess) */
        /** (number || 'session') maxAge in ms (default is 1 days) */
        /** 'session' will result in a cookie that expires when session/browser is closed */
        /** Warning: If a session cookie is stolen, this cookie will never expire */
        maxAge: 1800000,
        overwrite: true, /** (boolean) can overwrite or not (default true) */
        httpOnly: false, /** (boolean) httpOnly or not (default true) */
        signed: true, /** (boolean) signed or not (default true) */
        renew: true,
    }, app))
    app.use(userAdapter.midddleware())
    app.use(permission.midddleware())
    app.use(resful())
    app.use(auth())
    app.use(bodyParser())
    app.use(router.routes()).use(router.allowedMethods())

    const port = config.server.port
    app.listen(port, (err, xxx) => {
        if (err) {
            // global.logger.error()
        }
        global.logger.info('boot', 'listening on port ' + port)
    })
}

start()

