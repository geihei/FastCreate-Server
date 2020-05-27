const {
    hasPermission,
    createPremGroup,
    deletePermGroup,
    getPermGroup,
    getPermGroupDetail,
    addPermGroupUser,
    deletePermGroupUser,
} = require('../utils/permission')

/**
 * 增加工作组
 * (需要超级管理员权限才能新建工作组)
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.addGroup = async function addGroup(ctx) {

    let permission = await hasPermission(ctx, undefined, 'add_group')
    if (!permission) {
        ctx.e403({ code: 403, message: '没有权限' })
        return
    }
    let project = await createPremGroup(ctx, ctx.request.body.name)
    ctx.body = {
        code: 0,
        message: '新建成功',
        data: project,
    }
}

/**
 * 删除工作组
 * (需要超级管理员权限才能删除工作组)
 * @param ctx
 * @return {Promise.<void>}
 */
exports.deleteGroup = async function deleteGroup(ctx) {
    let permission = await hasPermission(ctx, undefined, 'delete_group')
    if (!permission) {
        ctx.e403({ code: 403, message: '没有权限' })
        return
    }
    await deletePermGroup(ctx, ctx.params.id)
    ctx.body = {
        code: 0,
        message: '删除成功',
    }
}

/**
 * 获取工作组
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.getGroup = async function getGroup(ctx) {
    let group = await getPermGroup(ctx)
    group = group.toObject()

    await Promise.all(group.projects.map(async project => Promise.all(project.roles.map(async (role) => {
        role.uids = await Promise.all(role.uids.map(uid => ctx.userAdapter.getById(uid)))
    }))))

    await Promise.all(group.roles.map(async (role) => {
        role.uids = await Promise.all(role.uids.map(uid => ctx.userAdapter.getById(uid)))
    }))

    ctx.body = {
        code: 0,
        message: '保存成功',
        data: group,
    }
}

/**
 * 获取单个工作组
 * @param ctx
 * @return {Promise.<void>}
 */
exports.getGroupDetail = async function getGroupDetail(ctx) {
    let id = ctx.params.id
    let project = await getPermGroupDetail(ctx, id)
    let users = []
    let promises = project.roles.map(role => new Promise(async (resolve) => {
        let promises = role.uids.map(uid => ctx.userAdapter.getById(uid))
        let us = await Promise.all(promises)
        us = us.map(x => ({
            name: x.name, id: x.id, role: role.name, mail: x.mail,
        }))
        users = users.concat(us)
        resolve()
    }))
    await Promise.all(promises)
    ctx.body = {
        code: 0,
        message: '成功',
        data: users,
    }
}

/**
 * 添加工作组成员
 * @param ctx
 * @return {Promise.<void>}
 */
exports.addGroupUser = async function addGroupUser(ctx) {
    let body = ctx.request.body
    let permission = await hasPermission(ctx, ctx.params.id, 'add_user')
    if (!permission) {
        ctx.e403({ code: 403, message: '没有权限' })
        return
    }
    await addPermGroupUser(ctx, body.id, body.role, ctx.params.id)
    ctx.body = {
        code: 0,
        message: '添加成功',
        data: body,
    }
}

/**
 * 删除工作组成员
 * @param ctx
 * @return {Promise.<void>}
 */
exports.deleteGroupUser = async function deleteGroupUser(ctx) {
    let permission = await hasPermission(ctx, ctx.params.id, 'delete_user')
    if (!permission) {
        ctx.e403({ code: 403, message: '没有权限' })
        return
    }
    await deletePermGroupUser(ctx, ctx.request.body.id, ctx.params.id)
    ctx.body = {
        code: 0,
        message: '删除成功',
    }
}
