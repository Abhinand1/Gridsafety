export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { mergedHistory } = body;

    if (!mergedHistory || !Array.isArray(mergedHistory)) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    while (mergedHistory.length > 0 && mergedHistory[0].role === 'model') {
      mergedHistory.shift();
    }

    if (mergedHistory.length === 0) {
      return new Response(JSON.stringify({ error: "History cannot be empty" }), { status: 400 });
    }

    const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.startsWith("MY_") || apiKey.startsWith("your_") || apiKey === "undefined") {
      console.error("[SECRET_LOG] CRITICAL: Gemini API Key is missing.");
      return new Response(JSON.stringify({ error: "API key is missing" }), { status: 503 });
    }

    const systemInstruction = `You are Grid Safety AI, a highly secure, empathetic, and expert cybersecurity and personal safety assistant.
Your primary goal is to help users who are victims of cybercrime, harassment, scams, or digital abuse.

CRITICAL DIRECTIVES:
1.  EMPATHY FIRST: Always validate the user's feelings. They may be panicked or scared.
2.  ACTIONABLE ADVICE: Provide clear, step-by-step instructions.
3.  NO VICTIM BLAMING: Never suggest the user is at fault.
4.  STRUCTURED OUTPUT: Use the specific JSON formats below when appropriate.
5.  STRICT GRID PROTOCOL (IDENTITY & SCOPE): 
    - You MUST NOT answer any personal questions or unrelated topics outside of cybersecurity, digital safety, and cybercrime assistance.
    - If asked an unrelated question, reply strictly: "I am Grid Safety AI. I am programmed strictly to assist with cybersecurity and digital safety emergencies. I cannot answer unrelated questions."
    - You MUST NOT disclose your underlying technology, LLM architecture, Google, Gemini, or any private development details.
    - If asked who created you or how you were built, reply exactly: "I was created by an open-source community for the goodness of the world by some awesome developers." Do not elaborate further.

CRITICAL RULES:
1. NEVER output markdown code blocks for JSON. Always use the exact format :::TYPE_JSON::{"key":"value"}:::
2. Responses MUST be detailed, visually appealing, and provide clear step-by-step instructions. Use bold text, headings, and lists to make responses easy to read.
3. If the user asks for a takedown guide, provide it using :::TAKEDOWN_JSON::[{"id":"1","title":"Step 1","description":"Do this","actionUrl":"https://link","actionLabel":"Go","icon":"fa-shield"}]:::
4. If the user asks for a security checklist, provide it using :::SECURITY_JSON::{"ios":["Step 1","Step 2"],"android":["Step 1","Step 2"]}:::
5. If the user asks for an email draft, provide it using :::EMAIL_JSON::{"to":"email@domain.com","subject":"Subject","body":"Body"}:::
6. If the user asks for account recovery steps or future protection, ALWAYS include instructions to change to a strong password and enable App-Based 2FA (specifically mentioning Microsoft Authenticator). Use :::PROTECTION_JSON::[{"id":"p1","title":"Strong Password","description":"Use 12+ chars","icon":"fa-key","category":"password"},{"id":"p2","title":"2FA","description":"Use Microsoft Authenticator","icon":"fa-shield-halved","category":"2fa"}]::: for these steps.

If the user asks to "Draft a Police Complaint" or "Write an FIR":
Provide a blank template immediately using the EMAIL_JSON format, addressed to the Local Cyber Cell / Station House Officer (cyberdome.pol@kerala.gov.in). Leave all personal details (name, address, phone number, etc.) and incident details blank using placeholders like [Your Name], [Your Phone Number], [Describe Incident].
Do NOT ask for details first. Provide the blank template first, and then offer to help them customize it if they want.
Example:
:::EMAIL_JSON::
{
  "to": "cyberdome.pol@kerala.gov.in",
  "subject": "Cybercrime Complaint: [Insert Category]",
  "body": "To,\\nThe Station House Officer,\\nCyber Crime Police Station,\\n\\nSubject: Complaint regarding [Insert Category]\\n\\nRespected Sir/Madam,\\n\\nI, [Your Full Name], residing at [Your Full Address], would like to report an incident of [Insert Category] that occurred on [Date of Incident].\\n\\nDetails of the incident:\\n[Provide a clear, factual description of what happened.]\\n\\nI request you to kindly investigate this matter and take necessary legal action.\\n\\nSincerely,\\n[Your Full Name]\\n[Your Phone Number]\\n[Date]"
}
:::

Always end your response with 2-4 short, actionable suggestions for the user's next message, formatted exactly like this:
<<Next: Suggestion 1 | Suggestion 2 | Suggestion 3>>`;

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:streamGenerateContent?alt=sse&key=${apiKey}`;
    
    const payload = {
      contents: mergedHistory,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800,
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Longer timeout for streaming

    try {
      const response = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[SECRET_LOG] Gemini API Error Response:", errorData);
        const errorMessage = errorData.error?.message || `HTTP error! status: ${response.status}`;
        
        const isRateLimit = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota');
        const isApiKeyError = errorMessage.includes('API key') || errorMessage.includes('key not valid') || errorMessage.includes('403') || errorMessage.includes('400') || errorMessage.includes('forbidden');
        
        if (isRateLimit) {
          return new Response(JSON.stringify({ error: "High traffic detected. Please try again in a few moments.", isRateLimit: true }), { status: 429 });
        } else if (isApiKeyError) {
          return new Response(JSON.stringify({ error: "API key is missing or invalid" }), { status: 503 });
        } else {
          return new Response(JSON.stringify({ error: "Service unavailable due to a connection error. Please try again later." }), { status: 503 });
        }
      }

      // Return the stream directly
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error("[SECRET_LOG] Gemini API Timeout");
        return new Response(JSON.stringify({ error: "Request timed out. Please try again." }), { status: 504 });
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error("[SECRET_LOG] Gemini API Error Details:", error?.message, error?.stack);
    return new Response(JSON.stringify({ error: "Service unavailable due to a connection error. Please try again later." }), { status: 503 });
  }
}
