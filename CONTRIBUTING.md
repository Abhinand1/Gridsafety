# Contributing to Grid Safety

Thank you for your interest in contributing to Grid Safety! We are a privacy-first, open-source project dedicated to helping victims of cyber-harassment, scams, and digital abuse.

## 🛡️ Core Principles (MANDATORY)

Before submitting a Pull Request, please ensure your code adheres to our strict privacy and security guidelines:

1. **Zero Data Retention**: No user data, chat logs, or PII should ever be sent to a backend database. All processing must happen locally on the device or via secure, ephemeral API calls (e.g., Gemini API).
2. **No Third-Party Tracking**: Do not add any analytics, tracking pixels, or marketing SDKs. We only use basic, anonymized page view tracking.
3. **Local First**: Whenever possible, implement features using local browser APIs (e.g., Web Crypto API for hashing) instead of server-side processing.
4. **Accessibility**: Ensure all UI components are accessible via keyboard and screen readers. Use high-contrast colors.

## 🚀 How to Contribute

1. **Fork the Repository**: Create your own fork of the project.
2. **Create a Branch**: Create a feature branch (`git checkout -b feature/your-feature-name`).
3. **Make Changes**: Implement your feature or bug fix.
4. **Test Thoroughly**: Ensure your changes work across different devices and browsers. Test offline functionality if applicable.
5. **Submit a Pull Request**: Describe your changes in detail, explaining how they adhere to our core principles.

## 🛠️ Development Setup

1. Install dependencies: `npm install`
2. Create a `.env` file with your `GEMINI_API_KEY`.
3. Run the development server: `npm run dev`

## 📝 Adding Fast Responses

If you are adding a new "Fast Response" to `services/fastResponseService.ts`:
- Ensure the trigger regex is specific enough to avoid false positives.
- Keep the response empathetic, actionable, and free of victim-blaming language.
- Use the structured JSON formats (`:::TAKEDOWN_JSON::`, `:::SECURITY_JSON::`, `:::EMAIL_JSON::`) if applicable.

Thank you for helping make the digital world safer!
