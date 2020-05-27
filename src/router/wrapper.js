/**
 * 为暴露接口提供统一错误日志
 * @param {*} cb
 * @param {*} method
 * @returns
 */
function wrapper(cb, method) {
    return async function handler(ctx) {
        try {
            let now = new Date().getTime()
            await cb.apply(this, arguments) // eslint-disable-line
            ctx.logger.info('controller', `${method}: ${ctx.request.url} : use time ${new Date().getTime() - now}ms`)
        } catch (e) {
            let error = new GlobalError(`Controller ${cb.name} error`, e)
            ctx.logger.error('controller', error)
            throw error
        }
    }
}

module.exports = router => ({
    get(path, cb) {
        return router.get(path, wrapper(cb, 'get'))
    },
    post(path, cb) {
        return router.post(path, wrapper(cb, 'post'))
    },
    put(path, cb) {
        return router.put(path, wrapper(cb, 'put'))
    },
    delete(path, cb) {
        return router.delete(path, wrapper(cb, 'delete'))
    },
})
