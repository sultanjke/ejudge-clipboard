const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const script = readFileSync(path.join(__dirname, '..', 'ejudge-clipboard.user.js'), 'utf8');

function environment(pathname = '/new-client', before = '') {
  const context = vm.createContext({ console: { info() {}, warn() {} }, setTimeout() {} });
  vm.runInContext(`
    var window = globalThis;
    var location = { pathname: ${JSON.stringify(pathname)} };
    var listeners = [];
    window.addEventListener = function(...args) { listeners.push(args); };
    var originalListener = window.addEventListener;
    var originalDefineProperty = Object.defineProperty;
    var Clipboard = class Clipboard {
      readText() { return 'native'; }
      read() { return 'native'; }
      writeText() { return 'native'; }
      write() { return 'native'; }
    };
    var nativeReadText = Clipboard.prototype.readText;
    var creations = [];
    var commands = [];
    var monaco = {
      KeyMod: { CtrlCmd: 2048, Shift: 1024 },
      KeyCode: { KeyV: 52, KeyC: 33, KeyX: 54, Insert: 19, Delete: 20, F1: 59, F11: 69, Enter: 3 },
      editor: { create: function(box, options) {
        creations.push(options);
        return { addCommand: function(...args) { commands.push(args); return 'command-id'; } };
      } }
    };
    var savedMonaco = monaco;
    delete window.monaco;
    function installLoader() {
      // Reproduce the loader's initial configuration object, then function assignment.
      window.require = { paths: {} };
      window.require = function(deps, callback) {
        window.monaco = savedMonaco;
        return callback.call({ marker: 'callback-this' }, savedMonaco);
      };
      window.require.config = function(config) { window.loaderConfig = config; };
    }
    ${before}
  `, context);
  vm.runInContext(script, context);
  return context;
}

test('omits supplied capture blockers while preserving ordinary event handlers', () => {
  const context = environment();
  assert.equal(vm.runInContext(`
    function blockClip(e) {
      if (!(box.contains(e.target) || e.target === ta)) return;
      e.preventDefault(); e.stopImmediatePropagation(); flash(MSG[e.type] || MSG.paste);
    }
    var initial = listeners.length;
    ['paste', 'copy', 'cut', 'drop'].forEach(function(t) {
      window.addEventListener(t, blockClip, true);
    });
    window.addEventListener('paste', function normalPaste() {}, true);
    window.addEventListener('paste', blockClip, false);
    window.addEventListener('keydown', blockClip, true);
    listeners.length - initial;
  `, context), 3);
});

test('preserves native clipboard methods and forwards unrelated property definitions', () => {
  const context = environment();
  assert.equal(vm.runInContext(`
    var deny = function() { flash(MSG.paste); return Promise.reject(new Error('clipboard disabled')); };
    ['readText', 'read', 'writeText', 'write'].forEach(function(k) {
      Object.defineProperty(Clipboard.prototype, k, { value: deny, configurable: true });
    });
    var other = {};
    var result = Object.defineProperty(other, 'value', { value: 42 });
    Clipboard.prototype.readText === nativeReadText &&
      ['readText', 'read', 'writeText', 'write'].every(k => new Clipboard()[k]() === 'native') &&
      result === other && other.value === 42;
  `, context), true);
});

for (const earlyLoader of [false, true]) {
  test(`hooks Monaco before setup; loader initialized ${earlyLoader ? 'before' : 'after'} userscript`, () => {
    const context = environment('/new-client', earlyLoader ? 'installLoader();' : '');
    assert.equal(vm.runInContext(`
      ${earlyLoader ? '' : 'installLoader();'}
      window.require.config({ paths: { vs: '/ejudge/monaco/vs' } });
      var callbackResult = window.require(['vs/editor/editor.main'], function(module) {
        if (module !== savedMonaco || this.marker !== 'callback-this') throw new Error('callback changed');
        var options = {
          contextmenu: false, dragAndDrop: false, selectionClipboard: false,
          copyWithSyntaxHighlighting: false, value: 'draft', language: 'python'
        };
        var editor = monaco.editor.create({}, options);
        var K = monaco.KeyMod, C = monaco.KeyCode;
        editor.addCommand(K.CtrlCmd | C.Enter, function doSubmit() {});
        editor.addCommand(C.F11, function fullscreen() {});
        [[K.CtrlCmd | C.KeyV, 'paste'], [K.CtrlCmd | K.Shift | C.KeyV, 'paste'],
         [K.Shift | C.Insert, 'paste'], [K.CtrlCmd | C.KeyC, 'copy'],
         [K.CtrlCmd | C.Insert, 'copy'], [K.CtrlCmd | C.KeyX, 'cut'],
         [K.Shift | C.Delete, 'cut']].forEach(function(kb) {
          editor.addCommand(kb[0], function() { flash(MSG[kb[1]]); });
        });
        editor.addCommand(C.F1, function() { flash('Command palette is disabled during the exam'); });
        editor.addCommand(K.CtrlCmd | C.KeyV, function legitimateCommand() {});
        if (options.contextmenu !== false) throw new Error('input options mutated');
        return 'original-return';
      });
      creations[0].contextmenu && creations[0].dragAndDrop && creations[0].selectionClipboard &&
        creations[0].value === 'draft' && creations[0].language === 'python' &&
        commands.length === 3 && commands[0][1].name === 'doSubmit' &&
        commands[1][1].name === 'fullscreen' && commands[2][1].name === 'legitimateCommand' &&
        callbackResult === 'original-return' && loaderConfig.paths.vs === '/ejudge/monaco/vs';
    `, context), true);
  });
}

test('does not modify other editor configurations', () => {
  const context = environment();
  assert.equal(vm.runInContext(`
    installLoader();
    window.require(['vs/editor/editor.main'], function() {
      var options = { contextmenu: false, value: 'other' };
      var editor = monaco.editor.create({}, options);
      editor.addCommand(monaco.KeyCode.F1, function() { flash('Command palette is disabled during the exam'); });
      if (creations[0] !== options) throw new Error('options changed');
    });
    commands.length === 1;
  `, context), true);
});

test('does not install on a different path matched by the metadata wildcard', () => {
  const context = environment('/new-client-other');
  assert.equal(vm.runInContext(`
    window.addEventListener === originalListener && Object.defineProperty === originalDefineProperty &&
      !Object.getOwnPropertyDescriptor(window, 'require');
  `, context), true);
});
