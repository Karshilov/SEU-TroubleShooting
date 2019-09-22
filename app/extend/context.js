module.exports = {
    error(code, message){
        throw {code, message}
    },

    identityError(message='用户信息未登记'){
        throw {code:-1, message}
    },

    paramsError(message='参数传递不正确'){
        throw {code:-2, message}
    },

    permissionError(message='权限不允许'){
        throw {code:-3, message}
    }
}