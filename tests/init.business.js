const db = require('../config/db.config');
import Business from '../models/business.model';

  let business, i;

  let yidaba = new Business({
    cnName: "一大把",
    krName: "이따바",
    enName: "yidaba",
    tel: '123-1234-1234',
    category: '5ad88808331a4fc6ed18298f'
  });

  yidaba.save();

  let xilaiguan = new Business({
    cnName: "喜来馆",
    krName: "희래관",
    enName: "xilaiguan",
    tel: '123-1234-1234',
    category: '5ad88808331a4fc6ed18298f'
  });

  xilaiguan.save();

  for(i = 1; i <= 100; i++) {
    business = new Business({
      cnName: i,
      krName: i,
      enName: i,
      category: '5ad88808331a4fc6ed18298f',
      tel: i,
      state: 'published',
    });

    business.save().then(item => {
      console.log(item.cnName + " saved");
    });
  }
