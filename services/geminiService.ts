import { Message } from '../types';
import { checkFastResponse } from './fastResponseService';
import { GoogleGenAI } from '@google/genai';

const responseCache = new Map<string, string>();

let ai: GoogleGenAI | null = null;
try {
  // Initialize with the API key injected by Vite
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.error("Failed to initialize Gemini SDK", e);
}

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  onChunk?: (text: string) => void
): Promise<string> => {
  try {
    // 1. Check Local Memory (Fast Path)
    const isGuidedIntake = newMessage.includes("I need help drafting a formal complaint or taking action for the following incident:");
    
    if (isGuidedIntake) {
      // Extract details using regex
      const categoryMatch = newMessage.match(/Category:\s*(.*)/);
      const platformMatch = newMessage.match(/Platform\/App involved:\s*(.*)/);
      const dateMatch = newMessage.match(/Date of incident:\s*(.*)/);
      const perpetratorMatch = newMessage.match(/Perpetrator details \(if known\):\s*(.*)/);
      const descriptionMatch = newMessage.match(/Description of what happened:\s*(.*)/);

      const category = categoryMatch ? categoryMatch[1] : 'Cybercrime Incident';
      const platform = platformMatch ? platformMatch[1] : 'Not specified';
      const date = dateMatch ? dateMatch[1] : 'Not specified';
      const perpetrator = perpetratorMatch ? perpetratorMatch[1] : 'Unknown';
      const description = descriptionMatch ? descriptionMatch[1] : 'Not specified';

      const emailJson = {
        to: "cyberdome.pol@kerala.gov.in",
        subject: `Complaint: ${category}`,
        body: `To,\nThe Station House Officer\nCyber Crime Police Station\n\nSubject: Complaint regarding ${category}\n\nRespected Sir/Madam,\n\nI, [Your Name], residing at [Your Address], would like to report an incident that occurred on ${date}.\n\nIncident Details:\nPlatform: ${platform}\nDescription: ${description}\n\nSuspect Information:\n${perpetrator}\n\nI request you to kindly investigate this matter and take necessary action.\n\nSincerely,\n[Your Name]\n[Your Phone Number]`
      };

      const response = `I have generated a customized police complaint draft based on the details you provided. Please review it, fill in your personal information, and send it to the authorities.\n\n:::EMAIL_JSON::${JSON.stringify(emailJson)}:::\n\n**Privacy Note**: Please fill in your real name, phone number, and address manually before sending. Do not share them here.\n\n<<Next: Call 1930 | Report Leaked Photos | Secure My Device>>`;
      if (onChunk) onChunk(response);
      return response;
    }

    const fastResponse = checkFastResponse(newMessage);
    if (fastResponse) {
      if (onChunk) onChunk(fastResponse);
      return fastResponse;
    }

    // 1.5 Check Cache
    const cacheKey = newMessage.trim().toLowerCase();
    if (responseCache.has(cacheKey)) {
      console.log("Returning cached response for:", cacheKey);
      const cached = responseCache.get(cacheKey)!;
      if (onChunk) onChunk(cached);
      return cached;
    }
    
    try {
      const persistedCache = localStorage.getItem('gemini_cache');
      if (persistedCache) {
        const parsedCache = JSON.parse(persistedCache);
        if (parsedCache[cacheKey]) {
          responseCache.set(cacheKey, parsedCache[cacheKey]);
          if (onChunk) onChunk(parsedCache[cacheKey]);
          return parsedCache[cacheKey];
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    if (!ai) {
      return "⚠️ **Configuration Error**\n\nThe Gemini API key is missing or invalid. Please configure a valid API key in your environment variables to continue.";
    }

    // 2. Format history for Gemini API
    const formattedHistory = history.slice(-15).map((msg: Message) => {
      let cleanText = msg.text;
      if (msg.role !== 'user') {
        cleanText = cleanText.replace(/:::TAKEDOWN_JSON::[\s\S]*?(?:::|$)/g, '[Takedown Guide Provided]');
        cleanText = cleanText.replace(/:::SECURITY_JSON::[\s\S]*?(?:::|$)/g, '[Security Guide Provided]');
        cleanText = cleanText.replace(/:::EMAIL_JSON::[\s\S]*?(?:::|$)/g, '[Email Draft Provided]');
      }
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: cleanText }]
      };
    });

    formattedHistory.push({
      role: 'user',
      parts: [{ text: newMessage }]
    });

    const mergedHistory: any[] = [];
    for (const msg of formattedHistory) {
      if (mergedHistory.length > 0 && mergedHistory[mergedHistory.length - 1].role === msg.role) {
        mergedHistory[mergedHistory.length - 1].parts[0].text += `\n\n${msg.parts[0].text}`;
      } else {
        mergedHistory.push({ role: msg.role, parts: [{ text: msg.parts[0].text }] });
      }
    }

    // Ensure the first message is from the user
    while (mergedHistory.length > 0 && mergedHistory[0].role === 'model') {
      mergedHistory.shift();
    }

    if (mergedHistory.length === 0) {
      const response = "I'm sorry, I didn't catch that. Could you please rephrase?";
      if (onChunk) onChunk(response);
      return response;
    }

    const systemInstruction = `You are Grid Safety, an expert cyber-safety assistant. You provide immediate, actionable, and empathetic support to victims of cyber-harassment, scams, and digital threats.

CRITICAL RULES:
1. NEVER output markdown code blocks for JSON. Always use the exact format :::TYPE_JSON::{"key":"value"}:::
2. Responses MUST be detailed, visually appealing, and provide clear step-by-step instructions.
3. Use bold text, headings, and lists to make responses easy to read.
4. If the user asks for a takedown guide, provide it using :::TAKEDOWN_JSON::[{"id":"1","title":"Step 1","description":"Do this","actionUrl":"https://link","actionLabel":"Go","icon":"fa-shield"}]:::
5. If the user asks for a security checklist, provide it using :::SECURITY_JSON::{"ios":["Step 1","Step 2"],"android":["Step 1","Step 2"]}:::
6. If the user asks for an email draft, provide it using :::EMAIL_JSON::{"to":"email@domain.com","subject":"Subject","body":"Body"}:::
7. If the user asks for account recovery steps or future protection, ALWAYS include instructions to change to a strong password and enable App-Based 2FA (specifically mentioning Microsoft Authenticator). Use :::PROTECTION_JSON::[{"id":"p1","title":"Strong Password","description":"Use 12+ chars","icon":"fa-key","category":"password"},{"id":"p2","title":"2FA","description":"Use Microsoft Authenticator","icon":"fa-shield-halved","category":"2fa"}]::: for these steps.

Always end your response with 2-4 short, actionable suggestions for the user's next message, formatted exactly like this:
<<Next: Suggestion 1 | Suggestion 2 | Suggestion 3>>`;

    let fullResponse = '';
    
    try {
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.1-flash-lite",
        contents: mergedHistory,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
          maxOutputTokens: 800,
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullResponse += chunk.text;
          if (onChunk) {
            onChunk(chunk.text);
          }
        }
      }
    } catch (error: any) {
      console.error("Gemini SDK Error:", error);
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('API key not valid') || errorMessage.includes('API key is missing')) {
        return "⚠️ **Configuration Error**\n\nThe Gemini API key is missing or invalid. Please configure a valid API key in your environment variables to continue.";
      }
      return `⚠️ **Connection Error**\n\nI am having trouble connecting to my secure servers right now. Please check your internet connection and try again in a moment.\n\n<<Next: Report UPI Scam | Draft Police Complaint | Report Leaked Photos>>`;
    }

    if (responseCache.size > 50) {
      const firstKey = responseCache.keys().next().value;
      if (firstKey) responseCache.delete(firstKey);
    }
    responseCache.set(cacheKey, fullResponse);
    
    try {
      const cacheObj = Object.fromEntries(responseCache);
      localStorage.setItem('gemini_cache', JSON.stringify(cacheObj));
    } catch (e) {
      // Ignore localStorage errors
    }

    return fullResponse;

  } catch (error: any) {
    console.error("Chat Service Error:", error);
    return "⚠️ **Connection Error**\n\nI am having trouble connecting to my secure servers right now. Please check your internet connection and try again in a moment.\n\n<<Next: Report UPI Scam | Draft Police Complaint | Report Leaked Photos>>";
  }
};