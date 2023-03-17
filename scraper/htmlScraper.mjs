import axios from 'axios';
import cheerio from 'cheerio';
import fs, { readFileSync } from 'fs';
import path from 'path';
import { downloadAsset, getAssetUrls } from './assetScraper.mjs';
import { baseDirectory, urls } from './config.mjs';

const downloadedAssetUrls = {};

export async function scrapePages() {
  for (let pageUrl of urls) {
    // Sitemap in a webflow project might be prefixed with https://flow.offerzen.com/ when actual site queried is https://offerzen.webflow.io/
    // Get path after first slash after `https://`
    const httpsSlash = pageUrl.indexOf('//') + 2;
    const directoryName = pageUrl.slice(httpsSlash);

    // Add folders to static under project base
    const directoryPath = path.join(baseDirectory, directoryName);

    try {
      fs.mkdirSync(directoryPath, { recursive: true });
    } catch (e) {
      console.error('Could not create directories', e);
    }
    const { assetUrls, content: html } = await getPageContent({
      url: pageUrl,
      directoryPath,
    });
    // Paths don't matter, just download for later
    await downloadAssets({ assetUrls });

    try {
      fs.writeFileSync(path.join(directoryPath, 'index.html'), html, {
        encoding: 'utf-8',
      });
    } catch (e) {
      console.error('Failed to write file', pageUrl, 'Error', e);
    }
  }
}

async function getPageContent({ url }) {
  let data = null;
  try {
    data = (await axios.get(url)).data;
  } catch (e) {
    console.error(`Axios failed for: ${url}`);
  }

  const $ = cheerio.load(data);

  const content = $.html();

  const assetUrls = getAssetUrls({ content, url });

  return { content, assetUrls };
}

async function downloadAssets({ assetUrls }) {
  // Download only new assets
  const assetsToDownload = assetUrls.filter(
    (assetUrl) => !(assetUrl in downloadedAssetUrls)
  );

  if (!assetsToDownload.length) return [];

  const assetPaths = await Promise.allSettled(
    assetsToDownload.map(async (url, i) => {
      // download to baseDirectory instead of subdomain path so all sites can share assets
      const assetPath = await downloadAsset({
        url,
        directoryPath: baseDirectory,
      });
      downloadedAssetUrls[url] = assetPath;
      console.log(`Downloaded ${Object.keys(downloadedAssetUrls).length}`);

      const nestedAssetPaths = await downloadNestedAssets({ assetPath, url });

      return [assetPath, ...nestedAssetPaths];
    })
  );

  const failed = assetPaths
    .filter((r) => r.status === 'rejected')
    .map((r) => r.reason);
  if (failed.length) {
    console.error('Failed to download assets', failed);
  }

  return assetPaths.flat(Infinity);
}

/**
 * Recurse into css and svg files for other asset links
 * @param {string} assetPath Asset file path
 * @param {string} url       Asset url
 */
async function downloadNestedAssets({ assetPath, url }) {
  if (assetPath.match(/\.(css|svg|js)$/gi) == null) {
    // Stick to the likely candidates for including nested content
    return [];
  }

  const content = fs.readFileSync(assetPath, 'utf-8');
  const assetUrls = getAssetUrls({ content, url });

  return downloadAssets({ assetUrls });
}
