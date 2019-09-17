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

  request(url) {
    return this.commonLimiter( () => ajax(url).then(res => console.log('res', res)) );
  }

  sendRequests() {
    const allPromises = this.urls.reduce((promises, url) => {
      const domain = getDomain(url);

      if(!this.domainsLimiters[domain]) {
        this.domainsLimiters[domain] = pLimit(this.limitPerDomain);
      }
      const promise = this.domainsLimiters[domain]( () => this.request(url) );
      promises.push(promise);

      return promises;
    }, []);

    return Promise.all(allPromises);
  }
}

const limiter = new Limiter(urls, 10, 3);
const done = limiter.sendRequests();

done.then(() => console.log('finish!'));
