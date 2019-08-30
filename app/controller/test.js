'use strict'

const Controller = require('egg').Controller;

class TestController extends Controller {
    async create() {
        //添加一个人员信息
        const { ctx } = this;
        let newWorker = this.ctx.model.User({
            cardNum: '213171610',
            indentityType: '管理员',
            Institute: '管理',
            name: '赵拯基',
            token: 'hisauhdgigd78969',
        });
        let res = await newWorker.save();
        console.log(res);
    }
    
    async find() {
        //查找人员信息
        const { ctx } = this;
        let person = await this.ctx.model.User.find();
        console.log(person);
    }


}

module.exports = TestController;