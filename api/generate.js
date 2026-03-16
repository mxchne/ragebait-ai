export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
    
    const situation = body?.situation || '';
    const intensity = body?.intensity || 'mild';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Generate exactly 3 short ragebait responses (under 15 words each) at "${intensity}" intensity. No slurs. Be clever not cruel. Return ONLY a JSON array of 3 strings, nothing else. Situation: ${situation}`
        }]
      })
    });

    const data = await response.json();
    const raw = data.content[0].text.trim();
    const responses = JSON.parse(raw);
    res.status(200).json({ responses });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}