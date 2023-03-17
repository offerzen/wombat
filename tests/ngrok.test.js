const testIf = (condition) => condition ? test : test.skip;
  
testIf(!global.site.match(/(webflow\.io)/ig)?.length).each(global.urls)('ngrok for %s', (url) => {
  // Match based on number so it's easy to see how many matches exist in a page
  const matches = global.html(url).match(/ngrok/ig)?.length ?? 0;

  expect(matches).toBe(0);
});
