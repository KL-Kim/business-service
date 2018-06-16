const db = require('../config/db.config');
import Business from '../models/business.model';

  let business, i;

  let yidaba = new Business({
    cnName: "一大把",
    krName: "이따바",
    enName: "yidaba",
    tel: '123-1234-1234',
    category: '5ad88808331a4fc6ed18298f',
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
    category: '5ad88808331a4fc6ed18298f',
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
      category: '5ad88808331a4fc6ed18298f',
      tel: i,
      status: 'PUBLISHED',
    });

    business.save().then(item => {
      console.log(item.cnName + " saved");
    });
  }
