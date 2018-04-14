import fs from 'fs';

const db = require('../config/db.config');
import Tag from '../models/tag.model';

Tag.remove({}, function(err) {
	if (err) throw err;

	console.log("Clear mongodb documents");
});

fs.readFile('./tags.json', { 'encoding': 'utf8' }, (err, data) => {
  if (err) throw err;

  let tags = JSON.parse(data);

  tags.map(t => {
    const tag = new Tag({
      "code": t.code,
      "krName": t.krName,
      "cnName": t.cnName,
      "enName": t.enName,
      "parent": t.parent,
    });

    tag.save().then((t) => {
      console.log(t.krName + " " + " saved");
    });
  });

});
