import 'dotenv/config';

import fs from 'fs-extra';
import path from 'path';
import rimraf from 'rimraf';
import { v4 as uuidv4 } from 'uuid';
import { rewriteAssetPaths } from './assets/rewriteAssetPaths.mjs';
import { improveCoreWebVitals } from './coreWebVitals/index.mjs';
import { rewriteStagingUrls } from './assets/rewriteStagingUrls.mjs';

const cdnUrl = process.env.CDN_URL;
const site = process.env.SITE;
const source = path.resolve('compare');
const destination = path.resolve('static');
const uuid = uuidv4();

// Delete all content to ensure old files are not served
rimraf.sync(destination);

// Copy everything to /static
fs.copySync(source, destination);

// Change files in place
const pluginOptions = {
  sourceDirectory: destination,
  destinationDirectory: destination,
  cdnUrl,
  site,
  uuid,
};

// rewrite paths in html and assets to use github pages as cdn instead of webflow
// Must be done first so other plugins can operate on files instead of redownloading
await rewriteAssetPaths(pluginOptions);

// rewrite any links that go to www.offerzen.com to the absolute path of the staging site
// Must be done otherwise all links on staging will go to the live pages and not the staging pages
await rewriteStagingUrls(pluginOptions);

// Run optimisations (recopies files in `destination`)
await improveCoreWebVitals(pluginOptions);
