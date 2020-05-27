const extend = require('extend')
const db = require('./db')
const UserModel = require('./user')

db.Promise = global.Promise

let userModel = null

/**
 * 初始化
 * @returns {Promise}
 */
async function init(options) {
    console.info('[INFO]', 'db user adapter init')
    userModel = UserModel()
    return db.connect(options.url, {
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
        reconnectInterval: 500, // Reconnect every 500ms
        poolSize: 10, // Maintain up to 10 socket connections
        // If not connected, return errors immediately rather than waiting for reconnect
        bufferMaxEntries: 0,
    })
}

/**
 * 用户注册
 * @param user
 * @returns {Promise}
 */
async function register(user) {
    if (user.mail) {
        let isExist = await userModel.queryByMail(user.mail)
        if (isExist) {
            throw new Error('user mail has register!')
        }
    }
    let userInfo = await userModel.add(user)
    if (userInfo) {
        userInfo = userInfo.toObject()
        delete userInfo.password
    }
    return userInfo
}

/**
 * 用户认证
 * @param mail
 * @param password
 * @returns {Promise}
 */
async function authenticate(mail, password) {
    let user = await userModel.queryByMail(mail, true)
    if (!user) {
        throw new Error('user mail or password is error!')
    }
    if (!user.password) {
        throw new Error(`user ${mail} has not init password!`)
    }
    if (password !== user.password) {
        throw new Error('user mail or password is error!')
    }
    user = user.toObject()
    delete user.password
    return user
}

/**
 * 修改密码
 * @param id
 * @param newPassword
 * @returns {Promise}
 */
async function updatePassword(id, newPassword) {
    return userModel.update(id, { password: newPassword })
}

/**
 * 修改信息
 * @param id
 * @param info
 * @returns {Promise}
 */
async function updateInfo(id, info) {
    return userModel.update(id, info)
}

/**
 * 获取用户信息
 * @param id
 * @returns {Promise}
 */
async function getById(id) {
    return userModel.queryById(id)
}

/**
 * 批量获取用户信息
 * @param ids
 * @returns {Promise}
 */
async function getByIds(ids) {
    return userModel.queryByIds(ids)
}

/**
 * 删除用户
 * @param id
 * @returns {Promise}
 */
async function remove(id) {
    return userModel.remove(id)
}

/**
 * 查询用户列表
 * @param query
 * @param offset
 * @param limit
 * @returns {Promise}
 */
async function search(query, offset, limit) {
    let q = extend({}, query, {
        mail: new RegExp(query.mail, 'i'),
    })
    return userModel.queryByPage(q, offset, limit)
}

module.exports = {
    init,
    register,
    authenticate,
    updatePassword,
    updateInfo,
    getById,
    getByIds,
    remove,
    search,
}
