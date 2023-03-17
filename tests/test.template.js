// Run the test for every URL. `global.urls` is created in `/tests/setup.mjs`
test.each(global.urls)('Something about URL: %s', (url) => {
  // Use global.html(url) to get html source code for a particular URL. Any tests can be done on that
  const matches = global.html(url).match(/foo/ig);

  // Jest expects
  expect(matches).toBe(null);
});
