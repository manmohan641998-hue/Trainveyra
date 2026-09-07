// TrainVeyra — RailRadar API proxy
// This function runs on Netlify's server, NOT in the browser.
// The API key stays here and is never sent to the visitor's device.
//
// SETUP:
// 1. In Netlify dashboard → Site settings → Environment variables
// 2. Add a variable named: RAILRADAR_API_KEY
// 3. Value: your key from https://railradar.in/developers (starts with rr_live_)
// 4. Redeploy the site.

exports.handler = async function (event) {
  const RAILRADAR_KEY = process.env.RAILRADAR_API_KEY;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (!RAILRADAR_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Server is missing RAILRADAR_API_KEY. Set it in Netlify environment variables.' } }),
    };
  }

  const { path, ...params } = event.queryStringParameters || {};
  if (!path) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Missing "path" query parameter.' } }),
    };
  }

  try {
    const url = new URL('https://api.railradar.in/v1' + path);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });

    const upstream = await fetch(url.toString(), {
      headers: { Authorization: 'Bearer ' + RAILRADAR_KEY },
    });
    const data = await upstream.json();

    return {
      statusCode: upstream.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ success: false, error: { message: 'Proxy error: ' + err.message } }),
    };
  }
};
