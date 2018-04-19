import fs from 'fs';

const db = require('../config/db.config');
import Category from '../models/category.model';

Category.remove({}, function(err) {
	if (err) throw err;

	console.log("Clear mongodb documents");

  fs.readFile('./categories.json', { 'encoding': 'utf8' }, (err, data) => {
    if (err) throw err;

    let categories = JSON.parse(data);

    categories.map(c => {
      const category = new Category({
        "code": c.code,
        "krName": c.krName,
        "cnName": c.cnName,
        "enName": c.enName,
        "parent": c.parent,
      });

      category.save().then((c) => {
        console.log(c.krName + " " + " saved");
      });
    });

  });
});


