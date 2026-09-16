// ==UserScript==
// @name         ejudge.kz — copy/paste disabler bypasser
// @namespace    local.ejudge.clipboard
// @version      1.0.0
// @author       sultanjke
// @description  Userscript that restores copy, cut, paste, and context-menu actions in the ejudge.kz code editor.
// @match        https://ejudge.kz/new-client*
// @run-at       document-start
// @sandbox      raw
// @grant        none
// @noframes
// ==/UserScript==

(() => {
  'use strict';
  if (location.pathname !== '/new-client') return;

  const prefix = '[ejudge clipboard]';
  const sourceOf = Function.prototype.toString;
  const defineProperty = Object.defineProperty;
  const clipboardEvents = new Set(['paste', 'copy', 'cut', 'drop']);
  const clipboardMethods = new Set(['readText', 'read', 'writeText', 'write']);
  const patchedAPIs = new WeakSet();
  const wrappedRequires = new WeakMap();
  let editorCount = 0;

  function source(fn) {
    return typeof fn === 'function' ? sourceOf.call(fn) : '';
  }

  // Let native events reach Monaco; omit only the supplied warning handler.
  const addEventListener = window.addEventListener;
  window.addEventListener = function(type, listener, options) {
    const capture = options === true || Boolean(options && options.capture);
    const body = source(listener);
    if (this === window && clipboardEvents.has(type) && capture &&
        body.includes('box.contains(e.target)') &&
        body.includes('stopImmediatePropagation') &&
        /flash\s*\(\s*MSG\[e\.type\]/.test(body)) {
      return;
    }
    return Reflect.apply(addEventListener, this, arguments);
  };

  // Preserve the browser implementations before the page replaces them.
  const clipboardPrototype = window.Clipboard && window.Clipboard.prototype;
  Object.defineProperty = function(target, key, descriptor) {
    if (clipboardPrototype && target === clipboardPrototype &&
        clipboardMethods.has(key) && descriptor &&
        source(descriptor.value).includes('clipboard disabled') &&
        /flash\s*\(\s*MSG\.paste\s*\)/.test(source(descriptor.value))) {
      return target;
    }
    return Reflect.apply(defineProperty, Object, arguments);
  };

  function patchMonaco(monaco) {
    const api = monaco && monaco.editor;
    if (!api || typeof api.create !== 'function') return false;
    if (patchedAPIs.has(api)) return true;
    patchedAPIs.add(api);

    const create = api.create;
    api.create = function(container, options, ...rest) {
      const target = options && options.contextmenu === false &&
        options.dragAndDrop === false && options.selectionClipboard === false &&
        options.copyWithSyntaxHighlighting === false;
      const settings = target ? {
        ...options, contextmenu: true, dragAndDrop: true, selectionClipboard: true,
      } : options;
      const editor = Reflect.apply(create, this, [container, settings, ...rest]);
      if (!target) return editor;

      const K = monaco.KeyMod;
      const C = monaco.KeyCode;
      const clipboardKeys = new Set([
        K.CtrlCmd | C.KeyV, K.CtrlCmd | K.Shift | C.KeyV, K.Shift | C.Insert,
        K.CtrlCmd | C.KeyC, K.CtrlCmd | C.Insert, K.CtrlCmd | C.KeyX,
        K.Shift | C.Delete,
      ]);
      const addCommand = editor.addCommand;
      editor.addCommand = function(keybinding, handler) {
        const body = source(handler);
        const clipboardWarning = clipboardKeys.has(keybinding) &&
          /flash\s*\(\s*MSG\[kb\[1\]\]\s*\)/.test(body);
        const paletteWarning = keybinding === C.F1 &&
          body.includes('Command palette is disabled during the exam');
        if (clipboardWarning || paletteWarning) return null;
        return Reflect.apply(addCommand, this, arguments);
      };

      editorCount++;
      console.info(prefix, 'Clipboard restrictions intercepted for editor', editorCount);
      return editor;
    };
    return true;
  }

  function wrapRequire(requireFunction) {
    if (typeof requireFunction !== 'function') return requireFunction;
    if (wrappedRequires.has(requireFunction)) return wrappedRequires.get(requireFunction);
    // Proxy forwards require.config and all other loader properties unchanged.
    const wrapped = new Proxy(requireFunction, {
      apply(target, thisArg, args) {
        const dependencies = args[0];
        if (Array.isArray(dependencies) &&
            dependencies.includes('vs/editor/editor.main') &&
            typeof args[1] === 'function') {
          const callback = args[1];
          const index = dependencies.indexOf('vs/editor/editor.main');
          args[1] = function(...modules) {
            if (!patchMonaco(window.monaco) && !patchMonaco(modules[index])) {
              console.warn(prefix, 'Monaco API not found; editor shortcuts could not be restored.');
            }
            return Reflect.apply(callback, this, modules);
          };
        }
        return Reflect.apply(target, thisArg, args);
      },
    });
    wrappedRequires.set(requireFunction, wrapped);
    wrappedRequires.set(wrapped, wrapped);
    return wrapped;
  }

  // The supplied loader assigns window.require before its script.onload calls it.
  const requireDescriptor = Object.getOwnPropertyDescriptor(window, 'require');
  if (!requireDescriptor || (requireDescriptor.configurable && 'value' in requireDescriptor)) {
    let currentRequire = wrapRequire(window.require);
    defineProperty(window, 'require', {
      configurable: true,
      enumerable: requireDescriptor ? requireDescriptor.enumerable : true,
      get() { return currentRequire; },
      set(value) { currentRequire = wrapRequire(value); },
    });
  } else if ('value' in requireDescriptor && requireDescriptor.writable) {
    window.require = wrapRequire(window.require);
  } else {
    console.warn(prefix, 'Cannot intercept this AMD loader; please share this diagnostic.');
  }

  // Also supports a loader that was initialized before this script.
  patchMonaco(window.monaco);
  console.info(prefix, 'Early hooks installed.');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (!editorCount) {
        console.info(prefix, 'No matching editor detected. On a solution page, check page-context injection and reload.');
      }
    }, 3000);
  }, { once: true });
})();