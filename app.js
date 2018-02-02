const express = require('express');
const path = require('path');
const router = require('./articles.js');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/articles')));

function notFoundHandler(err, req, res, next) {
  console.error(err.stack)
  res.status(404).render('errorpage', { title: "Villa kom up", text: "Síða fannst ekki" });
  
}

function errorHandler(err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
  res.render('errorpage', { title: "Internal error", text: ""});
  next(err);
}



app.use('/', router);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(3000, () => console.log('App listening on port 3000!'))
