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
  focused_: ?HTMLElement;
  focusClassName_: string;
  viewHeight_: number;
  observer_: ?MutationObserver;
  */

  /**
   * @param {Object} props
   * @param {HTMLElement} props.root an HTML element to use as its root
   * @param {string} props.focusClassName a css class name to identify the focused element
   */
  constructor({ root, focusClassName }/*: {
    root: HTMLElement,
    focusClassName: string,
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
    this.focusClassName_ = focusClassName;

    /**
     * @type {HTMLElement}
     * @access private
     */
    this.cursor_ = document.createElement('div');

    /**
     * @type {HTMLElement}
     * @access private
     */
    this.focused_ = null;

    /**
     * @type {string}
     * @access private
     */
    this.viewHeight_ = window.innerHeight;

    /**
     * @type {MutationObserver}
     * @access private
     */
    this.observer_ = null;
  }

  /**
   * Start the manager
   */
  start()/*: void*/ {
    this.styleCursor_();
    this.appendToRoot_();
    this.observeFocus_();
    this.focus();
  }

  /**
   * Stop the manager
   */
  stop()/*: void*/ {
    this.removeFromRoot_();
    this.disconnectFocus_();
  }

  /**
   * Focus on the element with the cursor
   */
  focus()/*: void*/ {
    if (!this.focused_ || this.cursor_.style.display === 'none') {
      this.place();
    } else {
      this.move();
    }
  }

  /**
   * Place the cursor
   */
  place()/*: void*/ {
    const focused = this.focused_ || document.querySelector(`.${ this.focusClassName_ }`);
    if (!focused) return;

    const origTransitionDuration = this.cursor_.style.transitionDuration;
    this.cursor_.style.transitionDuration = '0';
    const r = getAbsoluteElementRect(focused);
    this.scrollIntoView_(r);
    this.resizeCursorTo_(r);
    this.moveCursorTo_(r);
    this.showCursor_();
    this.cursor_.style.transitionDuration = origTransitionDuration;
  }

  /**
   * Move the cursor
   */
  move()/*: void*/ {
    const focused = this.focused_ || document.querySelector(`.${ this.focusClassName_ }`);
    if (!focused) {
      this.hideCursor_();
      return;
    } else {
      this.showCursor_();
    }

    const r = getAbsoluteElementRect(focused);
    this.scrollIntoView_(r);
    this.resizeCursorTo_(r);
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
    const left = window.pageXOffset;
    window.scroll({
      left,
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
  resizeCursorTo_(rect/*: cursorManager$Rect*/)/*: void*/ {
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

  /**
   * Append the cursor to the root
   * @access private
   */
  removeFromRoot_()/*: void*/ {
    this.root_.removeChild(this.cursor_);
  }

  /**
   * Observe the change of focused elements
   * @access private
   */
  observeFocus_() {
    const observer = this.observer_ = new MutationObserver((mutationRecords) => {
      for (let mutation of mutationRecords) {
        if (
          mutation.type !== 'attributes' ||
          mutation.attributeName !== 'class' ||
          !(mutation.target/*: any*/).classList.contains(this.focusClassName_)
        ) continue;
        this.focused_ = ((mutation.target/*: any*/)/*: HTMLElement*/);
        this.focus();
        break;
      }
    });
    observer.observe(this.root_, {
      attributes: true,
      subtree: true,
    });
  }

  /**
   * Stop Observering the change of focused elements
   * @access private
   */
  disconnectFocus_() {
    if (!this.observer_) return;
    this.observer_.disconnect();
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
