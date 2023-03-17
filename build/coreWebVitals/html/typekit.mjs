export const makeTypekitAsync = ({ html }) => {
  return html.replace(/try\{Typekit\.load\(\);\}/g, 'try{Typekit.load({ async: true });}');
}
