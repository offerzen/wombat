import fs from 'fs';
import path from 'path';
import { getDirectoryContents } from '../../helpers/utils.mjs';

export const rewriteStagingUrls = ({ sourceDirectory, destinationDirectory, site }) => {
  /* The following is an example of how to ensure staging deployments don't have any URLs pointing at production.
     Commented out since it's very specific to OfferZen
  */

  // if (process.env.NODE_ENV !== 'staging') {
  //   return;
  // }

  // const files = getDirectoryContents(sourceDirectory, { includeOnly: /\.(html|css|svg|js)$/ });


  // for (let sourcePath of files) {
  //   const filePath = sourcePath.replace(sourceDirectory, ''); // remove base path
  //   const fileDestinationPath = path.join(destinationDirectory, filePath)

  //   let contents = fs.readFileSync(sourcePath, { encoding: 'utf-8' });
  //   let offerzenPattern = /href=\"https?\:\/\/www\.offerzen\.com[\/]?/i;

  //   if (site.includes('webflow-thrive.webflow.io')) {
  //     offerzenPattern = /href=\"https?\:\/\/www\.offerzen\.com\/thrive[\/]?/i;
  //   }

  //   if (contents.match(offerzenPattern)) {
  //     contents = contents.replace(new RegExp(offerzenPattern, 'gi'), `href="/${site.replace(/^https?:\/\//, '').replace(/\/+$/, '')}/`);
  //     fs.writeFileSync(fileDestinationPath, contents, { encoding: 'utf-8' });
  //   }
  // }
  return true;
}
