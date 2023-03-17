import fs from 'fs';
import path from 'path';
import { getDirectoryContents } from '../../helpers/utils.mjs';

export const rewriteAssetPaths = ({ cdnUrl, sourceDirectory, destinationDirectory }) => {
  const files = getDirectoryContents(sourceDirectory, { includeOnly: /\.(html|css|svg|js)$/ });

  for (let sourcePath of files) {
    // remove base path
    const filePath = sourcePath.replace(sourceDirectory, '');

    const fileDestinationPath = path.join(destinationDirectory, filePath)

    let contents = fs.readFileSync(sourcePath, { encoding: 'utf-8' });
    const cdnPattern = /https?\:\/\/assets\.website\-files\.com\//i;

    if (contents.match(cdnPattern)) {
      contents = contents.replace(new RegExp(cdnPattern, 'gi'), `${cdnUrl.replace(/\/+$/, '')}/assets.website-files.com/`);
      fs.writeFileSync(fileDestinationPath, contents, { encoding: 'utf-8' });
    }
  } 
  return true;

}
 