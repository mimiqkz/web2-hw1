const express = require('express');
const path = require('path');
const router = require('./articles.js');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/articles')));

app.use('/', router);
app.listen(3000, () => {
  console.info('Running at port 3000');
});
