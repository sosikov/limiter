const pLimit = require('p-limit');
const urls = require('./urls');

const ajax = url => new Promise(resolve => setTimeout(() => resolve(url), 1500));

class Limiter {
  constructor(urls, commonLimiter, domainLimiter) {
    this.urls = [...urls];
    this.commonLimiter = pLimit(commonLimiter);
    this.domainLimiter = domainLimiter;
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
        if (this.commonLimiter.activeCount === 1) {
          resolve();
        }
      })
    );
  }
}

const loading = new Limiter(urls, 10, 3)
  .load()
  .then(() => console.log('loading is complete'));
