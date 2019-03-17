function hintIdGenerator(hintCharacters) {
  var counter = 0, len = hintCharacters.length;

  return function() {
    var num = counter, iter = 0, text = '', n;
    while (num >= 0) {
      n = num;
      num -= Math.pow(len, 1 + iter);
      iter++;
    }
    for (var i = 0; i < iter; i++) {
      text = hintCharacters[n % len] + text;
      n = Math.floor(n / len);
    }
    counter++;
    return text;
  };
}

module.exports = hintIdGenerator;
