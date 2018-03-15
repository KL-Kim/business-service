import fs from 'fs';

const db = require('../config/db.config');
import City from '../models/city.model';

fs.readFile('./cities.json', { 'encoding': 'utf8' }, (err, data) => {
  let cities = JSON.parse(data);

  cities.map(item => {
    let city = new City({
      "code": item.code,
      "provinceCode": item.provinceCode,
      "cnName": item.name,
      "pinyin": item.enName,
    });

    city.save().then((p) => {
      console.log(p.cnName + " " + p.pinyin + " saved");
    });
  });
});
