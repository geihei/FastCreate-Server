/**
 * 初始化项目的超级管理员
 * @type {module.exports.superAdmin|{group, name, password, mail}}
 */
const admin = require('../../global-config').superAdmin

exports.init = async function init(user, perm) {
    let adminObj = await user.search({ mail: admin.mail })
    if (!adminObj.total) {
        await user.register({ mail: admin.mail, name: admin.name, password: admin.password })
    }
    adminObj = await user.search({ mail: admin.mail })
    let group = await perm.getGroupByName(admin.group)
    if (!group) {
        await perm.createGroup(admin.group)
    }
    await perm.grantRole(adminObj.list[0].id, 'master', admin.group)
}

