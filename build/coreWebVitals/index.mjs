import fs from 'fs';
import path from 'path';
import { getDirectoryContents } from '../../helpers/utils.mjs';
import { getCssPath, reduceCss } from './css/uncss.mjs';
import { makeTypekitAsync } from './html/typekit.mjs';
import { deferWebflowJs } from './html/webflowJs.mjs';

// TODO: limit to only changed files
export const improveCoreWebVitals = async ({ sourceDirectory, destinationDirectory, cdnUrl, site, uuid }) => {
  // Only include .html files
  const files = getDirectoryContents(sourceDirectory, { includeOnly: /\.html$/ });

  for (let sourcePath of files) {
    // remove base path
    const filePath = sourcePath.replace(sourceDirectory, '');
    const pagePath = filePath.replace('index.html', '')

    const htmlDestinationPath = path.join(destinationDirectory, filePath)
    let html = fs.readFileSync(sourcePath, { encoding: 'utf-8' });

    // Process html improvements
    html = makeTypekitAsync({ html });
    html = deferWebflowJs({ html, cdnUrl });

    // TODO: Not producing optimal results yet
    // html = minifyHtml({ html });

    // Process css improvements
    let { css, html: modifiedHtml } = await reduceCss({ html, destinationDirectory, htmlDestinationPath, cdnUrl, pagePath, uuid });
    html = modifiedHtml;

    fs.writeFileSync(htmlDestinationPath, html, { encoding: 'utf-8' });

    if (css) {
      const cssDestinationPath = getCssPath({ htmlPath: htmlDestinationPath, uuid }); // file location for CSS
      fs.writeFileSync(cssDestinationPath, css, { encoding: 'utf-8' });
    }
  }
  return true;
}
