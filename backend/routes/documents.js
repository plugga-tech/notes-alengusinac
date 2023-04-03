var express = require('express');
var router = express.Router();
const database = require('../database');

router.post('/create', (req, res) => {
  console.log(req.body);

  database.connect((err) => {
    if (err) {
      console.error('conError', err);
    }
    const sql = `INSERT INTO documents (title, description, value) VALUES ("${req.body.username}", "${req.body.password}")`;

    database.query(sql, (err, result) => {
      if (err) {
        console.error('queryError', err);
      }
      console.log(result);
      res.json(result);
    });
  });
});

module.exports = router;
