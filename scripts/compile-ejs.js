#!/usr/bin/env node

'use strict';

const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const mkdirp = require('mkdirp');
const html_base_path = path.join('server', 'public', 'html');
mkdirp(html_base_path);

function render(filename, args) {
  const ejs_path = path.join('server', 'views', `${filename}.ejs`);
  const html_path = path.join('server', 'public', 'html', `${filename}.html`);

  fs.readFile(ejs_path, (err, contents) => {
    if (err)
      throw err;

    contents = contents.toString();
    const html = ejs.render(contents, args);

    fs.writeFile(html_path, html, err => {
      if (err)
        throw err;
    });
  });
}

render('annotatrix', {
  username: null
});
render('help', {});
render('index', {
  base: null,
  error: null,
  treebanks: []
});
