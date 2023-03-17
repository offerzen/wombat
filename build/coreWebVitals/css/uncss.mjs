import fs from 'fs';
import path from 'path';
import uncss from 'uncss';
import { getLocalAssetPathFromCdn } from '../../../helpers/utils.mjs';
import urlJoin from 'url-join';

const cache = {
};

const getCss = async (url) => {
  if (cache[url]) {
    return cache[url];
  }

  const localPath = getLocalAssetPathFromCdn(url);
  // uncss doesnt support utf-16 and needs to read content as utf-8
  const content = fs.readFileSync(localPath, 'utf-8');
  cache[url] = content;

  return content;
};

/**
 * Makes css page-specific
 *
 * Process:
 * - Read the CSS from HTML matching Webflow naming
 * - Add that same CSS to the ignore list for uncss (uncss crashes on retrieval itself)
 * - Use the raw CSS and page HTML to run uncss
 *
 * @returns { css, html } Where HTML might be modified with the page-specific target path
 */
export const reduceCss = async ({ html, cdnUrl, pagePath, htmlDestinationPath, destinationDirectory, uuid }) => {
  // Detect main CSS file
  // https://regexr.com/6p6hc
  // `[a-z="\/ ]+` at start and end will match other attributes e.g. rel="blah"
  // Only first / top-most match is needed
  // Must match without g otherwise group won't return
  // Becomes something like: /https:\/\/offerzen.github.io\/webflow-pages\/[0-9a-z.\/]+\.css/i
  const cssUrlPattern = new RegExp(`${cdnUrl}[0-9a-z.\\/\\-_]+\\.css`, 'i');
  const result = html.match(cssUrlPattern);

  // TODO: handle multiple matches
  let cssUrl = result?.[0];
  let css = null;
  let modifiedHtml = html;

  if (cssUrl) {
    const cssRaw = await getCss(cssUrl)
    const options = {
      raw: cssRaw, // pass below CSS file in as raw
      ignoreSheets: [/\.css$/], // Prevent UnCSS from referencing this CSS file as it fails to fully load it,
      ignore: [
        /(.*\.w\-[a-z0-1_\-]+)/, // Don't remove webflow classes in case they get used in webflow JS. Some webflow classes aren't on the page at the start but are injected by JS later: https://regexr.com/70q06
        /(\[[a-z0-9_\-]+\])/, // Don't remove attribute selectors in case they get used by webflow JS, custom JS or plugins https://regexr.com/70stc
        /(.*\.js\-[a-z0-1_\-]+)/ // Don't remove classes containing .js 
      ]
    }; 

    try {
      // Make uncss work with await as it only has callbacks
      css = await new Promise((resolve, reject) => {
        uncss(html, options, function (error, output) {
          if (error) {
            reject('Uncss error', error);
          }
          resolve(output);
        });
      });
    }
    catch (e) {
      console.error('Uncss failed', e);
    }

    if (!css) {
      console.error('Uncss failed to return content for', htmlDestinationPath);
    }
    else {
      const cssRelativeUrl = getCssPath({ htmlPath: path.basename(htmlDestinationPath), uuid });
      modifiedHtml = html.replace(cssUrlPattern, urlJoin(cdnUrl, pagePath, cssRelativeUrl)); // url in html for accessing CSS
    }
  }

  return { css, html: modifiedHtml };
}

export const getCssPath = ({ htmlPath, uuid }) => {
  return htmlPath.replace(/\.html$/, `_${uuid}.css`)
}
