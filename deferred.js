const Deferred = function(fn) {
  const callbacks = [];

  function then(callback) {
    callbacks.push(callback);
    return this;
  }

  function resolve(res) {
    callbacks.forEach(function(callback) {
      res && res.then ? res.then(callback) : res = callback(res);
    });
  }

  setImmediate(function() {
    if (fn) fn(resolve);
  });

  return {
    then,
    resolve
  }
};

module.exports = Deferred;
