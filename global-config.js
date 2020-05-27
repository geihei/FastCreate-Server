const baseConfig = {
    server: {
        port: 3001,
    },
    db: {
        url: {
            production: 'mongodb://127.0.0.1:27017/fc-db',
            develop: 'mongodb://127.0.0.1:27017/fc-db',
        },
        prefix: 'fc',
    },
    superAdmin: {
        group: 'all',
        name: 'admin',
        password: 'admin',
        mail: 'geihei9071@gmail.com',
    },
    permission: {
        permissionMap: {
            master: [
                'create',
                'delete@all',
                'read@all',
                'update@all',
                'release@all',
                'add_user',
                'delete_user',
                'update_user',
                'add_group',
                'delete_group',
                'update_group'
            ],
            developer: [
                'create',
                'delete',
                'read',
                'update',
                'release',
            ],
            guest: [
                'read',
            ],
        },
    },
}

module.exports = baseConfig
