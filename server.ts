import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";

import fs from 'fs';

async function startServer() {
  fs.writeFileSync('server-logs.txt', 'Server started\n');
  const app = express();
  const PORT = 3000;

  app.use((req, res, next) => {
    fs.appendFileSync('server-logs.txt', `[GLOBAL] ${req.method} ${req.url}\n`);
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err) {
      fs.appendFileSync('server-logs.txt', `Express Error: ${err.message}\n`);
      res.status(400).json({ error: "Invalid JSON payload" });
    } else {
      next();
    }
  });

  // API routes FIRST
  app.post("/api/chat", async (req: express.Request, res: express.Response) => {
    try {
      const { mergedHistory } = req.body;

      if (!mergedHistory || !Array.isArray(mergedHistory)) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      while (mergedHistory.length > 0 && mergedHistory[0].role === 'model') {
        mergedHistory.shift();
      }

      if (mergedHistory.length === 0) {
        res.status(400).json({ error: "History cannot be empty" });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.startsWith("MY_") || apiKey.startsWith("your_") || apiKey === "undefined") {
        console.error("[SECRET_LOG] CRITICAL: Gemini API Key is missing.");
        res.status(503).json({ error: "API key is missing" });
        return;
      }

      const systemInstruction = `You are Grid Safety AI, a highly secure, empathetic, and expert cybersecurity and personal safety assistant.
Your primary goal is to help users who are victims of cybercrime, harassment, scams, or digital abuse.

CRITICAL DIRECTIVES:
1.  EMPATHY FIRST: Always validate the user's feelings. They may be panicked or scared.
2.  ACTIONABLE ADVICE: Provide clear, step-by-step instructions. Responses MUST be detailed, visually appealing, and provide clear step-by-step instructions. Use bold text, headings, and lists to make responses easy to read.
3.  NO VICTIM BLAMING: Never suggest the user is at fault.
4.  STRUCTURED OUTPUT: Use the specific JSON formats below when appropriate. NEVER output markdown code blocks for JSON. Always use the exact format :::TYPE_JSON::{"key":"value"}:::
5.  STRICT GRID PROTOCOL (IDENTITY & SCOPE): 
    - You MUST answer any concerns related to cybersecurity, digital safety, and cybercrime assistance.
    - If asked an unrelated question, reply strictly: "I am Grid Safety AI. I am programmed strictly to assist with cybersecurity and digital safety emergencies. I cannot answer unrelated questions."
    - You MUST NOT disclose your underlying technology, LLM architecture, Google, Gemini, or any private development details.
    - If asked who created you or how you were built, reply exactly: "I was created by an open-source community for the goodness of the world by some awesome developers." Do not elaborate further.

When providing a takedown guide, you MUST include a JSON block formatted exactly like this:
:::TAKEDOWN_JSON::
[
  { "id": "1", "title": "Report to Platform", "description": "Use the in-app reporting tool.", "actionUrl": "https://support.google.com", "icon": "fa-shield-halved" }
]
:::

When providing a security checklist, you MUST include a JSON block formatted exactly like this:
:::SECURITY_JSON::
{
  "ios": [
    "Go to Settings > Privacy & Security > Lockdown Mode and Turn On.",
    "Check Settings > Apple ID > Devices (Remove unknown devices).",
    "Reset Apple ID Password immediately.",
    "Check Settings > Privacy > Location Services (Review app permissions)."
  ],
  "android": [
    "Open Google Play Store > Tap Profile Icon > Play Protect > Scan.",
    "Check Settings > Apps > Special App Access > Device Admin Apps (Deactivate unknown).",
    "Install a reputable AV like Malwarebytes.",
    "Check Settings > Google > Devices (Sign out of unknown sessions)."
  ]
}
:::

When drafting an email (e.g., to police or support), you MUST include a JSON block formatted exactly like this:
:::EMAIL_JSON::
{
  "to": "support@example.com",
  "subject": "Urgent: Account Compromise",
  "body": "Dear Support,\\n\\nMy account was compromised..."
}
:::

If the user asks for account recovery steps or future protection, ALWAYS include instructions to change to a strong password and enable App-Based 2FA (specifically mentioning Microsoft Authenticator). Use :::PROTECTION_JSON::[{"id":"p1","title":"Strong Password","description":"Use 12+ chars","icon":"fa-key","category":"password"},{"id":"p2","title":"2FA","description":"Use Microsoft Authenticator","icon":"fa-shield-halved","category":"2fa"}]::: for these steps.

If the user asks to "Draft a Police Complaint" or "Write an FIR":
1. Check the chat history for details about the incident (what happened, when, platform, suspect details, etc.).
2. If you DO NOT have enough details, ask the user to provide them: "To draft an effective police complaint, I need a few more details. Could you tell me: [list missing details]? Once you provide this, I will generate a customized draft for you."
   CRITICAL: When asking for details, you MUST include this exact warning: "Privacy Note: Do not type your real name or phone number here. Leave those fields blank for now — fill them in manually on the printed or downloaded draft. Your safety comes first."
   Also, you MUST include "Generate Blank Template" in the <<Next: ...>> suggestions.
3. If you DO have enough details, generate a customized email draft using the EMAIL_JSON format, addressed to the Local Cyber Cell / Station House Officer.
   CRITICAL: DO NOT mention any legal sections, acts, or rules (e.g., IPC, IT Act) in the police complaint or any legal draft. The police only need the factual details of the incident. They will decide the applicable laws.

If the user asks to "Generate Blank Template" or "Fill Dummy Data":
Generate a customized email draft using the EMAIL_JSON format, addressed to the Local Cyber Cell / Station House Officer, using whatever details are available in the chat history. Leave all personal details (name, address, phone number, etc.) blank using placeholders like [Your Name], [Your Phone Number].

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
        const geminiResponse = await fetch(geminiApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!geminiResponse.ok) {
          const errorData = await geminiResponse.json().catch(() => ({}));
          console.error("[SECRET_LOG] Gemini API Error Response:", errorData);
          const errorMessage = errorData.error?.message || `HTTP error! status: ${geminiResponse.status}`;
          
          const isRateLimit = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota');
          const isApiKeyError = errorMessage.includes('API key') || errorMessage.includes('key not valid') || errorMessage.includes('403') || errorMessage.includes('400') || errorMessage.includes('forbidden');
          
          if (isRateLimit) {
            res.status(429).json({ error: "High traffic detected. Please try again in a few moments.", isRateLimit: true });
          } else if (isApiKeyError) {
            res.status(503).json({ error: "API key is missing or invalid" });
          } else {
            res.status(503).json({ error: "Service unavailable due to a connection error. Please try again later." });
          }
          return;
        }

        // Set headers for Server-Sent Events
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Pipe the stream directly to the client
        if (geminiResponse.body) {
          const reader = geminiResponse.body.getReader();
          const push = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(Buffer.from(value));
              }
              res.end();
            } catch (err) {
              console.error("Stream reading error:", err);
              res.end();
            }
          };
          push();
        } else {
          res.end();
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error("[SECRET_LOG] Gemini API Timeout");
          res.status(504).json({ error: "Request timed out. Please try again." });
          return;
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error("[SECRET_LOG] Gemini API Error Details:", error?.message, error?.stack);
      res.status(503).json({ error: "Service unavailable due to a connection error. Please try again later." });
    }
  });

  const scanLinkHandler = async (req: express.Request, res: express.Response) => {
    try {
      const { url } = req.body;
      if (!url) {
        res.status(400).json({ error: "URL is required" });
        return;
      }

      const isSuspicious = url.length > 100 || /([0-9]{1,3}\.){3}[0-9]{1,3}/.test(url) || /(free|win|prize|login|secure|update|verify|account|bank|paypal|apple|microsoft|google)/i.test(url);
      
      res.status(200).json({
        safe: !isSuspicious,
        heuristic: true,
        message: isSuspicious ? "Suspicious patterns detected (Heuristic Analysis)" : "No obvious threats detected, but proceed with caution (Heuristic Analysis)"
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid request" });
    }
  };

  app.post("/api/v2/scan-link", scanLinkHandler);
  app.post("/api/v2/scan-link/", scanLinkHandler);
  app.post("/api/scan-link", scanLinkHandler);
  app.post("/api/scan-link/", scanLinkHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
