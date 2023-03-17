import axios from 'axios';
import fs, { createWriteStream } from 'fs';
import path from 'path';
import { resolveUrl } from '../helpers/utils.mjs';

/**
 * Gets assets from the content based if it's from the webflow cdn
 * @param {object} object
 * @param {string} object.content   html or css
 * @param {string} object.url       base url to resolve relative asset paths against e.g. hello.com/blah/bar will load ../foo.png as hello.com/blah/foo.png
 */
export function getAssetUrls({ content, url }) {
  // Only copy webflow cdn content e.g. assets.website-files.com/foo/bar.png with or without an extension
  // Example matches: https://regexr.com/6p22m
  // Captures without '" surrounding it otherwise it's difficult to deal with capturing srcset (https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
  const matches =
    content.match(
      /\bhttps?\:\/\/assets\.website\-files\.com\/[a-z0-9.\-_~!$&()*+;=:@% /]+\.([a-z]{2,4})\b/gi
    ) ?? [];

  // Only collect unique ones
  const uniqueMatches = {};
  matches.forEach((match) => (uniqueMatches[match] = true));

  const assetUrls = Object.keys(uniqueMatches).map((src) =>
    resolveUrl(url, src)
  );

  return assetUrls;
}

/**
 * TODO: make recursive
 * @param {object} object
 * @param {string} object.url             URL including https
 * @param {string} object.directoryPath   Use path.resolve on it first
 */
export async function downloadAsset({ url, directoryPath }) {
  const normalisedPath = url.replace(/https?\:\/\//, '');
  const assetPath = path.join(directoryPath, cleanupAssetUrl(normalisedPath)); // Must decode otherwise it gets saved with things like %20 and cannot get served

  try {
    fs.mkdirSync(path.dirname(assetPath), { recursive: true });
  } catch (e) {
    console.error('Could not create asset directory', e);
  }

  const writer = createWriteStream(assetPath);

  let response = null;
  let fetchAttempts = 0;
  let didFetch = false;

  while (!didFetch) {
    try {
      response = await axios({
        method: 'get',
        url,
        responseType: 'stream',
      });
      didFetch = true;
    } catch (e) {
      if (fetchAttempts >= 2) {
        console.error(`Axios failed for ${url}.`);
        didFetch = true;
      } else {
        console.error(`Retrying to download: ${url}.`);
        await delay(10000)
      }
    }
    fetchAttempts++;
  }

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('error', (err) => {
      writer.close();
      reject(err);
    });
    writer.on('finish', () => resolve(assetPath));
  });
}

function cleanupAssetUrl(url) {
  return decodeURIComponent(url);
}

function delay(delayInMs) {
  return new Promise((resolve) => setTimeout(resolve, delayInMs));
}
