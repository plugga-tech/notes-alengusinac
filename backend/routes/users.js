var express = require('express');
var router = express.Router();
const database = require('../database');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/create', (req, res) => {
  console.log(req.body);

  database.connect((err) => {
    if (err) {
      console.error('conError', err);
    }
    const sql = `INSERT INTO users (username, password) VALUES ("${req.body.username}", "${req.body.password}")`;

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
