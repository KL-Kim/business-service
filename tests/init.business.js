const db = require('../config/db.config');
import Business from '../models/business.model';
import Category from '../models/category.model';

let business, i;

Category.findOne({ code: 11 }).exec()
  .then(category => {
    let yidaba = new Business({
      cnName: "一大把",
      krName: "이따바",
      enName: "yidaba",
      tel: '123-1234-1234',
      category: category._id.toString(),
      status: 'PUBLISHED',
    });

    yidaba.save((err, item) => {
      if (err) throw err;

      console.log(item.enName, ' saved');
    });

    let xilaiguan = new Business({
      cnName: "喜来馆",
      krName: "희래관",
      enName: "xilaiguan",
      tel: '123-1234-1234',
      category: category._id.toString(),
      status: 'PUBLISHED',
    });

    xilaiguan.save((err, item) => {
      if (err) throw err;

      console.log(item.enName, ' saved');
    });

    for(i = 1; i <= 100; i++) {
      business = new Business({
        cnName: i,
        krName: i,
        enName: i,
        category: category._id.toString(),
        tel: i,
        status: 'PUBLISHED',
      });

      business.save().then(item => {
        console.log(item.cnName + " saved");
      });
    }
  })
  .catch(err => {
    throw err;
  })
