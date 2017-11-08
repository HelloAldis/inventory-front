const map = {
  '客餐厅': 'item1.jpg',
  '餐厅': 'item2.jpg',
  '客厅': 'item3.jpg',
  '主卧': 'item4.jpg',
  '次卧': 'item5.jpg',
  '儿童房': 'item6.jpg',
  '衣帽间': 'item7.jpg',
  '厨房': 'item8.jpg',
  '主卫': 'item9.jpg',
  '客卫': 'item10.jpg',
  '餐厅': 'item2.jpg',
  '书房': 'item11.jpg'
}

exports.getImageForQuotationItem = function (name) {
  return '/m/img/quotation/' + map[name];
};
