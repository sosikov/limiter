const pLimit = amount => {
  let queue = [];
  let counter = 0;

  const request = (fn, resolve) => {
    counter += 1;
    fn().then(() => {
      counter -= 1;
      resolve();

      if (queue.length) {
        let next = queue.shift();
        prepare(next.fn, next.resolve);
      }
    });
  };

  const prepare = (fn, resolve) => {
    counter < amount ? request(fn, resolve) : queue.push({fn, resolve});
  };

  const limiter = fn => {
    return new Promise(resolve => prepare(fn, resolve));
  };

  return limiter;
}

module.exports = pLimit;
