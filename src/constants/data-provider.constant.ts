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

export const DEFAULT_API_FUNCTION_GENERATOR = `
const extractData = async (data, axios) => {
  const reviewItems = data?.map((i) => i.id);

  if (!reviewItems || reviewItems.length === 0) {
    return null;
  }

  try {
    // Extract data here to match expected output, including productVariants
    let responseData = [];

    for (const reviewItem of reviewItems) {
      const review = await axios.get(\`https://api.gai13.net/escort/reviews/\${reviewItem}\`);

      responseData.push(...(review?.data?.data?.review?.photos || []));
    }

    const results = responseData?.map((item) => ({
      url: item?.data?.dimensions?.original?.url,
    }));

    return results || [];
  } catch (error) {
    console.error('Error scraping the data:', error?.message);
    return null;
  }
};
`;
