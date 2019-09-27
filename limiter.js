// const pLimit = require('p-limit');
const pLimit = require('./plimit');
const urls = require('./urls');
const ajax = url => new Promise(resolve => setTimeout(() => resolve(url), 1500));

class Limiter {
  constructor(urls, commonLimit, domainLimit) {
    this.urls = [...urls];
    this.commonLimiter = pLimit(commonLimit);
    this.domainLimit = domainLimit;
  }

  load() {
    let counter = 0;
    let domainsLimiters = {};

    return new Promise(resolve => {
      this.urls.forEach(url => {
        domainsLimiters[url] = domainsLimiters[url] || pLimit(this.domainLimit);
        domainsLimiters[url](() => this.commonLimiter(() => ajax(url).then(res => {
          console.log('done ->', res);
          counter += 1;
          if (counter === this.urls.length) resolve();
        })));
      });
    });
  }
}

const loading = new Limiter(urls, 10, 3).load().then(() => console.log('loading is complete'));
