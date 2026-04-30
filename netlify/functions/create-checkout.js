exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const amountRand = parseFloat(body.amount);
  if (!amountRand || amountRand < 10) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Minimum donation is R10' }) };
  }

  const amountCents = Math.round(amountRand * 100);

  const secretKey = process.env.YOCO_SECRET_KEY;
  if (!secretKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Payment service not configured' }) };
  }

  try {
    const response = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountCents,
        currency: 'ZAR',
        successUrl: 'https://kathucats.co.za/donate.html?status=success',
        cancelUrl: 'https://kathucats.co.za/donate.html?status=cancelled',
        failureUrl: 'https://kathucats.co.za/donate.html?status=failed',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Yoco error:', data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.errorCode || 'Payment service error' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ redirectUrl: data.redirectUrl }),
    };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
