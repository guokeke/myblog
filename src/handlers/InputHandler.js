import is from 'is_js';
import { on, off, log } from '../core/utils';
import { CHARACTERREX, KEYMAP } from '../constants';

export function isCharacter(key) {
  return CHARACTERREX.test(key);
}

export function isSpecialKey(keyCode) {
  for (const k in KEYMAP) { // eslint-disable-line no-restricted-syntax
    if (KEYMAP[k] === keyCode) return true;
  }
  return false;
}

const defaultOptions = {
  deplay: 50,
};

export default class InputHandler {
  constructor(handlers, options = defaultOptions) {
    this.state = {
      pause: false,
      running: false,
    };

    this.event = {};
    this.delay = options.delay;
    this.stopCharacterHandler = false;
    this.stopSpecialKeyHandler = false;
    this.$input = null;
    this.keyDownHandler = this.keyDownHandler.bind(this);

    this.createInputElement();
    this.initialHandlers(handlers);
  }

  createInputElement() {
    if (this.$input) return this.$input;
    if (document.getElementById('command')) {
      this.$input = document.getElementById('command');
      return this.$input;
    }

    let style = { };

    this.$input = document.createElement('input');
    this.$input.style.position = 'fixed';
    this.$input.id = 'command';

    if (__DEV__) {
      style = {
        position: 'fixed',
        bottom: '1px',
        width: '100%',
        left: '1px',
        zIndex: '999999',
        color: '#fff',
        background: '#232323',
        opacity: 0.6,
        border: 'none',
        outline: 'none',
      };
    } else {
      style = {
        position: 'fixed',
        bottom: '-50px',
      };
    }

    Object
      .keys(style)
      .forEach((key) => {
        this.$input.style[key] = style[key];
      });

    document.body.append(this.$input);
    this.$input.focus();

    document.addEventListener('click', () => {
      this.$input.focus();
    }, false);

    window.addEventListener('focus', () => {
      this.$input.focus();
    }, false);

    return this.$input;
  }

  initialHandlers(handlers) {
    this.handlers = handlers;
  }

  start() {
    this.state.running = true;
    this.on();
  }

  stop() {
    this.state.running = false;
    this.destory();
  }

  pause() {
    this.state.pause = true;
  }

  resume() {
    this.state.pause = false;
  }

  on() {
    log('bind keydown event');
    on(window, 'keydown', this.keyDownHandler());
  }

  off() {
    off(window, 'keydown', this.keyDownHandler());
  }

  destory() {
    off(window, 'keydown', this.keyDownHandler());

    this.keyDownHandler = null;
    this.handlers = null;
    this.state.running = false;
    this.state.pause = false;
  }

  runHandler(handlerName) {
    if (!this.handlers[handlerName]) return;
    if (is.not.function(this.handlers[handlerName])) return;

    this.handlers[handlerName](this.event);
  }

  keyDownHandler() {
    return () => {
      if (this.state.pause) return;
      this.event = event;
      if (!this.stopCharacterHandler) {
        setTimeout(() => {
          this.handlers.characterHandler(this.$input.value);
        }, 0);
      }
      if (!this.stopSpecialKeyHandler) {
        this.specialKeyHandler(event.keyCode);
      }
    };
  }

  setValue(value = '') {
    if (this.$input) {
      this.$input.value = value;
    }
  }

  characterHandler(key) {
    if (!isCharacter(key)) return;
    this.runHandler('characterHandler');
  }

  specialKeyHandler(keyCode) {
    if (!isSpecialKey(keyCode)) return;

    switch (keyCode) {
      case KEYMAP.TAB:
        this.event.preventDefault();
        this.runHandler('tabHandler');
        break;
      case KEYMAP.UP:
        this.event.preventDefault();
        this.runHandler('upHandler');
        break;
      case KEYMAP.DOWN:
        this.event.preventDefault();
        this.runHandler('downHandler');
        break;
      case KEYMAP.LEFT:
        this.runHandler('leftHandler');
        break;
      case KEYMAP.RIGHT:
        this.runHandler('rightHandler');
        break;
      case KEYMAP.BACKSPACE:
        this.runHandler('backspaceHandler');
        break;
      case KEYMAP.ENTER:
        this.runHandler('enterHandler');
        break;
      case KEYMAP.ESC:
        this.runHandler('escHandler');
        break;
      case KEYMAP.ALT:
        this.runHandler('altHandler');
        break;
      case KEYMAP.SHIFT:
        this.runHandler('shiftHandler');
        break;
      case KEYMAP.CTRL:
        this.runHandler('ctrlHandler');
        break;
      case KEYMAP.END:
        this.runHandler('endHandler');
        break;
      case KEYMAP.HOME:
        this.runHandler('homeHandler');
        break;
      default:
        break;
    }
  }
}
