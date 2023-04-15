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
        if (doc.value) {
          doc.value = Buffer.from(doc.value).toString();
        }
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
      } else {
        console.log(result);
        res.send(result);
      }
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
        res.status(400).json({ error: err });
      } else {
        console.log(result);
        res.json(result.insertId);
      }
    });
  });
});

router.post('/save', (req, res) => {
  console.log(req.body);
  let value = req.body.value;
  const escString = database.escape(value);
  console.log(escString);

  database.connect((err) => {
    if (err) {
      console.error('conError', err);
    }

    const sql = `UPDATE documents SET value = ${escString} WHERE id = ${req.body.id}`;

    database.query(sql, (err, result) => {
      if (err) {
        console.error('queryError', err);
      } else {
        res.json(req.body);
      }
    });
  });
});

router.post('/delete', (req, res) => {
  console.log(req.body);
  let id = req.body.id;

  database.connect((err) => {
    if (err) {
      console.error('conError', err);
    }

    const sql = `DELETE FROM documents WHERE id = "${id}"`;

    database.query(sql, (err, result) => {
      if (err) {
        console.error('queryError', err);
      } else {
        res.json(result);
      }
    });
  });
});

module.exports = router;
