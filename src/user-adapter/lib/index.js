const extend = require('extend')
const uuid = require('uuid/v1')
const db = require('./db')

// eslint-disable-next-line
const mailRegExp = /^([a-zA-Z0-9]+[-|_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/

const DEFAULT_OPTIONS = {
    db: {
        url: 'mongodb://127.0.0.1:27017/db1',
        modelPrefix: 'uad_',
    },
}

/**
 * @class UserAdapter
 * @classdesc 用户适配器
 */
class UserAdapter {
    constructor() {
        this.isInit = false
        this.type = 'db'
        this.options = extend(true, {}, DEFAULT_OPTIONS)
    }

    /**
     * @typedef {Object} UserAdapter#init~options
     * @property {Object} db - 数据库配置
     * @property {String} db.url - 数据库连接字符串（必须），eg:mongodb://127.0.0.1:27017/db1
     */
    /**
     * 初始化
     * @function UserAdapter#init
     * @param options {UserAdapter#init~options} 配置对象
     * @returns {Promise}
     */
    async init(options = {}) {
        let dbConfig = options.db || {}

        if (!dbConfig.url) {
            throw new Error('db.url is required!')
        }

        this.options = extend(true, {}, DEFAULT_OPTIONS, options)
        await db.init(this.options.db)
        this.isInit = true
        return 0
    }

    /**
     * 获取适配器
     * @private
     * @returns {*}
     */
    getAdapter() {
        if (!this.isInit) {
            throw new Error('user adapter has not init !')
        }
        return db
    }

    /**
     * @typedef UserAdapter#register~user
     * @property mail {String} - 邮箱
     * @property name {String} - 用户姓名
     * @property password {String} 密码
     */
    /**
     * 用户注册
     * @function UserAdapter#register
     * @param user {UserAdapter#register~user} 用户对象
     * @returns {Promise}
     */
    async register(user = {}) {
        let mail = (user.mail || '').trim()
        if (!mail) {
            throw new Error('mail is required!')
        }
        if (!mailRegExp.test(mail)) {
            throw new Error('mail is illegal!')
        }
        let name = (user.name || '').trim()
        if (!name) {
            throw new Error('name is required!')
        }
        if (name.length > 10) {
            throw new Error('name is illegal! name must less than 10 letters!')
        }
        let password = (user.password || '').trim()
        if (!password) {
            throw new Error('password is required!')
        }
        let userInfo = {
            id: user.id || uuid(),
            mail,
            name,
            password,
            type: this.type,
        }
        return this.getAdapter().register(userInfo)
    }


    /**
     * 用户认证
     * @param uname {String} 用户id或邮箱（ldap用户禁止邮箱认证）
     * @param password {String} 密码
     * @returns {Promise}
     */
    async authenticate(uname, password) {
        if (!uname) {
            throw new Error('uname is required!')
        }
        if (!password) {
            throw new Error('password is required!')
        }
        return this.getAdapter().authenticate(uname, password)
    }
    /**
     * 修改密码
     * @param id {String} 用户id
     * @param newPassword {String} 新密码
     * @returns {Promise}
     */
    async updatePassword(id, newPassword) {
        if (!id) {
            throw new Error('id is required!')
        }
        if (!newPassword) {
            throw new Error('newPassword is required!')
        }
        return this.getAdapter().updatePassword(id, newPassword)
    }
    /**
     * @typedef {Object} UserAdapter#updateInfo~info
     * @property {String} name - 用户姓名
     * @property {String} mail - 用户邮箱
     */
    /**
     * 修改用户信息
     * @function UserAdapter#updateInfo
     * @param id {String} 用户id
     * @param info {UserAdapter#updateInfo~info} 用户信息
     * @returns {Promise}
     */
    updateInfo(id, info = {}) {
        let infop = {}
        if (!id) {
            throw new Error('id is required!')
        }
        if (!info.hasOwnProperty('name') && !info.hasOwnProperty('mail')) {
            throw new Error('name or mail is required!')
        }
        let name = (info.name || '').trim()
        if (info.hasOwnProperty('name')) {
            if (name.length > 10) {
                throw new Error('name is illegal! name must less than 10 letters!')
            }
            infop.name = name
        }
        let mail = (info.mail || '').trim()
        if (info.hasOwnProperty('mail')) {
            if (!mailRegExp.test(mail)) {
                throw new Error('mail is illegal!')
            }
            infop.mail = mail
        }
        return this.getAdapter().updateInfo(id, infop)
    }
    /**
     * 获取用户信息
     * @param id {String|Array} 用户id
     * @returns {Promise}
     */
    async getById(id) {
        let type = Object.prototype.toString.call(id)
        if (type !== '[object String]' && type !== '[object Array]') {
            throw new Error('id must is String or Array!')
        }
        if (type === '[object String]') {
            if (!id) {
                throw new Error('id is required!')
            }
            return this.getAdapter().getById(id)
        }
        if (type === '[object Array]') {
            if (id.length === 0) {
                throw new Error('id array has not any id!')
            }
            return this.getAdapter().getByIds(id)
        }
    }
    /**
     * 删除用户
     * @param id 用户id
     * @returns {Promise}
     */
    async remove(id) {
        return this.getAdapter().remove(id)
    }
    /**
     * @typedef UserAdapter#search~query
     * @property mail {String} 用户邮箱（支持模糊匹配）
     * @property valid {Boolean} 是否有效(默认值：true)
     */

    /**
     * 查询用户
     * @function UserAdapter#search
     * @param query {UserAdapter#search~query} 查询条件
     * @param offset {Number} 分页偏移量（可选,默认值：0）
     * @param limit {Number} 分页大小(可选，默认值：Number.MAX_SAFE_INTEGER)
     * @returns {Promise}
     */
    async search(query = {}, offset = 0, limit = Number.MAX_SAFE_INTEGER) {
        if (!query.hasOwnProperty('valid')) {
            query.valid = true
        }
        return this.getAdapter().search(query, offset, limit)
    }

}

module.exports = new UserAdapter()
