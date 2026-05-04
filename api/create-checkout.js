export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const amountRand = parseFloat(body.amount);
  if (!amountRand || amountRand < 1) {
    return res.status(400).json({ error: 'Minimum donation is R1' });
  }

  const amountCents = Math.round(amountRand * 100);

  const secretKey = process.env.YOCO_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Payment service not configured' });
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
        successUrl: 'https://kathucats.co.za/donate?status=success',
        cancelUrl: 'https://kathucats.co.za/donate?status=cancelled',
        failureUrl: 'https://kathucats.co.za/donate?status=failed',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Yoco error:', data);
      return res.status(response.status).json({ error: data.errorCode || 'Payment service error' });
    }

    return res.status(200).json({ redirectUrl: data.redirectUrl });
  } catch (err) {
    console.error('Function error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
