(function(chrome, window){
  var globals = {
    hint_types: 'a, input:not([type=hidden]), textarea, select, ' +
      'button, [onclick], [onmousedown]',
    container_id: 'chrome_yahe_container',
    hint_class: 'chrome_yahe_hint',
    hilight_class: 'chrome_yahe_hilight',
    activate_modifier: 'ctrl',
    activate_keycode: 109,
    hintcharacters: 'fdjkghslrueicnxmowabzpt'
  }, doc = window.document;

  // YAHE constructor
  var mk_yahe = function() {
    var that = {}, hintsobj, input = "",
        active = false, selected_el;

    that.newhints = function() {
      that.deactivate();
      hintsobj = create_hints();
      doc.documentElement.appendChild(hintsobj.container);
      active = true;
    };

    that.deactivate = function() {
      if (active) {
        doc.documentElement.removeChild(hintsobj.container);
        that.clear_input();
        active = false;
      }
    };

    that.clear_input = function() {
      input = "";
      dehilight();
      selected_el = undefined;
    };

    that.append_input = function(c) {
      input += c;
      select_hint(input);
    };

    that.keydown = function(e) {
      var handler = keyhandlers[e.keyCode], r;
      if (!handler)
        handler = keyhandlers['default'];
      r = handler(e);
      if (r) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    var open_selected = (function() {
      var types = ['text', 'password', 'search', 'tel', 'url', 'email',
                   'number', 'datetime', 'datetime-local'],
          tags = ['INPUT', 'TEXTAREA', 'SELECT'];
      var is_type = function(el) {
        return types.some(function(x) {
          return el.type === x;
        });
      };
      var is_tag = function(el) {
        return tags.some(function(x) {
          return el.tagName === x;
        });
      };

      var focus_or_click = function(el, fo, mc) {
        return ((el.tagName === 'INPUT' && is_type(el)) ||
                el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
      };

      return function(e) {
        if (selected_el) {
          var node = selected_el.node;
          if (focus_or_click(node))
            node.focus();
          else
            mouseclick(node, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey);
          if (is_tag(node))
            that.deactivate();
        }
      };
    }());

    var select_hint = function(query) {
      var el = hintsobj.hints[query.toLowerCase()];
      if (typeof el !== 'undefined') {
        dehilight();
        selected_el = el;
        hilight();
      }
    };

    var dehilight = function() {
      if (selected_el) {
        var re = new RegExp("(\\s|^)" + globals.hilight_class + "(\\s|$)");
        selected_el.span.className = selected_el.span.className.replace(re, '');
      }
    };

    var hilight = function() {
      if (selected_el)
        selected_el.span.className += ' ' + globals.hilight_class;
    };

    var keyhandlers = {
      default: function(e) {
        if (active && !has_modifiers(e)) {
          var c = String.fromCharCode(e.keyCode).toLowerCase();
          if (globals.hintcharacters.indexOf(c) >= 0)
            that.append_input(c);
          e.preventDefault();
          e.stopPropagation();
          return true;
        }
        return false;
      },
      27: function(e) { // escape
        if (!active) return false;
        that.deactivate();
        return true;
      },
      13: function(e) { // return
        if (!active) return false;
        open_selected(e);
        that.clear_input();
        return true;
      }
    };
    keyhandlers[globals.activate_keycode] = function(e) {
      var r = true, hm = has_mod(e);
      if (active) {
        if (hm && input.length > 0)
          that.clear_input();
        else if (hm)
          that.deactivate();
        else
          r = keyhandlers.default(e);
      } else if (hm) {
        that.newhints();
      } else { return false; }
      return r;
    };

    return that;
  };

  // Helper functions

  var forEach = function(list, cb) {
    for (var i = 0; i < list.length; i++)
      cb(list[i], i, list);
  };

  var mouseclick = function(target, ctrl, alt, shift, meta) {
    var ev = doc.createEvent('MouseEvent');
    ev.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0,
                      ctrl, alt, shift, meta, 0, null);
    target.dispatchEvent(ev);
  };

  var load_options = function(ls) {
    var mod = ls.modifier,
        hintchars = ls.hintcharacters,
        key = ls.activate_key;
    if (mod === 'alt' || mod === 'meta' || mod === 'ctrl')
      globals.activate_modifier = mod;
    if (hintchars)
      globals.hintcharacters = filter_hintcharacters(hintchars);
    if (key)
      globals.activate_keycode = key.toUpperCase().charCodeAt(0) || 188;
  };

  var has_mod = function(e) {
    return e[globals.activate_modifier + 'Key'];
  };

  var filter_hintcharacters = function(hintchars) {
    var hc = [], hcdb = {};
    forEach(hintchars.toLowerCase(), function(c) {
      if (!hcdb[c]) {
        hc.push(c);
        hcdb[c] = true;
      }
    });
    return hc.join('');
  };

  var in_viewport = function(cr) {
    return (cr.bottom > 0 && cr.right > 0 &&
            cr.width > 0 && cr.height > 0);
  };

  var create_hints = function() {
    var nodes = doc.querySelectorAll(globals.hint_types),
        container = doc.createElement('div'),
        hints = {},
        obj = {nodes: nodes, container: container, hints: hints},
        hintid = hintid_generator(globals.hintcharacters);

    container.id = globals.container_id;

    forEach(nodes, function(node) {
      var cr = node.getBoundingClientRect();
      if (!in_viewport(cr)) return;

      var span = doc.createElement('span'),
          hint = {node: node, span: span},
          hint_id = hintid(),
          span_top = window.pageYOffset + (cr.top > 0 ? cr.top : 0),
          span_left = window.pageXOffset + (cr.left > 0 ? cr.left : 0) - span.offsetWidth;

      span.innerText = hint_id;
      span.className = globals.hint_class;
      span.style.top = span_top + "px";
      span.style.left = span_left + "px";

      container.appendChild(span);
      hints[hint_id] = hint;
    });

    return obj;
  };

  var hintid_generator = function(hintcharacters) {
    var counter = 0, len = hintcharacters.length;
    var gen_hintid = function() {
      var num = counter, iter = 0, text = '', n;
      while (num >= 0) {
        n = num;
        num -= Math.pow(len, 1 + iter);
        iter++;
      }
      for (var i = 0; i < iter; i++) {
        text = hintcharacters[n % len] + text;
        n = Math.floor(n / len);
      }
      counter++;
      return text;
    };
    return gen_hintid;
  };

  var has_modifiers = function(e) {
    return (e.ctrlKey || e.altKey || e.metaKey);
  };

  // load options, and create and bind YAHE
  chrome.extension.sendRequest({method: "getOptions"}, function(response) {
    var yahe;
    load_options(response),
    yahe = mk_yahe();
    doc.addEventListener('keydown', yahe.keydown, true);
  });
}).call(null, chrome, window);
