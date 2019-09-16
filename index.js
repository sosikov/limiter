const pLimit = require('p-limit');
const urls = require('./urls');

const randomizer  = () => Math.random() * 5 + 1;
const ajax = url => new Promise(resolve => setTimeout(() => resolve(url), 3000)); /* randomizer() * 1000 */
const getDomain = url => url.split('.')[0];

class Limiter {
  constructor(urls, limitRequests, limitPerDomain) {
    this.urls = [ ...urls ];
    this.limitPerDomain = limitPerDomain;
    this.limitRequests = pLimit(limitRequests);

    this.urlsByDomain = {};
    this.activeRequestsByDomain = {};
  }

  parseUrlsByDomain() {
    this.urls.forEach(url => {
      const domain = getDomain(url);
      if (!this.urlsByDomain[domain]) {
        this.urlsByDomain[domain] = [];
        this.activeRequestsByDomain[domain] = 0;
      }
      this.urlsByDomain[domain].push(url);
    });
  }

  updateQueue() {
    for (const domain in this.urlsByDomain) {
      this.urlsByDomain[domain] = this.urlsByDomain[domain].reduce((urlsQueue, url) => {
        if (this.activeRequestsByDomain[domain] < this.limitPerDomain) {
          this.activeRequestsByDomain[domain] += 1;
          this.makeRequest(url);
        } else {
          urlsQueue.push(url);
        }
        return urlsQueue;
      }, []);
    }
  }

  makeRequest(url) {
    this.limitRequests(() => ajax(url).then(res => {
      console.log('res >', res);
      this.activeRequestsByDomain[getDomain(url)] -= 1;
      this.updateQueue();
    }));
  }
}


const limiter = new Limiter(urls, 10, 3);
limiter.parseUrlsByDomain();
limiter.updateQueue();
