// @flow
/*global global*/
import test from 'ava';
import { JSDOM } from 'jsdom';
import td from 'testdouble';
import CursorManager from './index.js';

var observe = td.func();
var disconnect = td.func();

test.before(() => {
  global.window = new JSDOM('<body><div id="root"><p class="focused" style="position: absolute; top: 100px; left: 50px;">focused</p></div></body>').window;
  global.document = global.window.document;
  global.MutationObserver = class {
    observe() { observe() }
    disconnect() { disconnect() }
  }
  global.getComputedStyle = () => ({ borderLeftWidth: '2px', borderTopWidth: '2px' });
});

test.after(() => {
  delete global.window;
  delete global.document;
  delete global.MutationObserver;
  delete global.getComputedStyle;
});

test('cursor', t => {
  const root = document.getElementById('root');
  if (!root) {
    t.fail();
    return;
  }

  const cursorManager = new CursorManager({
    root,
    focusClassName: 'focused'
  });

  const actual = cursorManager.getCursor();
  t.is(actual.style.display, '');

  cursorManager.start();
  t.is(actual, root.querySelector('.__spatial-navigation-cursor__'));
  t.is(actual.classList.item(0), '__spatial-navigation-cursor__');
  t.is(actual.style.position, 'absolute');
  t.is(parseInt(actual.style.top, 10), 0);
  t.is(parseInt(actual.style.left, 10), 0);
  t.is(td.explain(observe).callCount, 1);

  cursorManager.stop();
  t.is(root.querySelector('.__spatial-navigation-cursor__'), null);
  t.is(td.explain(disconnect).callCount, 1);

  const listener = td.func();
  cursorManager.addEventListener(CursorManager.Events.FOCUS_UPDATED, listener);
  cursorManager.trigger_(CursorManager.Events.FOCUS_UPDATED);
  t.is(td.explain(listener).callCount, 1);

  cursorManager.removeEventListener(CursorManager.Events.FOCUS_UPDATED, listener);
  cursorManager.trigger_(CursorManager.Events.FOCUS_UPDATED);
  t.is(td.explain(listener).callCount, 1);
});
