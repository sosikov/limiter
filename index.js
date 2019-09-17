const pLimit = require('p-limit');
const urls = require('./urls');

const ajax = url => new Promise(resolve => setTimeout(() => resolve(url), 2000));

class Limiter {
  constructor(urls, commonLimiter, domainLimiter) {
    this.urls = [...urls];
    this.commonLimiter = pLimit(commonLimiter);
    this.domainLimiter = domainLimiter;
    this.counter = urls.length;
    this.domainsLimiters = {};
  }

  load() {
    return new Promise(resolve => {
      this.urls.forEach(url => {
        const domain = url.split('.')[0];

        if(!this.domainsLimiters[domain]) {
          this.domainsLimiters[domain] = pLimit(this.domainLimiter);
        }
        this.domainsLimiters[domain](() => this.request(url, resolve));
      });
    });
  }

  request(url, resolve) {
    this.commonLimiter(() =>
      ajax(url).then(res => {
        console.log('res >', res);
        this.counter -= 1;

        if (!this.counter) {
          resolve();
        }
      }));
  }

}

const loading = new Limiter(urls, 10, 3)
  .load()
  .then(() => console.log('loading is complete'));
