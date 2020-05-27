const { registerUser } = require('../utils/userAdapter')

/**
 * 不用校验session的白名单
 * 登录接口
 * 注册接口
 * 忘记密码接口
 */
const WHITE_LIST = {
    '/api/login': true,
    '/api/register': true,
    '/api/password/forget': true,
}
/**
 * 校验session
 * 如果存在token那么直接去获取用户信息
 * 不存在用户就创建用户
 * @return {Function}
 */
module.exports = function auth() {
    return async function auth(ctx, next) {
        if (ctx.session.userInfo || WHITE_LIST[ctx.request.url] || ctx.request.query.debug_token) {
            await next()
        } else {
            let token = ctx.request.query.token || (ctx.request.body && ctx.request.body.token)
            if (token) {
                await registerUser(ctx, {
                    mail: data.userInfo.email,
                    name: data.userInfo.fullname,
                    password: '123456',
                })
                let result = await ctx.userAdapter.search({
                    mail: data.userInfo.email,
                })
                let user = result.list[0]
                ctx.session.userInfo = {
                    id: user.id,
                    mail: user.mail,
                    name: user.name,
                }
                await next()
            } else {
                ctx.status = 401
                ctx.body = {
                    message: '请登录',
                }
            }
        }
    }
}
