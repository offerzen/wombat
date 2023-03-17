import Sitemapper from 'sitemapper';

export const parseSitemap = async (site) => {
  let urlWithoutTrailingSlash = site.replace(/\/$/, '');
  if (!urlWithoutTrailingSlash.match(/^http/)) {
    urlWithoutTrailingSlash = 'https://' + urlWithoutTrailingSlash;
  }
  const sitemap = new Sitemapper({
    url: `${urlWithoutTrailingSlash}/sitemap.xml`,
    timeout: 15000, // 15 seconds
  });

  try {
    const { sites, errors } = await sitemap.fetch();
    if (errors?.length) {
      console.error(errors);
    }

    // Change webflow URLs to actual domain
    if (site.includes('webflow.io')) {
      return sites.map((url) => {
        return url.replace(process.env.PRODUCTION_DOMAIN, 'webflow.io'); // e.g. PRODUCTION_DOMAIN=test.com (leave out protocol)
      });
    }
    return sites;
  } catch (error) {
    console.error(error);
  }
};
