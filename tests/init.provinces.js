import fs from 'fs';

const db = require('../config/db.config');
import Province from '../models/province.model';

fs.readFile('./provinces.json', { 'encoding': 'utf8' }, (err, data) => {
  let provinces = JSON.parse(data);

  provinces.map(p => {
    let province = new Province({
      "code": p.code,
      "cnName": p.name,
      "pinyin": p.enName,
    });

    province.save().then((p) => {
      console.log(p.cnName + " " + p.pinyin + " saved");
    });
  });
})
