const pLimit = amount => {
  let queue = [];
  let counter = 0;
  
  const limiter = func => new Promise(resolve => {
    prepare(func, resolve);
  });

  const prepare = (func, resolve) => {
    counter < amount ? request(func, resolve) : queue.push({func, resolve});
  };

  const request = (func, resolve) => {
    counter += 1;

    func().then(() => {
      resolve();
      counter -= 1;
      if (queue.length) {
        let next = queue.shift();
        prepare(next.func, next.resolve);
      }
    });
  };

  return limiter;
}

module.exports = pLimit;
