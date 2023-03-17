import fs from 'fs';
import path from 'path';
import { baseDirectory, urls } from '../scraper/config.mjs';

export default async function (globalConfig, projectConfig) {

  global.site = process.env.SITE || '';

  // These are taken from the sitemap
  // Filters out testing and staging pages so that only production url get tested
  global.urls = urls.filter((url) => !url.match(/(\/test\-)/i)?.length);

  // Synchronous reading of source code for any given url (read from `/compare`)
  global.html = (url) => {
    // Tidies up directory to not include https://
    const httpsSlash = url.indexOf('//') + 2;
    const directory = url.slice(httpsSlash);

    const filePath = path.join(baseDirectory, directory, 'index.html');

    return fs.readFileSync(filePath, 'utf-8');
  };
};
