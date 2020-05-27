const db = require('./db')

let schema = new db.Schema({
    id: { // 用户id
        type: String,
        required: true,
        index: true,
        unique: true,
    },
    name: { // 姓名
        type: String,
        required: true,
        trim: true,
        maxlength: 10,
    },
    mail: { // 邮箱
        type: String,
        trim: true,
    },
    type: { // 用户类型（db）
        type: String,
        default: 'db',
        enum: ['db'],
    },
    password: { // 密码,
        type: String,
    },
    create_time: { // 创建时间
        type: Date,
        default: Date.now,
    },
    valid: { // 是否有效
        type: Boolean,
        default: true,
    },
    app_key: {
        type: String,
    },
    app_secret: {
        type: String,
    },
    group: {
        type: String,
    }
})


module.exports = function user() {
    let Model = db.model('User', schema)
    return Model
}
