const Router = require('koa-router')
const Wrapper = require('./wrapper')
const {
    getPage, addPage, updatePage, deletePage, getPages, releasePage,
} = require('../controller/page')
const {
    addGroup, getGroup, getGroupDetail, deleteGroup, addGroupUser, deleteGroupUser,
} = require('../controller/groups')
const {
    getUser, register, login, logout, recoverPassword, resetPassword, resetUserInfo, getUserInfo,
} = require('../controller/user')
const {
    addTemplate, getTemplate, getTemplateDetail, updateTemplate, deleteTemplate,
} = require('../controller/template')
const { heartbeat } = require('../controller/heartbeat')

const router = new Router({
    prefix: '/api',
})

const wrapper = Wrapper(router)
// 页面相关
wrapper.get('/page', getPages)
wrapper.get('/page/:id', getPage)
wrapper.post('/page/add', addPage)
wrapper.post('/page/delete/:id', deletePage)
wrapper.post('/page/update', updatePage)
wrapper.post('/page/release/:id', releasePage)
// 模板相关
wrapper.get('/template', getTemplate)
wrapper.get('/template/:id', getTemplateDetail)
wrapper.post('/template/add', addTemplate)
wrapper.post('/template/delete/:id', deleteTemplate)
wrapper.post('/template/update', updateTemplate)
// 工作组等相关
wrapper.get('/group', getGroup)
wrapper.get('/group/:id', getGroupDetail)
wrapper.post('/group/create', addGroup)
wrapper.post('/group/delete/:id', deleteGroup)
wrapper.post('/group/update/:id/user/add', addGroupUser)
wrapper.post('/group/update/:id/user/delete', deleteGroupUser)
// 用户注册等相关
wrapper.get('/user', getUser)
wrapper.post('/register', register)
wrapper.post('/login', login)
wrapper.get('/logout', logout)
wrapper.post('/password/forget', recoverPassword)
wrapper.post('/password/reset', resetPassword)
wrapper.post('/reset/info', resetUserInfo)
wrapper.get('/user/info', getUserInfo)
// 心跳，用于更新cookie
wrapper.get('/heartbeat', heartbeat)

module.exports = router
