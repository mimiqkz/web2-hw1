/* útfæra greina virkni */
const express = require('express');
const path = require('path');
const router = express.Router();
const fs = require('fs'),
      fm = require('front-matter'),
      util = require('util'),
      markdownIt = require('markdown-it'),
      dateFormat = require('dateformat');

const dir = './articles/';

const readFileAsync = util.promisify(fs.readFile),
      readDirAsync = util.promisify(fs.readdir);


async function getFiles(file) {
      const data = await readDirAsync(file);
      const index = data.indexOf("img");
      data.splice(index, 1);
      return data;
} 

async function getArticles(files) {
      const atts = files.map(async (f) => {
            const data = await readFileAsync(dir + f, 'utf8')
            const att = (fm(data));
            return att;
      });
      return Promise.all(atts);
}

async function getMarkDown(content) {
      const md = new markdownIt();
      return md.render(content);
}

async function getFrontMatter(data) {
      let fm = [];
      for(let i = 0; i < data.length; i++) {
            fm.push(data[i].attributes);
            //convertDateFormate(data[i].attributes.date);
      }
      fm.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
      });
      for (let i = 0; i < data.length; i++) {
        fm[i].date = convertDateFormate(fm[i].date);
      }
      return fm;
}

function convertDateFormate(date) {
      const b = dateFormat(date, "dd.mm.yyyy");
      console.log(new Date(b))
      return b;
}

async function getContent() {
      const files = await getFiles(dir);
      const data = await getArticles(files);
      return data;
}

router.get('/', (req, res) => {
      getContent()
            .then(data => getFrontMatter(data))
            .then(data => res.render('index', {title: "Greinarsafnið", frontmatter: data}))
            .catch(err => console.log(err));
});

router.get('/:slug', (req, res) => {
      getContent()
            .then(data => getMarkDown(data))
            .then(data => res.render('article', { title: "hah", text: data }))
            .catch(err => console.log(err));

});

module.exports = router;