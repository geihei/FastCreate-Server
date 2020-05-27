const db = require('../storage/index')
// const { releaseTarget } = require('../service/page-service')
const { hasPermission } = require('../utils/permission')

/**
 * 增加页面
 * @param ctx
 * @param next
 * @returns {Promise.<void>}
 */
exports.addPage = async function addPage(ctx, next) {
    let userInfo = ctx.session.userInfo
    let body = ctx.request.body
    let permission = await hasPermission(ctx, body.create_group, 'create')
    if (!permission) {
        ctx.e403({ code: 403, message: '没有权限' })
        return
    }
    // 防止页面路径重复
    if (body.page_info.pathname) {
        let obj = await db.getPage({
            'page_info.pathname': body.page_info.pathname,
            'is_delete': false,
        })
        if (obj) {
            ctx.e402({ code: 402, message: '页面链接重复，请重新命名' })
            return
        }
    }
    let pageObj = {
        page_info: body.page_info,
        share_info: body.share_info,
        elements: body.elements,
        create_group: body.create_group,
        create_time: Date.now(),
        create_user: userInfo.name,
        create_user_id: userInfo.id,
        modify_user: userInfo.name,
        modify_user_id: userInfo.id,
        modify_time: Date.now(),
        is_delete: false,
    }
    pageObj = await db.addPage(pageObj)
    ctx.body = {
        code: 0,
        message: '保存成功',
        data: pageObj,
    }
}

/**
 * 删除页面
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.deletePage = async function deletePage(ctx) {
    let userInfo = ctx.session.userInfo
    if (!ctx.params.id) {
        ctx.e404({ code: 404, message: '没有此页面' })
        return
    }
    let pageObj = await db.getPage({ id: ctx.params.id })
    if (!pageObj) {
        ctx.e404({ code: 404, message: '没有此页面' })
        return
    }
    let deleteAllPerm = await hasPermission(ctx, pageObj.create_group, 'delete@all')
    if (userInfo.id !== pageObj.create_user_id && !deleteAllPerm) {
        ctx.e403({ code: 403, message: `没有权限，请联系${pageObj.create_user}删除` })
    }

    await db.updatePage(ctx.params.id, {
        is_delete: true,
        modify_time: Date.now(),
        modify_user: userInfo.name,
        modify_user_id: userInfo.id,
    })
    ctx.body = {
        code: 0,
        message: '删除成功',
    }
}

/**
 * 获取页面列表
 * @param ctx
 * @param next
 * @returns {Promise.<void>}
 */
exports.getPages = async function getPages(ctx, next) {
    let params = ctx.request.query
    let query = { is_delete: false }
    let sort = {}
    sort[params.sort] = -1
    if (params.type === '1') {
        query.create_user_id = ctx.session.userInfo.id
    }
    // keyword
    if (params.keyword) {
        query.$or = [{
            create_user: { $regex: new RegExp(params.keyword, 'ig') },
        }, {
            'page_info.name': { $regex: new RegExp(params.keyword, 'ig') },
        }, {
            'page_info.page_type': { $regex: new RegExp(params.keyword, 'ig') },
        },
        ]
    }
    let pageArr = await db.getPages(query, params.page, params.page_size, sort)
    let count = await db.getPagesCount(query)

    ctx.body = {
        code: 0,
        message: '成功',
        data: pageArr,
        total_num: count,
    }
}

/**
 * 获取页面详细
 * @param ctx
 * @param next
 * @returns {Promise.<void>}
 */
exports.getPage = async function getPage(ctx, next) {
    let pageObj = await db.getPage({ id: ctx.params.id, is_delete: false })
    if (pageObj) {
        ctx.body = {
            code: 0,
            message: '成功',
            data: pageObj,
        }
    } else {
        ctx.e404({ code: 404, message: '没有找到此页面' })
    }
}

/**
 * 更新页面
 * @param ctx
 * @param next
 * @returns {Promise.<void>}
 */
exports.updatePage = async function updatePage(ctx, next) {
    let userInfo = ctx.session.userInfo
    let body = ctx.request.body
    let id = body.id
    if (!id && id !== 0) {
        ctx.e404({ code: 404, message: '没有找到此页面' })
    }
    let pageObj = await db.getPage({ id })
    if (!pageObj) {
        ctx.e404({ code: 404, message: '没有找到此页面' })
    }
    let updateAllPerm = await hasPermission(ctx, pageObj.create_group, 'update@all')
    if (userInfo.id !== pageObj.create_user_id && !updateAllPerm) {
        ctx.e403({ code: 403, message: `没有权限，请联系${pageObj.create_user}编辑` })
        return
    }
    if (body.page_info.pathname) {
        let obj = await db.getPage({
            'page_info.pathname': body.page_info.pathname,
            id: { $ne: id },
            is_delete: false,
        })
        if (obj) {
            ctx.e402({ code: 402, message: '页面链接重复，请重新命名' })
            return
        }
    }

    let pageUpdateObj = {
        elements: body.elements,
        page_info: body.page_info,
        share_info: body.share_info,
        modify_time: Date.now(),
        modify_user: userInfo.name,
        modify_user_id: userInfo.id,
    }
    await db.updatePage(id, pageUpdateObj)
    ctx.body = {
        code: 0,
        message: '保存成功',
        data: pageUpdateObj,
    }
}
