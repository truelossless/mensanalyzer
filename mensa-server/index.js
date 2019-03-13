const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const db = new sqlite3.Database('eat.db');
const app = express();

// CORS
app.use(cors({
  origin:['http://localhost:8080'],
  methods:['GET','POST'],
  credentials: true // enable set cookie
}));

// support for POST messages
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/api/food/all', (req, res) => {
    db.all('SELECT * FROM food ORDER BY name', (err, rows) => {
        res.send(rows);
    });
});

app.get('/api/menu/all', (req, res) => {
    let sql = `SELECT menu.date,
        GROUP_CONCAT(food.type) AS types,
        GROUP_CONCAT(food.name) AS foods,
        ROUND(SUM(food.price), 2) AS y
        FROM menu
        INNER JOIN meal ON menu.id = meal.menu_id
        INNER JOIN food ON meal.food_id = food.id
        GROUP BY menu.id
    `;
    db.all(sql, (err, rows) => {
        if(err) res.send(err);
        res.send(rows);
    });
});

app.post('/api/menu/submit', (req, res) => {
    let sql = 'INSERT INTO menu (date) VALUES (?)';
    let stmt = db.prepare(sql);
    stmt.run(req.body.date, (err) => {

        let mealSql = 'INSERT INTO meal (menu_id, food_id) VALUES(?, ?)';
        let mealStmt = db.prepare(mealSql);
        for(let i=0; i<req.body.foods.length; i++) {
            mealStmt.run(stmt.lastID, req.body.foods[i].foodId);
        }

        res.send('OK');
    });
});

app.post('/api/food/register', (req, res) => {
    let sql = 'INSERT INTO food (name, type, price) VALUES (?, ?, ?)';
    let stmt = db.prepare(sql);
    stmt.run(req.body.name, req.body.type, req.body.price, (err) => {
        res.send('OK');
    });

});

app.use('/', express.static('public'));

app.listen(8083);