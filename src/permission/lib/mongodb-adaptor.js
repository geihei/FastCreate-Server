const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)


module.exports = function mongodbAdaptor(options) {
    let model

    return {
        async connect() {
            if (mongoose.modelNames().indexOf('Group') === -1) {
                // role
                const RoleSchema = new mongoose.Schema({
                    uids: [String],
                    name: String,
                })
                RoleSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'role_id' })

                // project
                const ProjectSchema = new mongoose.Schema({
                    desc: String, // 备注
                    name: String,
                    roles: [RoleSchema],
                })
                ProjectSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'project_id' })


                // group
                const GroupSchema = new mongoose.Schema({
                    desc: String, // 备注
                    name: String,
                    projects: [ProjectSchema],
                    roles: [RoleSchema],
                })
                GroupSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'group_id' })
                model = mongoose.model('Group', GroupSchema)
            } else {
                model = mongoose.model('Group')
            }
            await new Promise(resolve => setTimeout(resolve, 1000))
            return mongoose.connect(options.mongodbUrl)

        },
        async disconnect() {
            return mongoose.disconnect()
        },
        async createGroup(groupName) {
            return model.create({
                projects: [],
                name: groupName,
                roles: Object.keys(options.permissionMap).map(name => ({ name, uids: [] })),
            })
        },
        async getProjectByName(projectName, groupName) {
            let group = await this.getGroupByName(groupName)
            return this.findProject(group, projectName)
        },
        async createProject(projectName, groupName) {

            return model.update({ name: groupName }, {
                $push: {
                    projects: {
                        name: projectName,
                        roles: Object.keys(options.permissionMap).map(name => ({ name, uids: [] })),
                    },
                },
            })
        },
        async getGroupByName(groupName) {
            return model.findOne({ name: groupName })
        },
        async getGroups() {
            return model.find()
        },
        async grantRole(uid, roleName, groupName, projectName) {
            let group = await model.findOne({ name: groupName })
            let roles
            if (projectName) {
                roles = this.findProject(group, projectName).roles
            } else {
                roles = group.roles
            }
            let role = roles.find(d => d.name === roleName)
            roles.forEach((r) => {
                let i = r.uids.indexOf(uid)
                if (i !== -1) {
                    r.uids.splice(i, 1)
                }
            })
            if (role) {
                role.uids = [...new Set([...role.uids, uid])]
            } else {
                if (options.permissionMap[roleName]) {
                    roles.push({ name: roleName, uids: [uid] })
                } else {
                    throw Error(JSON.stringify({
                        uid, roleName, groupName, projectName,
                    }))
                }
            }
            await group.save()
        },
        async revokeRole(uid, groupName, projectName) {
            let group = await model.findOne({ name: groupName })
            let roles
            if (projectName) {
                roles = this.findProject(group, projectName).roles
            } else {
                roles = group.roles
            }
            roles.forEach((r) => {
                let i = r.uids.indexOf(uid)
                if (i !== -1) {
                    r.uids.splice(i, 1)
                }
            })
            await group.save()
        },
        async hasPermission(uid, permission, groupName, projectName) {
            if (!options.permissionMap) {
                throw new Error('options.permissionMap is required !')
            }
            let { groupRole, projectRole } = await this.getRolesInProject(uid, groupName, projectName)
            let has = false
            if (groupRole) {
                let p = options.permissionMap[groupRole]
                if (p) {
                    has = has || (p.indexOf(permission) !== -1)
                } else {
                    console.warn('xxx groupRole')
                }
            }
            if (projectRole) {
                let p = options.permissionMap[projectRole]
                if (p) {
                    has = has || (p.indexOf(permission) !== -1)
                } else {
                    console.warn('xxx projectRole')
                }
            }
            return has
        },
        /**
         * @private
         * @param group
         * @param projectName
         */
        findProject(group, projectName) {
            projectName = '' + projectName
            let p = group.projects.find(g => g.name === projectName)
            if (p) {
                return p
            }
            throw Error(JSON.stringify({ group, projectName }))
        },
        async getRolesInProject(uid, groupName, projectName) {
            let group = await model.findOne({ name: groupName })

            const getRole = (roles) => {
                let r = roles.find(r => r.uids.indexOf(uid) !== -1)
                if (r) {
                    return r.name
                }
            }
            return {
                groupRole: getRole(group.roles),
                projectRole: projectName ? getRole(this.findProject(group, projectName).roles) : undefined,
            }
        },
        async deleteProject(projectName, groupName) {
            console.log('deleting', projectName, groupName)
            return model.update({ name: groupName }, { $pull: { projects: { name: projectName } } })
        },
        async deleteGroup(groupName) {
            return model.remove({ name: groupName })
        },
        get _model() {
            return model
        },
    }
}

