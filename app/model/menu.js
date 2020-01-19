'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const Menu = new Schema({
    title: { type: String }, // 显示标题
    level: { type: Number }, // 菜单级别 1/2
    position: { type: String }, // 菜单位置 LEFT/CENTER/RIGHT
    url: { type: String },
    order: { type: Number, default: 0 }, // 菜单排序
  });
  return mongoose.model('Menu', Menu);
}
;
