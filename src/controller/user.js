const uuid = require('uuid')
const permConf = require('../../global-config').permission
const { addResetPasswordToken, findResetPasswordToken } = require('../storage')
const { registerUser } = require('../utils/userAdapter')


/**
 * 获取用户
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.getUser = async function getUser(ctx) {
    let data = await ctx.userAdapter.search()
    ctx.body = {
        code: 0,
        message: '保存成功',
        data,
    }
}

/**
 * 注册用户
 * @param ctx
 * @return {Promise.<void>}
 */
exports.register = async function register(ctx) {
    let body = ctx.request.body
    if (!body.name) {
        ctx.e403({ code: 403, message: '名字必填' })
        return
    }
    if (!body.mail) {
        ctx.e403({ code: 403, message: '邮箱必填' })
        return
    }
    if (!body.password) {
        ctx.e403({ code: 403, message: '密码必填' })
        return
    }
    let data = await registerUser(ctx, body)
    if (!data) {
        ctx.e403({ code: 403, message: '这个邮箱已经注册过啦' })

    } else {
        ctx.session.userInfo = {
            id: data.id,
            mail: data.mail,
            name: data.name,
        }
        ctx.body = {
            code: 0,
            message: '注册成功',
            data,
        }
    }
}

/**
 * 登录
 * @param ctx
 * @return {Promise.<void>}
 */
exports.login = async function login(ctx) {
    let body = ctx.request.body
    if (!body.mail) {
        ctx.e403({ code: 403, message: '邮箱必填' })
        return
    }
    if (!body.password) {
        ctx.e403({ code: 403, message: '密码必填' })
        return
    }
    let data
    try {
        data = await ctx.userAdapter.authenticate(body.mail, body.password)
    } catch (e) {
        data = false
    }
    if (!data) {
        ctx.e403({ code: 403, message: '邮箱或密码错误' })

    } else {
        ctx.session.userInfo = {
            id: data.id,
            mail: data.mail,
            name: data.name,
        }
        ctx.body = {
            code: 0,
            message: '登录成功',
            data,
        }
    }
}

/**
 * 登出接口
 * @param ctx
 * @param next
 * @returns {Promise.<void>}
 */
exports.logout = async function logout(ctx, next) {
    ctx.session = null
    ctx.body = {
        code: 0,
        message: '成功',
    }
}

/**
 * 找回密码
 * @param ctx
 * @param next
 * @return {Promise.<void>}
 */
exports.recoverPassword = async function recoverPassword(ctx, next) {
    let body = ctx.request.body
    let user = await ctx.userAdapter.search({ mail: body.mail })
    if (!user.total) {
        ctx.e403({ code: 403, message: '用户不存在' })
        return
    }
    let data = await findResetPasswordToken({
        mail: body.mail,
        create_time: { $gt: Date.now() - 60000 },
    })
    if (data.length) {
        ctx.body = {
            code: 0,
            message: '已经发送邮件，如果没有收到，请稍后点击',
        }
        return
    }
    let tokenObj = {
        mail: body.mail,
        token: uuid(),
        create_time: Date.now(),
        invalid_time: Date.now() + 300000,
    }
    await addResetPasswordToken(tokenObj)
    let message = {
        from: '1115414944@qq.com',
        to: tokenObj.mail,
        subject: '重置密码',
        text: `${body.url}#/recover?token=${tokenObj.token}&mail=${tokenObj.mail}`,
    }
    transporter.sendMail(message)
    ctx.body = {
        code: 0,
        message: '成功',
    }
}

/**
 * 重置密码
 * @return {Promise.<void>}
 */
exports.resetPassword = async function resetPassword(ctx, next) {
    let body = ctx.request.body
    let user = await ctx.userAdapter.search({ mail: body.mail })
    if (!user.total) {
        ctx.e403({ code: 403, message: '用户不存在' })
        return
    }
    let data = await findResetPasswordToken({
        mail: body.mail,
        token: body.token,
        invalid_time: { $gt: Date.now() - 300000 },
    })
    if (!data.length) {
        ctx.e404({
            code: 404,
            message: '链接失效请重新找回密码',
        })
        return
    }
    await ctx.userAdapter.updatePassword(user.list[0].id, body.password)
    ctx.body = {
        code: 0,
        message: '重置成功',
    }
}

/**
 * 获取用户信息
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.getUserInfo = async function getUserInfo(ctx) {
    let userInfo = ctx.session.userInfo
    let group = await ctx.permission.getRolesByUid(userInfo.id)
    let role = '', projects = []
    if (group.length) {
        role = group[0].role
        projects = group[0].projects
        projects.forEach((item) => {
            item.permission = permConf.permissionMap[item.role]
        })
    }
    ctx.body = {
        code: 0,
        message: '成功',
        data: {
            user_info: userInfo,
            role,
            group: projects,
        },
        environment: process.env.NODE_ENV,
    }
}

/**
 * 修改用户信息
 * @return {Promise.<void>}
 */
exports.resetUserInfo = async function resetUserInfo(ctx, next) {
    let userInfo = ctx.session.userInfo
    let body = ctx.request.body

    let data = await ctx.userAdapter.updateInfo(userInfo.id, {
        mail: body.mail,
        name: body.name,
    })
    ctx.session.userInfo = {
        id: data.id,
        mail: data.mail,
        name: data.name,
    }
    ctx.body = {
        code: 0,
        message: '修改成功',
        data,
    }
}
