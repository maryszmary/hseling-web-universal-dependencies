'use strict';

const $ = require('jquery');
const _ = require('underscore');
const nx = require('notatrix');

const cfg = require('./config');
const funcs = require('./funcs');
const GUI = require('./gui');
const Graph = require('./graph');
const errors = require('./errors');
const detectFormat = require('./detect');

nx.Sentence.prototype.currentFormat = null;

class Manager {

  constructor() {
    this.reset();
  }

  reset() {
    this.filename = cfg.defaultFilename;

    this._sentences = [];
    this._index = -1;
  }
  get length() {
    return this._sentences.length;
  }
  each(callback) {
    return this._sentences.map((sentence, i) => {
      return callback(i, sentence);
    });
  }





  get index() {
    return this._index;
  }
  set index(index) {

    index = parseInt(index);
    if (isNaN(index)) {
      log.warn(`Annotatrix: index out of range: ${index}`);
      index = this.index;

    } else if (index < 0 && this.length) {
      log.warn(`Annotatrix: index out of range: ${index + 1}`);
      index = 0;

    } else if (index > this.length - 1) {
      log.warn(`Annotatrix: index out of range: ${index + 1}`);
      index = this.length - 1;
    }

    this._index = Math.floor(index); // enforce integer
    gui.update();

    return this.index;
  }
  first() {
    this.index = this.length ? 0 : -1;
  }
  prev() {
    if (!this.length)
      return null;

    if (this.index === 0) {
      log.warn(`Annotatrix: already at the first sentence!`);
      return null;
    }

    this.index--;
    return this.sentence;
  }
  next() {
    if (this.index === this._sentences.length - 1) {
      log.warn(`Annotatrix: already at the last sentence!`);
      return null;
    }

    this.index++;
    return this.sentence;
  }
  last() {
    this.index = this.length - 1;
  }





  get current() {
    return this._sentences[this.index];
  }
  get sentence() {
    if (!this.current)
      return null;

    return this.current.text;
  }
  set sentence(text) {
    return this.setSentence(text);
  }
  get sentences() {
    return this.each((i, sent) => {
      return sent.text;
    });
  }
  setSentence(index, text) {

    if (text === null || text === undefined) { // if only passed 1 arg
      text = index || '';
      index = this.index;
    }

    if (0 > index || index > this.length - 1)
      return null;

    this.getSentence(index).text = text;
    this.getSentence(index).currentFormat = detectFormat(text);
    gui.update();

    return this.getSentence(index);
  }
  getSentence(index) {

    if (index === undefined)
      index = this.index;

    if (0 > index || index > this.length - 1)
      return null;

    return this._sentences[index];
  }
  insertSentence(index, text) {

    if (text === null || text === undefined) { // if only passed 1 arg
      text = index;
      index = this.index + 1;
    }

    index = parseFloat(index);
    if (isNaN(index))
      throw new errors.AnnotatrixError('cannot insert at NaN');

    if (typeof text !== 'string')
      text = '';

    index = index < 0 ? 0
      : index > this.length ? this.length
      : parseInt(index);

    const sent = nx.Sentence.fromText(text);
    this._sentences = this._sentences.slice(0, index)
      .concat(sent)
      .concat(this._sentences.slice(index));

    sent.currentFormat = detectFormat(text);
    sent.is_table_view = false;
    sent.column_visibilities = new Array(10).fill(true);

    this.index = index;
    gui.update();

    return sent.text;
  }
  removeSentence(index) {

    if (!this.length)
      return null;

    if (index === undefined) // if not passed args
      index = this.index;

    index = parseFloat(index);
    if (isNaN(index))
      throw new errors.AnnotatrixError('cannot insert at NaN');

    index = index < 0 ? 0
      : index > this.length - 1 ? this.length - 1
      : parseInt(index);

    const removed = this._sentences.splice(index, 1)[0];
    if (!this.length)
      this.insertSentence();
    this.index--;

    gui.update();

    return removed;
  }
  pushSentence(text) {
    return this.insertSentence(Infinity, text);
  }
  popSentence(text) {
    return this.removeSentence(Infinity);
  }





  split(text) {

    // split into sentences
    let splitted;
    if (detectFormat(text) === 'plain text') {

      // match non-punctuation (optionally) followed by punctuation
      const matched = text.match(/[^.!?]+[.!?]*/g);
      log.debug(`parse(): match group: ${matched}`);
      splitted = matched === null
        ? [ text.trim() ]
        : matched;

    } else {

      // match between multiple newlines
      splitted = text.split(/\n{2,}/g).map(chunk => {
        return chunk.trim();
      });
    }

    // removing extra whitespace in reverseorder
    for (let i = splitted.length - 1; i >= 0; i--) {
        if (splitted[i].trim() === '')
            splitted.splice(i, 1);
    }
    return splitted.length ? splitted : [ '' ]; // need a default if empty

  }
  parse(text) {

    // if not passed explicitly, read from the textarea
    text = text || gui.read('text-data');
    let splitted = this.split(text);

    // overwrite contents of #text-data
    this.sentence = splitted[0];

    // iterate over all elements except the first
    _.each(splitted, (split, i) => {
      if (!i) return; // skip first
      this.insertSentence(split);
    });

    gui.update();
  }





  get format() {
    if (this.current)
      return this.current.currentFormat;
  }
  get comments() {
    if (this.current)
      return this.current.comments;
  }
  get tokens() {
    if (this.current)
      return this.current.tokens;
  }
  get conllu() {
    if (this.current)
      return this.current.conllu;
  }
  get cg3() {
    if (this.current)
      return this.current.cg3;
  }





  export() {
    return this.each((i, sent) => {
      return `[UD-Annotatrix: id="${i+1}" format="${manager.format}"]
      ${ (manager.format === 'Unknown') ? '' : this.sentence }`;
    }).join('\n\n');
  }
  encode() {
    return encodeURIComponent(this.export());
  }

}

module.exports = Manager;
