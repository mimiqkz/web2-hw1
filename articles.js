/* útfæra greina virkni */
const express = require('express');
const fs = require('fs');
const fm = require('front-matter');
const util = require('util');
const marked = require('marked');
const dateFormat = require('dateformat');

const router = express.Router();
const dir = './articles/';
const readFileAsync = util.promisify(fs.readFile);
const readDirAsync = util.promisify(fs.readdir);


async function getFiles(file) {
  const data = await readDirAsync(file);
  const index = data.indexOf('img');
  data.splice(index, 1);
  return data;
}
async function getArticles(files) {
  const atts = files.map(async (f) => {
    const data = await readFileAsync(dir + f, 'utf8');
    const att = (fm(data));
    return att;
  });
  return Promise.all(atts);
}

async function getMarkDown(data, next) {
  if (data !== undefined) {
    const result = [];
    result.push(data.attributes.title);
    result.push(marked(data.body));
    return result;
  }
  return next();
}

async function checkSlug(data, slug, next) {
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].attributes.slug === slug) {
      return data[i];
    }
  }
  return next();
}

function convertDateFormate(date) {
  const b = dateFormat(date, 'dd.mm.yyyy');
  return b;
}
async function getFrontMatter(data) {
  const frontMatter = [];
  for (let i = 0; i < data.length; i += 1) {
    frontMatter.push(data[i].attributes);
  }
  frontMatter.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  for (let i = 0; i < data.length; i += 1) {
    frontMatter[i].date = convertDateFormate(frontMatter[i].date);
  }
  return frontMatter;
}

async function getContent() {
  const files = await getFiles(dir);
  const data = await getArticles(files);
  return data;
}
router.get('/', (req, res) => {
  getContent()
    .then(data => getFrontMatter(data))
    .then(data => res.render('index', { title: 'Greinarsafnið', frontmatter: data }))
    .catch(err => console.error(err));
});
router.get('/:slug', (req, res, next) => {
  getContent()
    .then(data => checkSlug(data, req.params.slug, next))
    .then(data => getMarkDown(data, next))
    .then(data => res.render('article', { title: data[0], text: data[1] }))
    .catch(err => console.error(err));
});

router.use((req, res) => {
  res.status(404);
  res.render('errorpage', { title: 'Villa kom up', text: 'Síða fannst ekki' });
});

router.use((err, req, res, next) => {
  res.status(500);
  res.render('errorpage', { title: 'Villa kom up', text: 'Something broke!' });
  next(err);
});

module.exports = router;
