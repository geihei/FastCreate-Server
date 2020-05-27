/**
 * 日志中间件
*/
const uuid = require('uuid/v4')
const extend = require('extend')

const LEVELSSTR = 'DEBUG INFO NOTICE WARNING ERROR CRITICAL ALERT EMERGENCY'
const LEVELS = LEVELSSTR.split(' ')

const DEBUG = 0
const INFO = 1
const NOTICE = 2
const WARNING = 3
const ERROR = 4
const CRITICAL = 5
const ALERT = 6
const EMERGENCY = 7

const LEVEL = {
    DEBUG,
    INFO,
    NOTICE,
    WARNING,
    ERROR,
    CRITICAL,
    ALERT,
    EMERGENCY,
}

const defaulFormatter = (...args) => {
    return JSON.stringify(args)
}

const logFn = (options) => {
    options = extend({
        formatter: defaulFormatter,
        logLevel: DEBUG,
    }, options)

    const context = extend({}, options.context)

    const log = (logLevel, ...args) => {
        const logMethod = logLevel >= 4 ? 'error' : logLevel >= 3 ? 'warn' : 'log'
        if (logLevel >= options.logLevel) {
            console[logMethod](options.formatter(logLevel, ...args))
        }
    }

    const ret = {}
    Object.keys(LEVEL).forEach((k) => {
        ret[k.toLowerCase()] = (...args) => log(LEVEL[k], ...args, context)
    })
    return ret
}

const formatter = (level, group, message, context) => {
    const date = new Date()
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} [${level}] ${group} ${context.traceId} ${message}`
}

module.exports = (options = {}) => {
    let logLevel = options.logLevel || logFn.DEBUG
    global.logger = logFn({
        logLevel,
        context: {
            traceId: '00000000',
        },
        formatter,
    })
    return async (ctx, next) => {
        let logger = logFn({
            logLevel,
            context: {
                traceId: uuid().replace(/-/g, ''),
            },
            formatter,
        })
        ctx.logger = logger

        let startTime = new Date().getTime()
        await next()
        let useTime = new Date().getTime() - startTime
        if (useTime > 200) {
            logger.warning('access', `access url ${ctx.request.url} use ${useTime}ms`)
        }
        logger.info('access', `access url ${ctx.request.url} use ${useTime}ms`)
    }

}

LEVELS.forEach((level) => { exports[level] = LEVEL[level] })
