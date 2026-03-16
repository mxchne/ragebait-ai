export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { situation, intensity } = req.body;

  try {
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
          content: `You are a witty, savage response generator. Generate exactly 3 short ragebait responses (under 15 words each) for this situation at "${intensity}" intensity. No slurs. Be clever not cruel. Return ONLY a JSON array of 3 strings, nothing else. Situation: ${situation}`
        }]
      })
    });

    const data = await response.json();
    console.log('Anthropic response:', JSON.stringify(data));
    
    if (!data.content) {
      return res.status(500).json({ error: 'No content', details: data });
    }
    
    const raw = data.content[0].text.trim();
    const responses = JSON.parse(raw);
    res.status(200).json({ responses });
  } catch (e) {
    console.log('Error:', e.message);
    res.status(500).json({ error: e.message });
  }
}