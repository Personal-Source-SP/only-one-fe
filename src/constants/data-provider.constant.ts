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
        imageUrl: $element.find('img').attr('src') || '',
        relativeUrl: $element.find('a').attr('href') || '',
        metadata: {}
      };

      results.push(product);
    });

    return results;
  } catch (error) {
    console.error('Error searching the HTML:', error);
    return null;
  }
};
`;

export const DEFAULT_SEARCH_API_FUNCTION_GENERATOR = `
const searchData = async (data, axios) => {
  try {
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
      ? data
      : [];

    const results = items.map((item) => ({
      url: item?.url || item?.link || item?.productUrl || '',
      title: item?.title || item?.name || '',
      imageUrl: item?.imageUrl || item?.thumbnail || item?.image || '',
      relativeUrl: item?.relativeUrl || '',
      metadata: item?.metadata || {}
    }));

    return results;
  } catch (error) {
    console.error('Error searching the API data:', error?.message);
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
