const permission = require('./lib')
const config = require('../../global-config')

let prem

exports.init = async function init() {
    prem = await permission({
        mongodbUrl: config.db.url[process.env.NODE_ENV],
        isDev: process.env.NODE_ENV !== 'production',
        autoConnect: true,
        permissionMap: config.permission.permissionMap,
    })
    return prem
}

exports.midddleware = function midddleware() {
    return async (ctx, next) => {
        ctx.permission = prem
        await next()
    }
}

