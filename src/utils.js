function forEach(coll, f) {
  for (var i = 0; i < coll.length; i++) {
    f(coll[i], i);
  }
}

function uniqueCharacters(s) {
  var buffer = [], seen = {};
  forEach(s, function(c) {
    if (!seen[c]) {
      buffer.push(c);
      seen[c] = true;
    }
  });
  return buffer.join('');
}

exports.forEach = forEach;
exports.uniqueCharacters = uniqueCharacters;
