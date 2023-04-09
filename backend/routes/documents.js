var express = require('express');
var router = express.Router();
const database = require('../database');

router.get('/:id', (req, res) => {
  const id = req.params.id;
  console.log(id);
  database.connect((err) => {
    if (err) {
      console.error('conError', err);
    }

    const sql = `SELECT * FROM documents WHERE id = ${id} LIMIT 1`;

    database.query(sql, (err, result) => {
      if (err) {
        console.error('queryError', err);
      }
      result.forEach((doc) => {
        doc.value = Buffer.from(doc.value).toString();
      });

      console.log(result);
      res.send(result);
    });
  });
});

router.get('/user/:userId', (req, res) => {
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

router.post('/save', (req, res) => {
  console.log(req.body);

  database.connect((err) => {
    if (err) {
      console.error('conError', err);
    }
    const sql = `UPDATE documents SET value = '${req.body.value}' WHERE id = ${req.body.id}`;

    database.query(sql, (err, result) => {
      if (err) {
        console.error('queryError', err);
      } else {
        res.json(req.body);
      }
    });
  });
});

module.exports = router;