const userAdapter = require('./lib')
const dbConfig = require('../../global-config').db


exports.init = async function init() {
    await userAdapter.init({
        db: {
            url: dbConfig.url[process.env.NODE_ENV],
            modelPrefix: dbConfig.prefix,
        },
    })
    return userAdapter
}

exports.midddleware = function midddleware() {
    return async (ctx, next) => {
        ctx.userAdapter = userAdapter
        await next()
    }
}

