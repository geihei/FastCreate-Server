/**
 * @module permission
 * @description node 权限管理库
 */

const Permission = require('./permission')


/**
 * 初始化权限实例
 * @function permission
 * @param {object} options 选项
 * @param {string} options.mongodbUrl 连接 mongodb 的 url
 * @param {boolean} options.autoConnect=false 是否初始化时自动连接数据库
 * @param {object} options.permissionMap 权限列表
 *
 * @returns {Permission} Permission 实例
 */
async function permission(options = {}) {
    let ins = Permission.create(options)
    if (options.autoConnect) {
        await ins.connect()
    }
    return ins
}

module.exports = permission


