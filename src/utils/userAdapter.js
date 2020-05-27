/**
 * 注册用户
 */
exports.registerUser = async (ctx, params) => {
    let user = await ctx.userAdapter.search({ mail: params.mail })
    if (user.total) {
        return false
    }
    await ctx.userAdapter.register(params)
    return true
}
