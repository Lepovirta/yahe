(function(window){
  var globals = {
    hint_types: 'a, input:not([type=hidden]), textarea, select, img, button',
    container_id: 'chrome_yahe_container',
    hint_class: 'chrome_yahe_hint',
    hilight_class: 'chrome_yahe_hilight',
    activate_keycode: 188,
    hintcharacters: 'fdjkghslrueicnxmowabzpt'
  }, doc = window.document;

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

  var create_hints = function() {
    var nodes = doc.querySelectorAll(globals.hint_types),
        container = doc.createElement('div'),
        hints = {},
        obj = {nodes: nodes, container: container, hints: hints},
        hintid = hintid_generator(globals.hintcharacters);

    container.id = globals.container_id;

    forEach(nodes, function(node) {
      var cr = node.getBoundingClientRect(),
          span = doc.createElement('span'),
          hint = {node: node, span: span},
          hint_id = hintid();

      span.innerText = hint_id;
      span.className = globals.hint_class;
      span.style.top = (window.pageYOffset + cr.top) + "px";
      span.style.left = (window.pageXOffset + cr.left - span.offsetWidth) + "px";

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

  var dehilight = function(el) {
    var re = new RegExp("(?:^|\s)" + globals.hilight_class + "(?!\S)");
    el.className.replace(re, '');
  };

  var hilight = function(el) {
    el.className += ' ' + globals.hilight_class;
  };

  var is_yahekey = function(e) {
    return (e.ctrlKey && e.keyCode === globals.activate_keycode);
  };

  var mk_yahe = function() {
    var that = {}, hintsobj, input = "",
        active = false, selected_el;

    that.newhints = function() {
      that.deactivate();
      hintsobj = create_hints();
      doc.body.appendChild(hintsobj.container);
      active = true;
    };

    that.deactivate = function() {
      if (active) {
        doc.body.removeChild(hintsobj.container);
        that.clear_input();
        active = false;
      }
    };

    that.clear_input = function() {
      input = "";
      if (selected_el) {
        dehilight(selected_el.span);
        selected_el = undefined;
      }
    };

    that.append_input = function(c) {
      input += c;
      select_hint(input);
    };

    that.keydown = function(e) {
      if (active) {
        if (is_yahekey(e)) {
          if (input.length > 0)
            that.clear_input();
          else
            that.deactivate();
          e.preventDefault();
        } else {
          handle_input(e);
        }
      } else if (is_yahekey(e)) {
        that.newhints();
        e.preventDefault();
      }
    };

    var handle_input = function(e) {
      switch (e.keyCode) {
      case 27:
        that.deactivate();
        break;
      case 13:
        open_selected(e);
        break;
      default:
        that.append_input(String.fromCharCode(e.keyCode));
        break;
      }
    };

    var open_selected = function(e) {
      if (selected_el) {
        var node = selected_el.node;
        e.preventDefault();
        mouseclick(node, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey);
        that.clear_input();
        if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA')
          that.deactivate();
      }
    };

    var select_hint = function(query) {
      var el = hintsobj.hints[query.toLowerCase()];
      if (typeof el !== 'undefined') {
        selected_el = el;
        hilight(el.span);
      }
    };

    return that;
  };

  var yahe = mk_yahe();
  doc.addEventListener('keydown', yahe.keydown, true);
}).call(null, window);