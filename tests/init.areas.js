import fs from 'fs';

const db = require('../config/db.config');
import Area from '../models/area.model';

fs.readFile('./areas.json', { 'encoding': 'utf8' }, (err, data) => {
  let cities = JSON.parse(data);

  cities.map(item => {
    let area = new Area({
      "code": item.code,
      "provinceCode": item.provinceCode,
      "cityCode": item.cityCode,
      "cnName": item.name,
      "pinyin": item.enName,
    });

    area.save().then((item) => {
      console.log(item.cnName + " " + item.pinyin + " saved");
    });
  });
});
