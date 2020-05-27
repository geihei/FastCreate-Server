/**
 * 心跳，编辑过程中维持session不过期
 * @param ctx
 * @return {Promise.<void>}
 */
exports.heartbeat = async function heartbeat(ctx) {
    ctx.body = {
        code: 0,
        message: '成功',
    }
}
