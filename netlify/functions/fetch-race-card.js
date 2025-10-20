// Netlify Function: Fetch Nankan Race Card HTML
// URL: /.netlify/functions/fetch-race-card

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { url } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    // Validate URL is from nankankeiba.com
    if (!url.includes('nankankeiba.com')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid URL. Must be from nankankeiba.com' })
      };
    }

    console.log('Fetching URL:', url);

    // Fetch the page using native fetch (Node.js 18+)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get response as buffer to handle Shift-JIS encoding
    const buffer = await response.arrayBuffer();

    // Decode from Shift-JIS to UTF-8
    // TextDecoder with 'shift-jis' encoding (also accepts 'shift_jis', 'sjis')
    const decoder = new TextDecoder('shift-jis');
    const html = decoder.decode(buffer);

    console.log('Successfully fetched HTML, length:', html.length);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        html: html,
        length: html.length
      })
    };
  } catch (error) {
    console.error('Error fetching race card:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
