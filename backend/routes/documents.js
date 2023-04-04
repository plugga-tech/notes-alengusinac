var express = require('express');
var router = express.Router();
const database = require('../database');

router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  console.log(userId);
  database.connect((err) => {
    if (err) {
      console.error('conError', err);
    }

    const sql = `SELECT * FROM documents WHERE userId = ${userId}`;

    database.query(sql, (err, result) => {
      if (err) {
        console.error('queryError', err);
      }
      console.log(result);
      res.send(result);
    });
  });
});

router.post('/create', (req, res) => {
  console.log(req.body);

  database.connect((err) => {
    if (err) {
      console.error('conError', err);
    }
    const sql = `INSERT INTO documents (userID, title, description) VALUES ("${req.body.user.id}", "${req.body.title}", "${req.body.description}")`;

    database.query(sql, (err, result) => {
      if (err) {
        console.error('queryError', err);
      }
      console.log(result);
      res.json(result.insertId);
    });
  });
});

module.exports = router;
