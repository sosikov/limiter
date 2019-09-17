const pLimit = require('p-limit');
const urls = require('./urls');

const randomizer  = () => Math.random() * 5 + 1;
const ajax = url => new Promise(resolve => setTimeout(() => resolve(url), 3000)); /* randomizer() * 1000 */
const getDomain = url => url.split('.')[0];

class Limiter {
  constructor(urls, limitRequests, limitPerDomain) {
    this.urls = [ ...urls ];
    this.commonLimiter = pLimit(limitRequests);
    this.limitPerDomain = limitPerDomain;
    this.domainsLimiters = {};
  }

  request(url, finishResolve) {
    this.commonLimiter( () => ajax(url).then(res => {
      console.log('res', res);
      if (this.commonLimiter.activeCount === 1) {
        finishResolve();
      }
    }) );
  }

  sendRequests() {
    return new Promise(finishResolve => {
      this.urls.forEach(url => {
        const domain = getDomain(url);
  
        if(!this.domainsLimiters[domain]) {
          this.domainsLimiters[domain] = pLimit(this.limitPerDomain);
        }
        this.domainsLimiters[domain]( () => this.request(url, finishResolve) );
      });
    });
  }
}

const limiter = new Limiter(urls, 10, 3);
const done = limiter.sendRequests();

done.then(() => console.log('finish!'));
