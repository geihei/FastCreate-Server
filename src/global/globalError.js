/**
 * 错误信息封装，方便收集观察
 */
class GlobalError extends Error {
    constructor(mes, causeByErr) {
        super(mes);
        if (causeByErr) {
            this.stack += `\n cause by: ${(causeByErr.stack || causeByErr)}`
        }
    }
}

global.GlobalError = GlobalError