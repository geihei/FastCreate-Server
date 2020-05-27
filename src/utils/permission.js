const GROUP_NAME = require('../../global-config').superAdmin.group

exports.hasPermission = async (ctx, project, prem) => {
    let flag
    try {
        flag = await ctx.permission.hasPermission(ctx.session.userInfo.id, prem, GROUP_NAME, project)
    } catch (e) {
        flag = false
    }
    return flag
}

exports.createPremGroup = async (ctx, project) => ctx.permission.createProject(project, GROUP_NAME)

exports.deletePermGroup = async (ctx, project) => ctx.permission.deleteProject(project, GROUP_NAME)

exports.getPermGroup = async ctx => ctx.permission.getGroupByName(GROUP_NAME)

exports.getPermGroupDetail = async (ctx, project) => ctx.permission.getProjectByName(project, GROUP_NAME)

exports.addPermGroupUser = async (ctx, user, role, project) => ctx.permission.grantRole(user, role, GROUP_NAME, project)

exports.deletePermGroupUser = async (ctx, user, project) => ctx.permission.revokeRole(user, GROUP_NAME, project)
