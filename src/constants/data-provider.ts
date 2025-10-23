export const DEFAULT_PARSER_FUNCTION_GENERATOR = `
const extractData = (html) => {
  const $ = cheerio.load(html);
  try {
    // Extract data here to match expected output, including productVariants
  } catch (error) {
    console.error('Error scraping the HTML:', error);
    return null;
  }
};
`;

export const DEFAULT_SEARCH_FUNCTION_GENERATOR = `
const searchData = (html) => {
  const $ = cheerio.load(html);
  try {
    const productElements = $('\${resultSelector}');
    const results = [];

    productElements.each((_, element) => {
      const $element = $(element);

      const product = {
        url: $element.find('a').attr('href') || '',
        title: $element.find('.product-title').text().trim() || '',
        price: $element.find('.price').text().trim() || '',
        currency: $element.find('.price').attr('currency') || 'USD',
        imageUrl: $element.find('img').attr('src') || '',
        relativeUrl: $element.find('a').attr('href') || ''
      };

      results.push(product);
    });

    return results;
  } catch (error) {
    console.error('Error scraping the HTML:', error);
    return null;
  }
};
`;

export const DEFAULT_HTML_CONTENT_STRING = `
// Paste the HTML content here
`;
