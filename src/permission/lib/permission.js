const mongodbAdaptor = require('./mongodb-adaptor')

/**
 *  Permission 类, 用于访问和管理权限
 */
class Permission {

    constructor(options) {
        this.options = options
    }

    /**
     * 连接数据库
     * @returns {Promise.<void>}
     */
    async connect() {
        this.db = mongodbAdaptor(this.options)
        await this.db.connect()
        console.log('connected')
    }

    /**
     * 判断用户在组或者项目中是否有权限
     * @param uid 用户id
     * @param permission 权限
     * @param groupName 组
     * @param projectName 项目, 非必须, 项目为空时则返回用户在组中的权限
     * @returns {Promise.<*|Promise>}
     */
    async hasPermission(uid, permission, groupName, projectName) {
        return this.db.hasPermission(uid, permission, groupName, projectName)
    }

    /**
     * 创建组
     * @param groupName
     * @returns {Promise.<*|Promise>}
     */
    async createGroup(groupName) {
        return this.db.createGroup(groupName)
    }

    /**
     * 删除组
     * @param groupName
     * @returns {Promise.<*|Promise>}
     */
    async deleteGroup(groupName) {
        return this.db.deleteGroup(groupName)
    }

    /**
     * 查询用户在所有有权限的组和项目
     * @param {string} uid
     * @param {string} [groupName] 组名
     * @param {string} [projectName] 项目名
     * @returns {Promise.<*>}
     *
     * @example
     *
     * // 查询所有有权限的组合项目
     * umb.getRolesByUid(uid)
     *
     * @example
     *
     * // 查询某个项目中所有有权限的组
     * umb.getRolesByUid(uid, groupName)
     *
     * @example
     * // 查询某个项目中的权限, 没有权限则返回 undefined
     * umb.getRolesByUid(uid, groupName, projectName)
     *
     */
    async getRolesByUid(uid, groupName, projectName) {
        let groups
        if (groupName) {
            if (projectName) {
                let p = await this.getProjectByName(projectName, groupName)
                return p ? Permission.findRoleInRoles(uid, p.roles) : undefined
            }
            let group = await this.getGroupByName(groupName)
            let groupRole = Permission.findRoleInRoles(uid, group.roles)
            return Permission.findProjectRolesByUid(uid, group, groupRole)
        }
        groups = await this.db.getGroups()
        let result = []
        for (let group of groups) {
            let groupRole = Permission.findRoleInRoles(uid, group.roles)
            let projects = Permission.findProjectRolesByUid(uid, group, groupRole)
            if (groupRole || projects.length) {
                result.push({
                    role: groupRole, groupName: group.name, projects,
                })
            }
        }
        return result
    }

    static findProjectRolesByUid(uid, group, groupRole) {
        let result = []
        for (let p of group.projects) {
            let roleName = Permission.findRoleInRoles(uid, p.roles)
            if (roleName) {
                result.push({ role: roleName, projectName: p.name })
            } else if (groupRole) {
                result.push({ role: groupRole, projectName: p.name })
            }
        }
        return result
    }

    static findRoleInRoles(uid, roles) {
        for (let r of roles) {
            if (r.uids) {
                if (r.uids.indexOf('' + uid) !== -1) {
                    return r.name
                }
            }
        }
        return undefined
    }

    /**
     * 获取组信息
     * @param groupName
     * @returns {Promise.<*|Promise>}
     */
    async getGroupByName(groupName) {
        return this.db.getGroupByName(groupName)
    }

    /**
     * 获取所有组
     * @returns {Promise.<*|Promise>}
     */
    async getGroups() {
        return this.db.getGroups()
    }

    /**
     * 获取项目
     * @param projectName
     * @param groupName
     * @returns {Promise.<*|Promise>}
     */
    async getProjectByName(projectName, groupName) {
        return this.db.getProjectByName(projectName, groupName)
    }

    /**
     * 创建项目
     * @param projectName
     * @param groupName
     * @returns {Promise.<*|Promise>}
     */
    async createProject(projectName, groupName) {
        return this.db.createProject(projectName, groupName)
    }

    /**
     * 删除项目
     * @param projectName
     * @param groupName
     * @returns {Promise.<*|Promise>}
     */
    async deleteProject(projectName, groupName) {
        return this.db.deleteProject(projectName, groupName)
    }

    /**
     * 分配给某个用户针对某个组或者某个项目的角色
     * @param uid
     * @param roleName
     * @param groupName
     * @param [projectName] 项目名, 如果不填则是分配组权限
     * @returns {Promise.<*|Promise>}
     */
    async grantRole(uid, roleName, groupName, projectName) {
        return this.db.grantRole(uid, roleName, groupName, projectName)
    }

    /**
     * 取消某个用户在某个组或者某个项目的角色
     * @param uid
     * @param groupName
     * @param [projectName]
     * @returns {Promise.<*|Promise>}
     */
    async revokeRole(uid, groupName, projectName) {
        return this.db.revokeRole(uid, groupName, projectName)
    }

    /**
     * 断开连接
     * @returns {Promise.<*|Promise>}
     */
    async disconnect() {
        return this.db.disconnect()
    }

}

/**
 * 选项
 * @param options
 */
Permission.create = options => new Permission(options)

module.exports = Permission
