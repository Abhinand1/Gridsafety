export async function onRequestPost(context: any) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { url } = body;
    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), { status: 400 });
    }

    const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.startsWith("MY_") || apiKey.startsWith("your_") || apiKey === "undefined") {
      return new Response(JSON.stringify({ error: "API key is missing" }), { status: 503 });
    }

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{ role: "user", parts: [{ text: `Analyze this URL for potential phishing, scams, or malicious intent: ${url}. Respond with a JSON object containing 'safe' (boolean), 'heuristic' (boolean, always true), and 'message' (string explaining the analysis briefly).` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    };

    const response = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to scan link" }), { status: 500 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      result = { safe: false, heuristic: true, message: "Failed to parse analysis result." };
    }

    return new Response(JSON.stringify({
      safe: result.safe ?? false,
      heuristic: true,
      message: result.message || "Analysis completed."
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  }
}
