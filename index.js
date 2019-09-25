// const pLimit = require('p-limit');
const Deferred = require('./deferred');
const pLimit = require('./plimit');
const urls = require('./urls');

const ajax = url => new Deferred(resolve => setTimeout(() => resolve(url), 1500));

class Limiter {
  constructor(urls, commonLimiter, domainLimiter) {
    this.urls = [...urls];
    this.commonLimiter = pLimit(commonLimiter);
    this.domainLimiter = domainLimiter;
    this.counter = 0;
    this.domainsLimiters = {};
  }

  load() {
    return new Deferred(resolve => {
      this.urls.forEach(url => {
        const domain = url.split('.')[0];
        this.domainsLimiters[domain] = this.domainsLimiters[domain] || pLimit(this.domainLimiter);
        this.domainsLimiters[domain](() => this.request(url, resolve));
      });
    });
  }

  request(url, resolve) {
    return this.commonLimiter(() =>
      ajax(url).then(res => {
        console.log('done >', res);
        this.counter += 1;
        if (this.counter === this.urls.length) resolve();
      }));
  }

}

const loading = new Limiter(urls, 10, 3)
  .load()
  .then(() => console.log('loading is complete'));
