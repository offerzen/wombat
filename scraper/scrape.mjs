import 'dotenv/config';

import path from 'path';
import rimraf from 'rimraf';
import { baseDirectory, urls } from './config.mjs';
import { scrapePages } from './htmlScraper.mjs';

(async () => {
  await clearBaseDirectories();
  scrapePages();
})();

async function clearBaseDirectories() {
  // clear existing content per sitemap base directories (for all possible values in sitemap) e.g. flow.offerzen.com
  // Does not clear assets
  try {
    const sitemapBaseDirectoriesHash = {};
    urls.forEach(url => {
      const httpsSlash = url.indexOf('//') + 2;
      const firstSlash = url.indexOf('/', httpsSlash) + 1;
      const directory = url.slice(httpsSlash, firstSlash);

      return sitemapBaseDirectoriesHash[directory] = true;
    });
    const sitemapBaseDirectories = Object.keys(sitemapBaseDirectoriesHash);

    for (let directory of sitemapBaseDirectories) {
      const directoryPath = path.join(baseDirectory, directory);
      rimraf.sync(directoryPath);
    }
  }
  catch (e) {
    console.error('Clearing directories failed', e);
  }
}
