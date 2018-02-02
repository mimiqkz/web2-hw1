/* útfæra greina virkni */
const express = require('express');
const path = require('path');
const router = express.Router();
const fs = require('fs'),
      fm = require('front-matter'),
      util = require('util'),
      marked = require('marked'),
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

async function getMarkDown(data, slug, next) {
      let result = [];
      for(let i = 0; i < data.length; i++) {
            if(data[i].attributes.slug == slug) {
                  result.push(data[i].attributes.title);
                  result.push(marked(data[i].body));
            }
      }
      if(result[0] == null){
            next();
      }else {
            return result;
      }
}
async function getFrontMatter(data) {
      let fm = [];
      for(let i = 0; i < data.length; i++) {
            fm.push(data[i].attributes);
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
            .catch(err => res.status(500));
});

router.get('/:slug', (req, res, next) => {      
      getContent()
            .then(data => getMarkDown(data, req.params.slug, next))
            .then(data => res.render('article', { title: data[0], text: data[1] }))
            .catch(err => console.error(err));
});

router.use((req, res) => {
      res.status(404);
      res.render('errorpage', { title: "Villa kom up", text: "Síða fannst ekki" });

});

router.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500);
      res.render('errorpage', { title: "Villa kom up", text: "Something broke!" });
      next(err);
});

module.exports = router;