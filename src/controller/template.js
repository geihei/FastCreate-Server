const db = require('../storage/index')

/**
 * 增加模板
 * @param ctx
 * @param next
 * @returns {Promise.<void>}
 */
exports.addTemplate = async function addTemplate(ctx, next) {
    let userInfo = ctx.session.userInfo
    let body = ctx.request.body
    let templateObj = {
        name: body.name,
        elements: body.elements,
        create_time: Date.now(),
        create_user: userInfo.name,
        create_user_id: userInfo.id,
        modify_time: Date.now(),
        modify_user: userInfo.name,
        modify_user_id: userInfo.id,
        type: body.type,
        is_delete: false,
    }
    templateObj = await db.addTemplate(templateObj)
    ctx.body = {
        code: 0,
        message: '保存成功',
        data: templateObj,
    }
}

/**
 * 更新模板
 * @param ctx
 * @param next
 * @return {Promise.<void>}
 */
exports.updateTemplate = async function updateTemplate(ctx, next) {
    let userInfo = ctx.session.userInfo
    let body = ctx.request.body
    let id = body.id
    if (!id && id !== 0) {
        ctx.e404({ code: 404, message: '没有找到此模板' })
    }
    let templateObj = await db.getTemplateDetail(id)
    if (!templateObj) {
        ctx.e404({ code: 404, message: '没有找到此模板' })
    }
    if (templateObj.create_user_id !== userInfo.user_id) {
        ctx.e403({ code: 403, message: '无法修改其他人创建的模板' })
        return
    }
    let templateUpdateObj = {
        elements: body.elements,
        modify_time: Date.now(),
        modify_user: userInfo.name,
        modify_user_id: userInfo.id,
        is_delete: false,
    }
    await db.updateTemplate(id, templateUpdateObj)
    ctx.body = {
        code: 0,
        message: '保存成功',
        data: templateUpdateObj,
    }
}

/**
 * 删除模板
 * @param ctx
 * @param next
 * @returns {Promise.<void>}
 */
exports.deleteTemplate = async function deleteTemplate(ctx, next) {
    let userInfo = ctx.session.userInfo
    let id = ctx.params.id
    if (!id && id !== 0) {
        ctx.e422({ code: 422, message: '没有找到此模板' })
        return
    }
    let templateObj = await db.getTemplateDetail(id)
    if (!templateObj) {
        ctx.e404({ code: 404, message: '没有找到此模板' })
    }
    if (templateObj.create_user_id !== userInfo.user_id) {
        ctx.e403({ code: 403, message: '无法删除其他人创建的模板' })
        return
    }

    await db.updateTemplate(ctx.params.id, {
        modify_time: Date.now(),
        modify_user: userInfo.name,
        modify_user_id: userInfo.id,
        is_delete: true,
    })

    ctx.body = {
        code: 0,
        message: '删除成功',
    }
}

/**
 * 获取模板列表
 * @param ctx
 * @param next
 * @returns {Promise.<void>}
 */
exports.getTemplate = async function getTemplate(ctx, next) {
    let params = ctx.request.query
    let userInfo = ctx.session.userInfo
    let query = { is_delete: false, $or: [{ type: 1 }, { create_user_id: userInfo.id }] }
    let sort = {}
    sort[params.sort] = -1
    if (params.type === '1') {
        query.create_user_id = userInfo.id
    }
    let tempArr = await db.getTemplate(query, params.page, params.page_size, sort)
    let length = await db.getTemplateCount(query)

    ctx.body = {
        code: 0,
        message: '成功',
        data: tempArr,
        total_num: length,
    }
}

/**
 * 获取模板详细
 * @param ctx
 * @param next
 * @return {Promise.<void>}
 */
exports.getTemplateDetail = async function getTemplateDetail(ctx, next) {
    let id = ctx.params.id

    if (!id && id !== 0) {
        ctx.e422({ code: 422, message: '没有找到此模板' })
        return
    }

    let templateObj = await db.getTemplateDetail(id)

    if (!templateObj) {
        ctx.e404({ code: 404, message: '没有找到此模板' })
    }

    ctx.body = {
        code: 0,
        message: '成功',
        data: templateObj,
    }
}
