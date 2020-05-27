/**
 * 连接数据库并初始化page和template两张表
 */
const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)
const dbConfig = require('../../global-config').db

let PageSchema, PageModel, TemplateSchema, TemplateModel

exports.init = async function init() {
    const MONGO_URL = dbConfig.url[process.env.NODE_ENV] // 数据库地址
    try {
        await mongoose.connect(MONGO_URL) // 连接数据库
    } catch (e) {
        global.logger.info('boot', e)
        return
    }
    global.logger.info('boot', 'db connected success!')

    // 页面存储表结构
    PageSchema = new mongoose.Schema({
        page_info: Object, // 页面信息
        elements: Object, // 页面元素
        is_delete: Boolean, // 是否被删除
        create_group: String, // 创建者分组
        create_time: Number, // 创建时间
        create_user: String, // 创建用户
        create_user_id: String, // 创建用户id
        modify_time: Number, // 修改时间
        modify_user: String, // 修改用户
        modify_user_id: String, // 修改用户id
        page_group: String, // 页面归属分组
        page_expries: Number, // 过期时间戳，-1永不过期
        page_app_key: String, // 页面app key
        page_app_secret: String, // 页面app secret
    })
    PageSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'page_id' }) // 自增长id
    PageModel = mongoose.model('page', PageSchema) // pagemodel进行增删改查model

    // 自定义模板存储
    TemplateSchema = new mongoose.Schema({
        temp_name: String, // 模板名称
        elements: Object, // 模板元素
        type: Number, // 是否公共模板
        is_delete: Boolean, // 是否被删除
        create_time: Number, // 创建时间
        create_user: String, // 创建用户
        create_user_id: String, // 创建用户id
        modify_time: Number, // 修改时间
        modify_user: String, // 修改用户
        modify_user_id: String, // 修改用户id
        temp_group: String, // 模板归属分组
        temp_expries: Number, // 过期时间戳，-1永不过期
        temp_app_key: String, // 模板app key
        temp_app_secret: String, // 模板app secret
    })
    TemplateSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'temp_id' })
    TemplateModel = mongoose.model('template', TemplateSchema)
}

/**
 * 添加页面
 * @param pageObj
 * @returns {Promise.<pageObj>}
 */
exports.addPage = async function addPage(pageObj) {
    return PageModel.create(pageObj)
}

/**
 * 更新页面
 * @param id
 * @returns {Promise.<Query|HTMLElement|undefined|*>}
 */
exports.updatePage = async function updatePage(id, obj) {
    return PageModel.findOneAndUpdate({ id }, obj)
}

/**
 * 获取页面列表
 * @returns {Promise.<Query|HTMLElement|undefined|*>}
 */
exports.getPages = async function getPages(query, page = 1, pageSize = 10, sort = {}) {
    return PageModel.find(query).sort(sort).skip((page - 1) * pageSize).limit(+pageSize)
}

/**
 * 获取页面总数
 * @param query
 * @returns {Promise.<void>}
 */
exports.getPagesCount = async function getPagesCount(query) {
    return PageModel.count(query)
}

/**
 * 获取单个页面详情
 * @param query 查询参数
 */
exports.getPage = async function getPage(query) {
    return PageModel.findOne(query)
}

/**
 * 添加模板
 * @param tempObj
 */
exports.addTemplate = async function addTemplate(tempObj) {
    return TemplateModel.create(tempObj)
}

/**
 * 更新模板
 * @param id
 * @param obj
 * @return {Promise.<Query|*>}
 */
exports.updateTemplate = async function updateTemplate(id, obj) {
    return TemplateModel.findOneAndUpdate({ id }, obj)
}

/**
 * 获取所有模板
 * @param query
 * @param page
 * @param pageSize
 * @param sort
 * @return {Promise.<void>}
 */
exports.getTemplate = async function getTemplate(query, page = 1, pageSize = 10, sort) {
    return TemplateModel.find(query).sort(sort).skip((page - 1) * pageSize).limit(+pageSize)
}

/**
 * 获取模板详情
 * @param id
 * @return {Promise.<Query|*>}
 */
exports.getTemplateDetail = async function getTemplateDetail(id) {
    return TemplateModel.findOne({ id })
}

/**
 * 获取模板总数
 * @param query
 * @return {Promise.<void>}
 */
exports.getTemplateCount = async function getTemplateCount(query) {
    return TemplateModel.count(query)
}


/**
 * 把 返回 mongoose model 的方法 转化成返回纯对象的方法
 * @param fn
 * @returns {function(...[*]=)}
 */
const toObject = fn => async (...args) => {
    const toObject = (model) => {
        if (!model) {
            return model
        }
        if (model.toObject) {
            return toObject(model.toObject())
        }
        if (model instanceof Array) {
            return model.map(m => toObject(m))
        }
        if (model instanceof Object) {
            for (let i in model) {
                if (model.hasOwnProperty(i)) {
                    model[i] = toObject(model[i])
                }
            }
            return model
        }
        return model

    }

    let result = fn.apply(this, args)
    if (result.then) {
        result = await result
    }
    return toObject(result)
}

// 修改所有方法, 使其返回纯对象
Object.values(exports).forEach((fn, key) => {
    if (fn instanceof Function) {
        exports[key] = toObject(fn)
    }
})
