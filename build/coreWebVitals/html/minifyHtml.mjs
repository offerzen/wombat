import { minify } from 'html-minifier';

export const minifyHtml = ({ html }) => {
  return minify(html, {
    collapseWhitespace: true,
    collapseInlineTagWhitespace: true,
    minifyJS: true,
    removeRedundantAttributes: true,
  });
}
