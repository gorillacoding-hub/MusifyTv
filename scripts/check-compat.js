#!/usr/bin/env node
/* Guards the Tizen 4.0 / Chromium 56 target: fails on syntax or APIs newer than M56. */
'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..', 'src');
var bad = 0;

function strip(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
}
function files(dir, ext) {
  return fs.readdirSync(dir).filter(function (f) { return f.slice(-ext.length) === ext; })
    .map(function (f) { return path.join(dir, f); });
}
function report(file, rule, line) {
  bad++;
  console.error('FAIL ' + path.relative(root, file) + ':' + line + '  ' + rule);
}
function scan(file, rules) {
  var text = strip(fs.readFileSync(file, 'utf8')).split('\n');
  text.forEach(function (l, i) {
    rules.forEach(function (r) { if (r[0].test(l)) { report(file, r[1], i + 1); } });
  });
}

var JS_RULES = [
  [/=>/, 'arrow function (ES6 is allowed in M56 but this project is kept ES5 for safety)'],
  [/`/, 'template literal'],
  [/\b(let|const)\s/, 'let/const'],
  [/\b(async|await)\b/, 'async/await'],
  [/\.\.\./, 'spread/rest'],
  [/\?\./, 'optional chaining (needs Chrome 80)'],
  [/\?\?/, 'nullish coalescing (needs Chrome 80)'],
  [/\bclass\s+\w/, 'class syntax'],
  [/padStart|padEnd/, 'String.padStart/padEnd (needs Chrome 57)'],
  [/\.flat\(|flatMap|fromEntries/, 'Array.flat/flatMap/Object.fromEntries (needs Chrome 69+)'],
  [/\.finally\(|allSettled/, 'Promise.finally/allSettled (needs Chrome 63+)'],
  [/AbortController/, 'AbortController (needs Chrome 66)'],
  [/\bfetch\(/, 'fetch is avoided - XHR is used for maximum compatibility']
];
var CSS_RULES = [
  [/display\s*:\s*(inline-)?grid/, 'CSS Grid (needs Chrome 57)'],
  [/grid-template/, 'CSS Grid (needs Chrome 57)'],
  [/(^|[;{\s])gap\s*:/, 'gap property (flex gap needs Chrome 84)'],
  [/aspect-ratio/, 'aspect-ratio (needs Chrome 88)'],
  [/\binset\s*:/, 'inset (needs Chrome 87)'],
  [/(margin|padding)-(inline|block)/, 'logical properties (need Chrome 69)'],
  [/:is\(|:where\(/, ':is/:where (need Chrome 88)'],
  [/backdrop-filter/, 'backdrop-filter (needs Chrome 76)'],
  [/position\s*:\s*sticky/, 'position: sticky (needs Chrome 56 prefix/57)']
];

files(path.join(root, 'js'), '.js').forEach(function (f) {
  try { new vm.Script(fs.readFileSync(f, 'utf8'), { filename: f }); }
  catch (e) { bad++; console.error('FAIL syntax ' + f + ': ' + e.message); }
  scan(f, JS_RULES);
});
files(path.join(root, 'css'), '.css').forEach(function (f) { scan(f, CSS_RULES); });

/* config.xml must target Tizen 4.0 TV */
var cfg = fs.readFileSync(path.join(root, 'config.xml'), 'utf8');
if (!/required_version="4\.0"/.test(cfg)) { bad++; console.error('FAIL config.xml: required_version must be 4.0'); }
if (!/<tizen:profile name="tv"\/>/.test(cfg)) { bad++; console.error('FAIL config.xml: profile must be tv'); }
var m = /<tizen:application id="([^"]+)" package="([^"]+)"/.exec(cfg);
if (!m || m[1].split('.')[0] !== m[2] || m[2].length !== 10) { bad++; console.error('FAIL config.xml: application id must be <10-char package>.<name>'); }
['index.html', 'icon.png'].forEach(function (f) {
  if (!fs.existsSync(path.join(root, f))) { bad++; console.error('FAIL missing src/' + f); }
});
/* every script referenced by index.html must exist */
(fs.readFileSync(path.join(root, 'index.html'), 'utf8').match(/(?:src|href)="[^"$]+\.(?:js|css)"/g) || []).forEach(function (a) {
  var rel = a.replace(/^[^"]+"|"$/g, '');
  if (!fs.existsSync(path.join(root, rel))) { bad++; console.error('FAIL index.html references missing ' + rel); }
});

if (bad) { console.error('\n' + bad + ' problem(s) found'); process.exit(1); }
console.log('OK - sources are compatible with Tizen 4.0 / Chromium 56');
