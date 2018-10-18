// @flow

/*::
type cursorManager$Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};
*/

export default class CursorManager {
  /*::
  root_: HTMLElement;
  cursor_: HTMLElement;
  focusSelector_: string;
  viewHeight_: number;
  */

  /**
   * @param {Object} props
   * @param {HTMLElement} props.root an HTML element to use as its root
   * @param {string} props.focusSelector a css selector to identify the focused element
   */
  constructor({ root, focusSelector, }/*: {
    root: HTMLElement,
    focusSelector: string,
  }*/) {
    /**
     * @type {HTMLElement}
     * @access private
     */
    this.root_ = root;

    /**
     * @type {string}
     * @access private
     */
    this.focusSelector_ = focusSelector;

    /**
     * @type {HTMLElement}
     * @access private
     */
    this.cursor_ = document.createElement('div');

    /**
     * @type {string}
     * @access private
     */
    this.viewHeight_ = window.innerHeight;

    this.styleCursor_();
    this.appendToRoot_();
  }

  /**
   * Move the cursor
   */
  move()/*: void*/ {
    const focused = this.root_.querySelector(this.focusSelector_);
    if (!focused) {
      this.hideCursor_();
      return;
    } else {
      this.showCursor_();
    }

    const r = getAbsoluteElementRect(focused);
    this.scrollIntoView_(r);
    this.moveCursorTo_(r);
  }

  /**
   * Get the cursor element
   * @return {HTMLElement} the cursor element
   */
  getCursor()/*: HTMLElement*/ {
    return this.cursor_;
  }

  /**
   * Scroll into view of destination rect
   * @access private
   * @param {cursorManager$Rect} rect the destination rect
   * @param {number} rect.top
   * @param {number} rect.left
   * @param {number} rect.width
   * @param {number} rect.height
   */
  scrollIntoView_(rect/*: cursorManager$Rect*/)/*: void*/ {
    const pageXOffset = window.pageXOffset;
    window.scroll({
      left: pageXOffset,
      top: rect.top - (window.innerHeight * 0.5) + (rect.height * 0.5),
      behavior: 'smooth',
    });
  }

  /**
   * Move the cursor to the destination rect
   * @access private
   * @param {cursorManager$Rect} rect the destination rect to scroll to
   * @param {number} rect.top
   * @param {number} rect.left
   * @param {number} rect.width
   * @param {number} rect.height
   */
  moveCursorTo_(rect/*: cursorManager$Rect*/)/*: void*/ {
    this.cursor_.style.transform = `translate3d(${ rect.left }px, ${ rect.top }px, 0)`;
    this.cursor_.style.width = `${ rect.width }px`;
    this.cursor_.style.height = `${ rect.height }px`;
  }

  /**
   * Style the cursor
   * @access private
   */
  styleCursor_()/*: void*/ {
    this.cursor_.classList.add('__spatial-navigation-cursor__');
    this.cursor_.style.position = 'absolute';
    this.cursor_.style.top = '0';
    this.cursor_.style.left = '0';
    this.hideCursor_();
  }

  /**
   * Hide the cursor
   * @access private
   */
  hideCursor_()/*: void*/ {
    this.cursor_.style.display = 'none';
  }

  /**
   * Show the cursor
   * @access private
   */
  showCursor_()/*: void*/ {
    this.cursor_.style.display = '';
  }

  /**
   * Append the cursor to the root
   * @access private
   */
  appendToRoot_()/*: void*/ {
    this.root_.appendChild(this.cursor_);
  }
}

/**
 * Get an element rect with its absolute location
 * @param {HTMLElement} elem an HTML element
 * @return {cursorManager$Rect} the element rect with its absolute location
 */
function getAbsoluteElementRect(elem/*: HTMLElement*/)/* cursorManager$Rect*/ {
  const r = elem.getBoundingClientRect();
  return { left: r.left + window.pageXOffset, top: r.top + window.pageYOffset, width: r.width, height: r.height };
}
