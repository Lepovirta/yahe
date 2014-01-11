(function(window){
  var doc = window.document,
      ls = window.localStorage,
      hintchars = doc.getElementById('hintcharacters'),
      activate_key = doc.getElementById('activate_key'),
      mod_ctrl = doc.getElementById('mod_ctrl'),
      mod_alt = doc.getElementById('mod_alt'),
      mod_meta = doc.getElementById('mod_meta'),
      form = doc.getElementById('options_form'),
      saved = doc.getElementsByClassName('saved')[0],
      dfs = {
        modifier: 'ctrl',
        hintcharacters: 'fdjkghslrueicnxmowabzpt',
        activate_key: 'm'
      };

  var load_options = function() {
    var modifier = ls.modifier || dfs.modifier,
        selected_mod = doc.getElementById('mod_' + modifier);
    hintchars.value = ls.hintcharacters || dfs.hintcharacters;
    activate_key.value = ls.activate_key || dfs.activate_key;
    if (selected_mod)
      selected_mod.checked = true;
    else
      mod_ctrl.checked = true;
  };

  var save_options = function() {
    var mod = dfs.modifier;
    [mod_ctrl, mod_alt, mod_meta].forEach(function(m) {
      if (m.checked)
        mod = m.value;
    });
    ls.activateModifier = mod;
    ls.hintCharacters = hintchars.value || dfs.hintcharacters;
    ls.activateKey = activate_key.value[0] || dfs.activate_key;

    saved.style.display = "block";
    window.setTimeout(function() {
      saved.style.display = "none";
    }, 2000, false);
  };

  load_options();
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    save_options();
  }, true);
}).call(null, window);
