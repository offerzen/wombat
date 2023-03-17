import fs from 'fs';
import path from 'path';

/**
 * Synchronously and recursively get directory contents
 * @param {string} dir                Path to files (use `path`)
 * @param {object} object             Defaults to empty object
 * @param {regex}  object.includeOnly Use single regex to define what files
 *                                    should be matched, others will be ignored
 */
export function getDirectoryContents(dir, { includeOnly } = {}) {
  var results = [];
  var list = fs.readdirSync(dir);

  list.forEach((file) => {
    file = path.join(dir, file);
    let include = true;

    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(getDirectoryContents(file, { includeOnly }));
    } else {
      /* Is a file */
      if (includeOnly) {
        include = file.match(includeOnly) != null;
      }
      if (!include) return;

      results.push(file);
    }
  });

  return results;
}

export function getLocalAssetPathFromCdn(url) {
  const cdnUrl = new RegExp(`(${process.env.CDN_URL}|${process.env.WEBFLOW_CDN_URL})`.replace(/\./g, '\\.'), 'i');

  let localPath = path.resolve('static');
  if (!localPath.match(`${path.sep}$`)) {
    localPath += path.sep;
  }

  const filePath = url.replace(cdnUrl, localPath);

  return filePath;
}

export function resolveUrl(base, src) {
  const url = new URL(src, new URL(base, 'resolve://'));
  if (url.protocol === 'resolve:') {
    // `base` can be a relative URL.
    const { pathname, search, hash } = url;
    return pathname + search + hash;
  }
  return url.toString();
}

// Internal use
const _pipe = (a, b) => (arg) => b(a(arg));

export const pipe = (...ops) => ops.reduce(_pipe)
