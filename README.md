# Grid Safety

**Grid Safety** is a free, open-source safety tool designed to help cyber harassment victims in India. It provides immediate, actionable, and private assistance for dealing with leaked photos, deepfakes, hacked accounts, financial fraud, and cybercrime complaints.

[![Website](https://img.shields.io/badge/Website-gridsafety.in-10b981?style=flat-square)](https://gridsafety.in)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## The Mission

Cyber harassment and digital abuse are escalating threats. Victims often feel overwhelmed, confused about legal procedures, and unsure of how to secure their digital lives. Grid Safety bridges this gap by offering a *privacy-first, mobile-optimized assistant* that guides users through the exact steps needed to regain control, report abuse, and secure their accounts.

**Grid Safety is completely free to use and open-source.**

---

## Key Features

### Takedowns & Content Removal
*   **Leaked Photo & Deepfake Removal:** Step-by-step guidance on reporting and removing non-consensual intimate imagery (NCII) and synthetic media from platforms like Meta, Google, X, and Telegram.
*   **StopNCII.org Integration:** Instructions on using global standards to block private photos from being shared, utilizing local hashing.
*   **Takedown Generator:** Automatically generate formal legal takedown notices to send to platforms and web hosts.

### Account Recovery & Device Security
*   **Hacked Account Recovery:** Immediate, platform-specific steps to recover compromised WhatsApp, Instagram, Facebook, and Bank accounts.
*   **Device Hardening:** Security checklists for iOS and Android to remove spyware, revoke permissions, and secure devices.
*   **Identity Guard Protocol:** Check for data breaches, validate UPI IDs, and scan suspicious links for phishing or malware.

### Legal & Cybercrime Support (India)
*   **Automated FIR Drafting:** Generates professional, customized police complaints addressed to the local Cyber Cell or Station House Officer (SHO).
*   **National Helplines:** One-tap access to the National Cyber Crime Reporting Portal (1930) and emergency services (112).
*   **Cyber Law Guide:** Simplified explanations of relevant Indian laws, including Section 66E (Privacy), Section 67 (Obscenity), and cyber stalking regulations.

### Privacy-First Architecture
*   **Zero-Knowledge Processing:** Evidence hashing (SHA-256) happens locally on your device. Your photos and videos are **never** uploaded to our servers.
*   **No Chat Storage:** Conversations are processed in real-time and stored only in your browser's local storage. We do not maintain a database of your chats.
*   **Panic Button:** A discreet "Exit" button that instantly clears your session and replaces the screen for physical safety.

---

## Technology Stack

*   **Frontend:** React 18, TypeScript, Vite
*   **Styling:** Tailwind CSS (Mobile-first, Dark Mode optimized)
*   **AI Engine:** Google Gemini 3.1
*   **Icons:** Lucide React & FontAwesome 6
*   **Deployment:** Cloudflare Pages / Netlify Ready

---

## Development Setup

### Prerequisites
*   Node.js (v18 or higher)
*   A Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/grid-safety.git
    cd grid-safety
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

---

## Contributing

Grid Safety is an open-source project, and we welcome contributions from developers, cybersecurity experts, and legal professionals. Whether it's improving the AI prompts, adding new local data cards, or translating the interface, your help can make a real difference for victims of cybercrime.

Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

---

## Disclaimer

Grid Safety provides guidance and automated drafting tools based on general cybersecurity practices and Indian cyber laws. **It does not constitute formal legal advice.** Users should consult with legal professionals or law enforcement for official assistance. In emergencies, always call 112 or 1930.

---

*Built for safety. Engineered for privacy. Dedicated to helping victims of cyber harassment.*
