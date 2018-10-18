// @flow
/*global global*/
import test from 'ava';
import { JSDOM } from 'jsdom';
import CursorManager from './index.js';

test.before(() => {
  global.window = new JSDOM('<body><div id="root"><p class="focused" style="position: absolute; top: 100px; left: 50px;">focused</p></div></body>').window;
  global.document = global.window.document;
});

test.after(() => {
  delete global.window;
  delete global.document;
});

test('cursor', t => {
  const root = document.getElementById('root');
  if (!root) {
    t.fail();
    return;
  }

  const cursorManager = new CursorManager({
    root,
    focusSelector: '.focused'
  });

  const actual = cursorManager.getCursor();
  t.is(actual.classList.item(0), '__spatial-navigation-cursor__');
  t.is(actual.style.display, 'none');

  cursorManager.move();
  t.is(actual.style.display, '');
});
