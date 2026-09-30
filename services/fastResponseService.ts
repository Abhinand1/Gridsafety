import { KERALA_CYBER_CONTACTS } from '../constants';

interface FastResponse {
  triggers: RegExp[];
  response: string;
}

// Pre-computed static JSONs to ensure 100% integrity and zero parsing errors
const TAKEDOWN_JSON = `:::TAKEDOWN_JSON::[{"id":"1","title":"Preserve Evidence","description":"Do not delete messages. Take screenshots of the URL, profile, and chat immediately.","icon":"fa-camera"},{"id":"2","title":"StopNCII.org (Global Block)","description":"Create a secure digital hash of your image on your device. This hash is shared with Facebook, Instagram, and TikTok to block the image from being uploaded. Your image never leaves your phone.","actionLabel":"Open StopNCII","actionUrl":"https://stopncii.org","icon":"fa-shield-halved"}]:::`;

const PROTECTION_JSON_DEFAULT = `:::PROTECTION_JSON::[{"id":"p1","title":"Strong Password","description":"Change to a 12+ character password with symbols and numbers. Never reuse passwords.","icon":"fa-key","category":"password"},{"id":"p2","title":"App-Based 2FA","description":"Download Microsoft Authenticator. Enable 2FA in Security Settings and scan the QR code.","icon":"fa-shield-halved","category":"2fa"},{"id":"p3","title":"Login Alerts","description":"Turn on notifications for unrecognized logins to catch hackers instantly.","icon":"fa-bell","category":"device"}]:::`;

const PROTECTION_JSON_WA = `:::PROTECTION_JSON::[{"id":"p1","title":"Two-Step Verification","description":"Go to Settings > Account > Two-step verification > Enable. Create a 6-digit PIN.","icon":"fa-lock","category":"password"},{"id":"p2","title":"Never Share OTP","description":"Never share your 6-digit SMS code with anyone, even friends or family.","icon":"fa-comment-slash","category":"privacy"},{"id":"p3","title":"App Lock","description":"Enable Fingerprint or Face ID lock for WhatsApp in Privacy settings.","icon":"fa-fingerprint","category":"device"}]:::`;

const SECURITY_JSON = `:::SECURITY_JSON::{"ios":["Go to Settings > Privacy & Security > Lockdown Mode and Turn On.","Check Settings > Apple ID > Devices (Remove unknown devices).","Reset Apple ID Password immediately and use a strong, unique password.","Download Microsoft Authenticator and enable App-Based 2FA for all your accounts.","Check Settings > Privacy > Location Services (Review app permissions)."],"android":["Open Google Play Store > Tap Profile Icon > Play Protect > Scan.","Check Settings > Apps > Special App Access > Device Admin Apps (Deactivate unknown).","Change your Google account password to a strong, unique password.","Download Microsoft Authenticator and enable App-Based 2FA for all your accounts.","Check Settings > Google > Devices (Sign out of unknown sessions)."]}:::`;

const SUICIDE_RESPONSE = `You are not alone. There is help available. Please reach out to these trained professionals immediately. Your life matters.

:::TAKEDOWN_JSON::[{"id":"1","title":"Tele-MANAS","description":"National 24/7 mental health helpline.","actionLabel":"Call 14416","actionUrl":"tel:14416","icon":"fa-phone-volume"},{"id":"2","title":"DISHA Kerala","description":"24/7 health and mental health helpline for Kerala.","actionLabel":"Call 1056","actionUrl":"tel:1056","icon":"fa-phone-volume"}]:::

Please call them now. They want to listen.`;

const HACKED_RESPONSE = `Do not panic. Do not click any links sent to you or pay any ransom. We need to act fast to recover your account.

**Which account has been compromised?**
Please select the specific platform so I can give you the exact recovery steps:

:::TAKEDOWN_JSON::[{"id":"1","title":"Social Media","description":"Recover Facebook, Instagram, or WhatsApp accounts.","icon":"fa-share-nodes"},{"id":"2","title":"Email Account","description":"Recover Gmail, Outlook, or Yahoo accounts.","icon":"fa-envelope"},{"id":"3","title":"Financial Account","description":"Secure your bank account or report UPI fraud.","icon":"fa-building-columns"}]:::

<<Next: Facebook Hacked | WhatsApp Hacked | Instagram Hacked | Email Hacked | Bank Account Hacked>>`;

const EMAIL_HACKED_MENU_RESPONSE = `### 📧 Email Account Compromised

Please select your email provider so I can give you the exact recovery steps:

:::TAKEDOWN_JSON::[{"id":"1","title":"Google / Gmail","description":"Recover a hacked Gmail or Google Workspace account.","icon":"fa-brands fa-google"},{"id":"2","title":"Microsoft / Outlook","description":"Recover a hacked Outlook, Hotmail, or Live account.","icon":"fa-brands fa-microsoft"},{"id":"3","title":"Yahoo Mail","description":"Recover a hacked Yahoo account.","icon":"fa-brands fa-yahoo"}]:::

<<Next: Gmail Hacked | Outlook Hacked | Yahoo Hacked>>`;

const GMAIL_HACKED_RESPONSE = `### 📧 Gmail Account Recovery

Follow these steps immediately to secure your Google account:

1. **Go to Recovery Page:** Visit [accounts.google.com/signin/recovery](https://accounts.google.com/signin/recovery).
2. **Change Password:** Update to a strong, unique password.
3. **Check Forwarding Rules:** Ensure the hacker hasn't set up auto-forwarding to their email in Gmail Settings.
4. **Enable 2FA:** Turn on App-based Two-Factor Authentication.

:::TAKEDOWN_JSON::[{"id":"1","title":"Google Recovery","description":"Visit the official Google account recovery page.","actionLabel":"Recover Gmail","actionUrl":"https://accounts.google.com/signin/recovery","icon":"fa-brands fa-google"},{"id":"2","title":"Secure Password","description":"Change your password immediately.","icon":"fa-key"}]:::

${PROTECTION_JSON_DEFAULT}

<<Next: Draft Police Complaint (Email) | Secure My Device>>`;

const OUTLOOK_HACKED_RESPONSE = `### 📧 Outlook/Microsoft Account Recovery

Follow these steps immediately to secure your Microsoft account:

1. **Go to Recovery Page:** Visit [account.live.com/acsr](https://account.live.com/acsr).
2. **Change Password:** Update to a strong, unique password.
3. **Check Forwarding Rules:** Ensure the hacker hasn't set up auto-forwarding to their email in Outlook Settings.
4. **Enable 2FA:** Turn on App-based Two-Factor Authentication.

:::TAKEDOWN_JSON::[{"id":"1","title":"Microsoft Recovery","description":"Visit the official Microsoft account recovery page.","actionLabel":"Recover Outlook","actionUrl":"https://account.live.com/acsr","icon":"fa-brands fa-microsoft"},{"id":"2","title":"Secure Password","description":"Change your password immediately.","icon":"fa-key"}]:::

${PROTECTION_JSON_DEFAULT}

<<Next: Draft Police Complaint (Email) | Secure My Device>>`;

const YAHOO_HACKED_RESPONSE = `### 📧 Yahoo Account Recovery

Follow these steps immediately to secure your Yahoo account:

1. **Go to Recovery Page:** Visit [login.yahoo.com/forgot](https://login.yahoo.com/forgot).
2. **Change Password:** Update to a strong, unique password.
3. **Check Forwarding Rules:** Ensure the hacker hasn't set up auto-forwarding to their email in Yahoo Settings.
4. **Enable 2FA:** Turn on App-based Two-Factor Authentication.

:::TAKEDOWN_JSON::[{"id":"1","title":"Yahoo Recovery","description":"Visit the official Yahoo account recovery page.","actionLabel":"Recover Yahoo","actionUrl":"https://login.yahoo.com/forgot","icon":"fa-brands fa-yahoo"},{"id":"2","title":"Secure Password","description":"Change your password immediately.","icon":"fa-key"}]:::

${PROTECTION_JSON_DEFAULT}

<<Next: Draft Police Complaint (Email) | Secure My Device>>`;

const FB_HACKED_RESPONSE = `### 📘 Facebook Account Recovery

Follow these steps immediately to secure your Facebook account:

1. **Go to the Recovery Page:** Visit [facebook.com/hacked](https://www.facebook.com/hacked).
2. **Change Password:** Update your security settings.
3. **Log Out Everywhere:** End all active sessions.
4. **Enable 2FA:** Turn on Two-Factor Authentication.

:::TAKEDOWN_JSON::[{"id":"1","title":"Official Recovery","description":"Visit the official Facebook hacked account recovery page.","actionLabel":"Recover Account","actionUrl":"https://www.facebook.com/hacked","icon":"fa-brands fa-facebook"},{"id":"2","title":"Secure Password","description":"Change your password and enable 2FA in security settings.","icon":"fa-key"},{"id":"3","title":"Logout Sessions","description":"Force logout from all devices to kick the hacker out.","icon":"fa-right-from-bracket"}]:::

${PROTECTION_JSON_DEFAULT}

<<Next: Draft Police Complaint (Facebook) | Secure My Device>>`;

const WA_HACKED_RESPONSE = `### 💬 WhatsApp Account Recovery

Follow these steps immediately to secure your WhatsApp account:

1. **Re-register:** Verify your phone number with the 6-digit SMS code.
2. **Email Support:** Request account deactivation if you can't log in.
3. **Enable 2FA:** Set up a PIN once you regain access.

:::TAKEDOWN_JSON::[{"id":"1","title":"Re-verify SMS","description":"Open WhatsApp and enter your number to get a new SMS code. This logs out the hacker.","icon":"fa-brands fa-whatsapp"},{"id":"2","title":"Deactivate Account","description":"Email WhatsApp support to block the hacker from using your account.","actionLabel":"Email Support","actionUrl":"mailto:support@whatsapp.com?subject=Lost/Stolen:%20Please%20deactivate%20my%20account&body=My%20phone%20number%20is:%20","icon":"fa-envelope"}]:::

${PROTECTION_JSON_WA}

<<Next: Draft Police Complaint (WhatsApp) | Secure My Device>>`;

const IG_HACKED_RESPONSE = `### 📸 Instagram Account Recovery

Follow these steps immediately to secure your Instagram account:

1. **Check Email:** Look for a security alert from Instagram.
2. **Request Login Link:** Use the "Forgot Password" flow.
3. **Video Selfie:** Verify your identity if recovery fails.

:::TAKEDOWN_JSON::[{"id":"1","title":"Secure Link","description":"Check your email for a 'Secure my account' link from Instagram.","icon":"fa-brands fa-instagram"},{"id":"2","title":"Identity Verification","description":"Submit a video selfie to Instagram support to prove ownership.","actionLabel":"IG Help Center","actionUrl":"https://help.instagram.com/149494825257596","icon":"fa-video"}]:::

${PROTECTION_JSON_DEFAULT}

<<Next: Draft Police Complaint (Instagram) | Secure My Device>>`;

const BANK_HACKED_RESPONSE = `### 🏦 Bank Account Compromise

**ACT IMMEDIATELY. Time is critical.**

1. **Call 1930:** Report the fraud to the National Cyber Crime Helpline.
2. **Block Cards:** Call your bank to freeze all accounts and cards.
3. **Change PINs:** Reset your net banking and UPI security.

:::TAKEDOWN_JSON::[{"id":"1","title":"Call 1930","description":"Dial the National Cyber Crime Reporting Portal helpline immediately.","actionLabel":"Call 1930","actionUrl":"tel:1930","icon":"fa-phone-volume"},{"id":"2","title":"Block Bank Account","description":"Contact your bank's emergency line to freeze all transactions.","icon":"fa-building-columns"}]:::

<<Next: Draft Police Complaint (Bank) | Secure My Device>>`;

const FB_COMPLAINT_DRAFT = `Here is a blank template for a Facebook hacking incident. 

:::EMAIL_JSON::{"to":"cyberdome.pol@kerala.gov.in","subject":"Cyber Crime Complaint: Unauthorized Access to Facebook Account","body":"To,\\nThe Station House Officer\\nCyber Crime Police Station\\n\\nSubject: Complaint regarding unauthorized access to my Facebook account\\n\\nRespected Sir/Madam,\\n\\nI, [Your Full Name], residing at [Your Full Address], would like to report that my Facebook account (Profile Link: [Insert Profile URL]) was hacked on [Date of Incident] at approximately [Time of Incident].\\n\\nThe unauthorized person has changed my login credentials and is [mention if they are sending messages, asking for money, or posting inappropriate content]. \\n\\nI have already reported this to Facebook via their official channels but require police assistance to trace the culprit and prevent further misuse of my identity.\\n\\nI request you to kindly register an FIR and investigate this matter.\\n\\nSincerely,\\n[Your Full Name]\\n[Your Phone Number]"}:::

**Want a customized draft?**
Please provide the following details, and I will write a custom complaint for you:
1. Date and time you noticed the hack.
2. Your Facebook Profile Link/Username.
3. What the hacker is doing (e.g., asking friends for money).
*(Do not share your real name or phone number here)*

<<Next: Provide Custom Details | Secure My Account | Secure My Device>>`;

const WA_COMPLAINT_DRAFT = `Here is a blank template for a WhatsApp hacking incident.

:::EMAIL_JSON::{"to":"cyberdome.pol@kerala.gov.in","subject":"Cyber Crime Complaint: WhatsApp Account Hacked","body":"To,\\nThe Station House Officer\\nCyber Crime Police Station\\n\\nSubject: Complaint regarding unauthorized access to my WhatsApp account\\n\\nRespected Sir/Madam,\\n\\nI, [Your Full Name], residing at [Your Full Address], would like to report that my WhatsApp account linked to the mobile number [Your Phone Number] was compromised on [Date of Incident].\\n\\nThe hacker gained access by [mention how, e.g., tricking me into sharing an OTP / call forwarding scam]. They are now using my account to contact my contacts and [mention what they are doing, e.g., asking for money via UPI].\\n\\nI have emailed WhatsApp support to deactivate the account, but I request you to register a complaint to prevent financial loss to my contacts and trace the culprit.\\n\\nSincerely,\\n[Your Full Name]\\n[Your Phone Number]"}:::

**Want a customized draft?**
Please provide the following details, and I will write a custom complaint for you:
1. Date and time of the incident.
2. How the hack happened (e.g., shared OTP, clicked a link).
3. What the hacker is doing now.
*(Do not share your real name or phone number here)*

<<Next: Provide Custom Details | Secure My Account | Secure My Device>>`;

const IG_COMPLAINT_DRAFT = `Here is a blank template for an Instagram hacking incident.

:::EMAIL_JSON::{"to":"cyberdome.pol@kerala.gov.in","subject":"Cyber Crime Complaint: Unauthorized Access to Instagram Account","body":"To,\\nThe Station House Officer\\nCyber Crime Police Station\\n\\nSubject: Complaint regarding unauthorized access to my Instagram account\\n\\nRespected Sir/Madam,\\n\\nI, [Your Full Name], residing at [Your Full Address], would like to report that my Instagram account (Username: @[Insert Username]) was hacked on [Date of Incident].\\n\\nThe hacker has changed my recovery email/phone number and is currently [mention what they are doing, e.g., posting crypto scams / messaging followers]. \\n\\nI have initiated the recovery process with Instagram, but I request police intervention to stop the misuse of my identity and investigate the unauthorized access.\\n\\nSincerely,\\n[Your Full Name]\\n[Your Phone Number]"}:::

**Want a customized draft?**
Please provide the following details, and I will write a custom complaint for you:
1. Date and time of the incident.
2. Your Instagram Username.
3. What the hacker is posting or messaging.
*(Do not share your real name or phone number here)*

<<Next: Provide Custom Details | Secure My Account | Secure My Device>>`;

const BANK_COMPLAINT_DRAFT = `Here is a blank template for a Bank Account fraud incident.

:::EMAIL_JSON::{"to":"cyberdome.pol@kerala.gov.in","subject":"Cyber Crime Complaint: Unauthorized Bank Transaction / Fraud","body":"To,\\nThe Station House Officer\\nCyber Crime Police Station\\n\\nSubject: Complaint regarding unauthorized financial transaction of Rs. [Amount]\\n\\nRespected Sir/Madam,\\n\\nI, [Your Full Name], residing at [Your Full Address], am a customer of [Bank Name] holding account number ending in [Last 4 digits of Account].\\n\\nOn [Date of Incident] at [Time], an unauthorized transaction of Rs. [Amount] was made from my account. The transaction reference number is [Transaction ID]. I did not authorize this transaction nor did I share my OTP/PIN with anyone.\\n\\nI have already blocked my account/card and reported this to my bank and the 1930 helpline. I request you to register an FIR and initiate an investigation to recover the lost funds.\\n\\nSincerely,\\n[Your Full Name]\\n[Your Phone Number]"}:::

**Want a customized draft?**
Please provide the following details, and I will write a custom complaint for you:
1. Date and time of the transaction.
2. Name of your Bank.
3. Amount lost.
4. How it happened (e.g., clicked a link, fake customer care).
*(Do not share your real name, full account number, or phone number here)*

<<Next: Provide Custom Details | Secure My Account | Secure My Device>>`;

const CALL_1930_RESPONSE = `### 🚨 National Cyber Crime Helpline (1930)

If you have lost money to online fraud, **time is critical**. Call 1930 immediately.

:::TAKEDOWN_JSON::[{"id":"1","title":"Call 1930","description":"Dial the National Cyber Crime Reporting Portal helpline immediately.","actionLabel":"Call 1930","actionUrl":"tel:1930","icon":"fa-phone-volume"},{"id":"2","title":"Report Online","description":"File a formal complaint on the National Cyber Crime portal.","actionLabel":"CyberCrime Portal","actionUrl":"https://cybercrime.gov.in","icon":"fa-globe"}]:::

<<Next: Draft Police Complaint (Bank) | Secure My Device>>`;

const CALL_112_RESPONSE = `### 🚓 National Emergency Number (112)

**112** is the single emergency helpline in India for Police, Fire, and Ambulance services.

:::TAKEDOWN_JSON::[{"id":"1","title":"Call 112","description":"Dial the national emergency number for immediate physical danger.","actionLabel":"Call 112","actionUrl":"tel:112","icon":"fa-phone-volume"},{"id":"2","title":"112 India App","description":"Download the official app to send your location to emergency services.","actionLabel":"Get App","actionUrl":"https://play.google.com/store/apps/details?id=in.cdac.emergency.erss.erss_app","icon":"fa-mobile-screen"}]:::

<<Next: Suicide Prevention | Cyber Dome Contact>>`;

const STOLEN_PHONE_RESPONSE = `### 📱 Report Stolen or Lost Phone (CEIR)

The Government of India provides a portal to block stolen/lost phones across all mobile networks.

:::TAKEDOWN_JSON::[{"id":"1","title":"File Police Report","description":"File an FIR or online complaint and keep the complaint number ready.","actionLabel":"Cyber Crime Portal","actionUrl":"https://cybercrime.gov.in","icon":"fa-file-shield"},{"id":"2","title":"Block IMEI","description":"Use the CEIR portal to block your phone globally using its IMEI number.","actionLabel":"CEIR Portal","actionUrl":"https://www.ceir.gov.in/Home/index.jsp","icon":"fa-mobile-screen-button"}]:::

<<Next: SIMs Under My Name | Secure My Device>>`;

const SIMS_UNDER_NAME_RESPONSE = `### 💳 Check SIM Cards Registered to Your ID (TAFCOP)

Fraudsters often use stolen ID proofs to issue SIM cards. You can check and disconnect unauthorized numbers using the TAFCOP portal.

:::TAKEDOWN_JSON::[{"id":"1","title":"Verify SIMs","description":"Login to the TAFCOP portal with your number to see all SIMs registered to your ID.","actionLabel":"Open TAFCOP","actionUrl":"https://tafcop.sancharsaathi.gov.in/","icon":"fa-sim-card"},{"id":"2","title":"Report Unauthorized","description":"Select any unknown numbers and report them as 'Not My Number'.","icon":"fa-user-slash"}]:::

<<Next: Report Stolen Phone | Secure My Device>>`;

const WA_HARASSMENT_RESPONSE = `### 🚫 Report WhatsApp Harassment

If you are receiving abusive, threatening, or harassing messages on WhatsApp:

1. **Do Not Reply:** Engaging often escalates the situation.
2. **Take Screenshots:** Capture evidence before blocking.
3. **Report and Block:** Use the in-app reporting tools.

:::TAKEDOWN_JSON::[{"id":"1","title":"Preserve Evidence","description":"Take screenshots of the messages and the sender's phone number.","icon":"fa-camera"},{"id":"2","title":"In-App Report","description":"Tap the contact name > Report > Block. This sends the last 5 messages to WhatsApp.","icon":"fa-user-shield"}]:::

<<Next: Draft Police Complaint (WhatsApp) | StopNCII Guide>>`;

const IDENTITY_GUARD_RESPONSE = `### 🛡️ Identity Guard Protocol

If you suspect your identity (Aadhaar, PAN, etc.) has been compromised:

1. **Lock Your Aadhaar:** Prevent unauthorized authentication.
2. **Check Your Credit Report:** Spot unauthorized loan accounts.
3. **Check Active SIM Cards:** Ensure no unauthorized SIMs are issued in your name.
4. **Enable 2FA:** Turn on Two-Factor Authentication on your email and banking apps.

:::TAKEDOWN_JSON::[{"id":"1","title":"Lock Aadhaar","description":"Lock your biometrics to prevent unauthorized use of your Aadhaar.","actionLabel":"Lock Aadhaar","actionUrl":"https://myaadhaar.uidai.gov.in/","icon":"fa-fingerprint"},{"id":"2","title":"Check SIMs","description":"Check all mobile numbers registered under your ID proof.","actionLabel":"Check TAFCOP","actionUrl":"https://tafcop.sancharsaathi.gov.in/","icon":"fa-sim-card"},{"id":"3","title":"Credit Report","description":"Check your CIBIL score to detect identity theft and loan fraud.","actionLabel":"Check CIBIL","actionUrl":"https://www.cibil.com/freecibilscore","icon":"fa-file-invoice-dollar"}]:::

<<Next: SIMs Under My Name | Check for Leaks>>`;

const STOPNCII_GUIDE_RESPONSE = `### 🛑 StopNCII.org Guide

StopNCII.org is a free, highly secure tool designed to support victims of Non-Consensual Intimate Image (NCII) abuse.

**How it works:**
1. You select the intimate images/videos on your device.
2. The tool generates a unique digital fingerprint (hash) for each file **on your device**. The actual images *never* leave your phone.
3. This hash is shared with participating companies (Facebook, Instagram, TikTok, Bumble, etc.).
4. If someone tries to upload an image matching that hash, the platform automatically blocks it.

:::TAKEDOWN_JSON::[{"id":"1","title":"Generate Secure Hash","description":"Select your images locally. Only the digital fingerprint (hash) is shared.","icon":"fa-fingerprint"},{"id":"2","title":"Global Block","description":"Major platforms use this hash to block any future uploads of your content.","actionLabel":"Open StopNCII","actionUrl":"https://stopncii.org","icon":"fa-shield-halved"}]:::

<<Next: Takedown Generator | Report WhatsApp Harassment>>`;

const SECTION_66E_RESPONSE = `### ⚖️ Section 66E of the IT Act

**Section 66E** of the Information Technology Act, 2000 deals with the **violation of privacy**.

:::TAKEDOWN_JSON::[{"id":"1","title":"Privacy Violation","description":"Intentionally capturing or publishing images of a private area without consent is a crime.","icon":"fa-user-secret"},{"id":"2","title":"Punishment","description":"Up to 3 years imprisonment or a fine up to ₹2 Lakhs.","icon":"fa-gavel"}]:::

<<Next: Cyber Stalking Laws | Draft Police Complaint>>`;

const CYBER_STALKING_LAWS_RESPONSE = `### ⚖️ Cyber Stalking Laws in India

Cyber stalking is a punishable offense under Indian law.

:::TAKEDOWN_JSON::[{"id":"1","title":"IPC Section 354D","description":"Covers monitoring a woman's internet use or electronic communication without consent.","icon":"fa-eye"},{"id":"2","title":"Punishment","description":"Up to 3 years for first offense, 5 years for subsequent offenses.","icon":"fa-gavel"}]:::

<<Next: What is Section 66E? | Draft Police Complaint>>`;

const CYBER_DOME_RESPONSE = `### 🏢 Kerala Police Cyberdome

The Kerala Police Cyberdome is a technological research and development center of the Kerala Police Department.

:::TAKEDOWN_JSON::[{"id":"1","title":"Official Website","description":"Visit the official Cyberdome portal for more information and resources.","actionLabel":"Visit Website","actionUrl":"https://cyberdome.kerala.gov.in","icon":"fa-globe"},{"id":"2","title":"Email Contact","description":"Official email for reporting and general inquiries.","actionLabel":"Email Now","actionUrl":"mailto:cyberdome.pol@kerala.gov.in","icon":"fa-envelope"}]:::

<<Next: Call 1930 | Draft Police Complaint>>`;

const UPI_SCAM_FALLBACK = `### 💸 Report UPI Scam

If you've been scammed via UPI, you need to act immediately.

1. **Call 1930:** Report the fraud to the National Cyber Crime Helpline immediately.
2. **Contact your Bank/UPI App:** Report the transaction to GPay, PhonePe, Paytm, or your bank.
3. **File a Complaint:** Register a formal complaint at [cybercrime.gov.in](https://cybercrime.gov.in).

:::TAKEDOWN_JSON::[{"id":"1","title":"Call 1930","description":"Dial the National Cyber Crime Reporting Portal helpline immediately.","actionLabel":"Call 1930","actionUrl":"tel:1930","icon":"fa-phone-volume"},{"id":"2","title":"NPCI Dispute","description":"File a formal dispute on the NPCI portal for UPI transactions.","actionLabel":"NPCI Portal","actionUrl":"https://www.npci.org.in/what-we-do/upi/dispute-redressal-mechanism","icon":"fa-building-columns"}]:::

<<Next: Call 1930 | Draft Police Complaint (Bank)>>`;

const TAKEDOWN_FALLBACK = `### 🛑 Takedown Generator

The **Takedown Generator** is a specialized tool that helps you draft formal, legally-sound removal requests for platforms like Instagram, Facebook, X, and Google. It is designed to help victims of NCII (Non-Consensual Intimate Imagery), harassment, and impersonation.

:::TAKEDOWN_JSON::[{"id":"1","title":"StopNCII.org","description":"Block your images from being uploaded to major platforms globally.","actionLabel":"Open StopNCII","actionUrl":"https://stopncii.org","icon":"fa-shield-halved"},{"id":"2","title":"Platform Takedown","description":"Issue a formal legal notice to the platform hosting the content.","icon":"fa-file-contract"}]:::

**How to use the full tool:**
To generate a customized legal draft, please go to **More + > Command Center** (bottom left) and select the **Takedown Generator** form. There, you can enter specific URLs and details to create your notice.

<<Next: StopNCII Guide | Report WhatsApp Harassment>>`;

const LEAKED_PHOTOS_RESPONSE = `### 🛑 Report Leaked Photos (NCII)
If your private photos or videos have been shared without your consent, follow these steps immediately:

1. **StopNCII.org (Most Important):** Use this tool to create a digital fingerprint of your images on your device. This hash is shared with major platforms (Facebook, Instagram, TikTok) to block the images from being uploaded.
2. **Report to the Platform:** Use the official reporting forms for each platform to request removal.
3. **Preserve Evidence:** Take screenshots of the profile, the post, and any messages. Do not delete them yet.
4. **Legal Action:** You can file a complaint at [cybercrime.gov.in](https://cybercrime.gov.in) or call **1930**.

:::TAKEDOWN_JSON::[{"id":"1","title":"StopNCII.org","description":"Block your images from being uploaded to major platforms globally.","actionLabel":"Open StopNCII","actionUrl":"https://stopncii.org","icon":"fa-shield-halved"},{"id":"2","title":"Instagram Report","description":"Report non-consensual intimate imagery directly to Instagram.","actionLabel":"Report on IG","actionUrl":"https://help.instagram.com/contact/584460461982588","icon":"fa-brands fa-instagram"},{"id":"3","title":"Facebook Report","description":"Report non-consensual intimate imagery directly to Facebook.","actionLabel":"Report on FB","actionUrl":"https://www.facebook.com/help/contact/144059062408922","icon":"fa-brands fa-facebook"}]:::

<<Next: StopNCII Guide | Takedown Generator | Draft Police Complaint>>`;

const DEEPFAKE_RESPONSE = `### 🤖 Report AI Deepfakes
If someone has created a fake image or video of you using AI:

1. **Platform Reporting:** Most platforms have specific policies against non-consensual AI-generated imagery.
2. **StopNCII.org:** Even if it's a deepfake, StopNCII.org can sometimes help if the underlying imagery is based on real private content.
3. **Legal Status:** In India, creating or sharing non-consensual deepfakes can be prosecuted under Section 66E (Privacy) and Section 67 (Obscenity) of the IT Act.

:::TAKEDOWN_JSON::[{"id":"1","title":"Google Search Removal","description":"Request Google to remove non-consensual explicit AI-generated imagery from search results.","actionLabel":"Google Removal","actionUrl":"https://support.google.com/websearch/answer/6302812","icon":"fa-brands fa-google"},{"id":"2","title":"YouTube Privacy","description":"Report deepfakes on YouTube using the Privacy Complaint Process.","actionLabel":"YouTube Report","actionUrl":"https://support.google.com/youtube/answer/2801895","icon":"fa-brands fa-youtube"},{"id":"3","title":"X (Twitter) Report","description":"Report as 'Synthetic and manipulated media' on X.","actionLabel":"Report on X","actionUrl":"https://help.twitter.com/en/rules-and-policies/manipulated-media","icon":"fa-brands fa-x-twitter"}]:::

<<Next: Takedown Generator | What is Section 66E? | Draft Police Complaint>>`;

const CHECK_LEAKS_RESPONSE = `### 🔍 Check for Data Leaks
I can help you check if your personal information has been exposed in a data breach.

**What would you like to check?**

:::TAKEDOWN_JSON::[{"id":"1","title":"Email Breach Scan","description":"Check if your email address has been exposed in a known data breach.","icon":"fa-envelope-open-text"},{"id":"2","title":"Link Scanner","description":"Analyze a suspicious URL for phishing or malware patterns.","icon":"fa-link"}]:::

:::WIDGET_JSON::{"type":"email-scanner"}:::

<<Next: Check Identity Leak | Check for Spyware | Identity Guard Protocol>>`;

const BLACKMAIL_RESPONSE = `### 🛑 Report Blackmail & Extortion
If someone is threatening to release your private information or photos unless you pay them:

1. **Do Not Pay:** Paying never stops the blackmail; it only proves you are a target.
2. **Stop Communication:** Block the blackmailer immediately.
3. **Preserve Evidence:** Take screenshots of the threats, the profile, and any payment demands.
4. **Report to Authorities:** Call **1930** or visit [cybercrime.gov.in](https://cybercrime.gov.in).
5. **StopNCII.org:** Use this tool if they have intimate images of you.

:::TAKEDOWN_JSON::[{"id":"1","title":"Call 1930","description":"Report extortion and financial threats immediately.","actionLabel":"Call 1930","actionUrl":"tel:1930","icon":"fa-phone-volume"},{"id":"2","title":"StopNCII.org","description":"Block your images from being uploaded globally.","actionLabel":"Open StopNCII","actionUrl":"https://stopncii.org","icon":"fa-shield-halved"},{"id":"3","title":"CyberCrime Portal","description":"File a formal complaint for extortion and blackmail.","actionLabel":"Report Now","actionUrl":"https://cybercrime.gov.in","icon":"fa-file-shield"}]:::

<<Next: StopNCII Guide | Draft Police Complaint | Call 112>>`;

const TELEGRAM_LEAK_RESPONSE = `### ✈️ Report Leaks on Telegram
Telegram is often used to distribute leaked content. Here is how to handle it:

1. **Report the Channel/Bot:** Use the in-app reporting tool (Tap '...' > Report > Personal Details/Pornography).
2. **Email Telegram Support:** Send an email to **dmca@telegram.org** or **abuse@telegram.org** with the link to the channel/message.
3. **StopNCII.org:** This helps block the content on other major platforms.

:::TAKEDOWN_JSON::[{"id":"1","title":"Email Abuse","description":"Send the channel link and details to Telegram's abuse team.","actionLabel":"Email Abuse","actionUrl":"mailto:abuse@telegram.org","icon":"fa-envelope"},{"id":"2","title":"Email DMCA","description":"Request removal of copyrighted or private content.","actionLabel":"Email DMCA","actionUrl":"mailto:dmca@telegram.org","icon":"fa-envelope-open-text"}]:::

<<Next: Report Leaked Photos | Draft Police Complaint>>`;

const SUSPICIOUS_LINK_RESPONSE = `### 🔗 Suspicious Link Analysis
If you received a link via SMS, WhatsApp, or Email that looks suspicious:

1. **Do Not Click:** Clicking can install malware or steal your session cookies.
2. **Check the URL:** Look for misspellings (e.g., 'g00gle.com' instead of 'google.com').
3. **Use a Scanner:** I can help you analyze the link if you paste it here.

:::TAKEDOWN_JSON::[{"id":"1","title":"Link Scanner","description":"I can analyze the URL for phishing patterns.","icon":"fa-link"},{"id":"2","title":"VirusTotal","description":"Check the link against 70+ antivirus engines.","actionLabel":"Open VirusTotal","actionUrl":"https://www.virustotal.com/gui/home/url","icon":"fa-bug"}]:::

:::WIDGET_JSON::{"type":"email-scanner"}:::

<<Next: Check for Leaks | Identity Guard Protocol>>`;

// The Memory Bank of Static Responses
// ORDER MATTERS: Specific triggers must come BEFORE generic triggers
const KNOWLEDGE_BASE: FastResponse[] = [
  {
    triggers: [
      /report leaked photos/i,
      /leaked photos/i,
      /private photos/i,
      /ncii/i,
      /blackmail/i,
      /extortion/i,
      /threatening to post/i
    ],
    response: LEAKED_PHOTOS_RESPONSE
  },
  {
    triggers: [
      /telegram/i,
      /leaked on telegram/i,
      /telegram channel/i
    ],
    response: TELEGRAM_LEAK_RESPONSE
  },
  {
    triggers: [
      /suspicious link/i,
      /phishing link/i,
      /fake website/i,
      /is this link safe/i
    ],
    response: SUSPICIOUS_LINK_RESPONSE
  },
  {
    triggers: [
      /report ai deepfake/i,
      /deepfake/i,
      /ai fake/i,
      /fake video/i
    ],
    response: DEEPFAKE_RESPONSE
  },
  {
    triggers: [
      /check for leaks/i,
      /data leak/i,
      /am i leaked/i
    ],
    response: CHECK_LEAKS_RESPONSE
  },
  // --- EMERGENCY & FRAUD ---
  {
    triggers: [
      /call 1930/i,
      /financial fraud/i,
      /\b1930\b/i
    ],
    response: CALL_1930_RESPONSE
  },
  {
    triggers: [
      /call 112/i,
      /emergency/i,
      /\b112\b/i
    ],
    response: CALL_112_RESPONSE
  },
  {
    triggers: [
      /report upi scam/i,
      /upi scam/i,
      /upi fraud/i
    ],
    response: UPI_SCAM_FALLBACK
  },
  // --- DEVICE SECURITY ---
  {
    triggers: [
      /report stolen phone/i,
      /stolen phone/i,
      /lost phone/i,
      /ceir/i
    ],
    response: STOLEN_PHONE_RESPONSE
  },
  {
    triggers: [
      /sims under my name/i,
      /check sim/i,
      /tafcop/i
    ],
    response: SIMS_UNDER_NAME_RESPONSE
  },
  // --- SOCIAL RECOVERY & HARASSMENT ---
  {
    triggers: [
      /report whatsapp harassment/i,
      /whatsapp harassment/i
    ],
    response: WA_HARASSMENT_RESPONSE
  },
  // --- PRIVACY TOOLS ---
  {
    triggers: [
      /identity guard protocol/i,
      /identity theft/i,
      /protect identity/i
    ],
    response: IDENTITY_GUARD_RESPONSE
  },
  {
    triggers: [
      /stopncii guide/i,
      /stopncii/i,
      /stop ncii/i
    ],
    response: STOPNCII_GUIDE_RESPONSE
  },
  {
    triggers: [
      /takedown generator/i,
      /generate takedown/i
    ],
    response: TAKEDOWN_FALLBACK
  },
  // --- LEGAL ASSISTANCE ---
  {
    triggers: [
      /what is section 66e/i,
      /section 66e/i,
      /\b66e\b/i
    ],
    response: SECTION_66E_RESPONSE
  },
  {
    triggers: [
      /cyber stalking laws/i,
      /stalking laws/i,
      /cyber stalking/i
    ],
    response: CYBER_STALKING_LAWS_RESPONSE
  },
  // --- SUPPORT ---
  {
    triggers: [
      /cyber dome contact/i,
      /cyber dome/i,
      /cyberdome/i
    ],
    response: CYBER_DOME_RESPONSE
  },
  {
    triggers: [
      /suicide prevention/i,
      /talk to a counselor/i,
      /suicide/i,
      /depressed/i,
      /kill myself/i,
      /end my life/i
    ],
    response: SUICIDE_RESPONSE
  },
  // --- HACKED ACCOUNTS ---
  {
    triggers: [
      /draft police complaint \(facebook\)/i,
      /facebook complaint/i
    ],
    response: FB_COMPLAINT_DRAFT
  },
  {
    triggers: [
      /draft police complaint \(whatsapp\)/i,
      /whatsapp complaint/i
    ],
    response: WA_COMPLAINT_DRAFT
  },
  {
    triggers: [
      /draft police complaint \(instagram\)/i,
      /instagram complaint/i
    ],
    response: IG_COMPLAINT_DRAFT
  },
  {
    triggers: [
      /draft police complaint \(bank\)/i,
      /bank complaint/i
    ],
    response: BANK_COMPLAINT_DRAFT
  },
  {
    triggers: [
      /facebook hacked/i,
      /hacked facebook/i
    ],
    response: FB_HACKED_RESPONSE
  },
  {
    triggers: [
      /whatsapp hacked/i,
      /hacked whatsapp/i
    ],
    response: WA_HACKED_RESPONSE
  },
  {
    triggers: [
      /instagram hacked/i,
      /hacked instagram/i,
      /insta hacked/i
    ],
    response: IG_HACKED_RESPONSE
  },
  {
    triggers: [
      /bank account hacked/i,
      /bank hacked/i,
      /hacked bank/i
    ],
    response: BANK_HACKED_RESPONSE
  },
  {
    triggers: [
      /email hacked/i,
      /hacked email/i
    ],
    response: EMAIL_HACKED_MENU_RESPONSE
  },
  {
    triggers: [
      /gmail hacked/i,
      /hacked gmail/i,
      /google hacked/i
    ],
    response: GMAIL_HACKED_RESPONSE
  },
  {
    triggers: [
      /outlook hacked/i,
      /hacked outlook/i,
      /hotmail hacked/i,
      /microsoft hacked/i
    ],
    response: OUTLOOK_HACKED_RESPONSE
  },
  {
    triggers: [
      /yahoo hacked/i,
      /hacked yahoo/i
    ],
    response: YAHOO_HACKED_RESPONSE
  },
  {
    triggers: [
      /my account is hacked/i,
      /my account was hacked/i,
      /account hacked/i,
      /hacked account/i,
      /secure my account/i
    ],
    response: HACKED_RESPONSE
  },
  {
    triggers: [
      /provide custom details/i,
      /provide details for custom complaint/i
    ],
    response: `Please type out the details requested above. I am ready to generate your custom complaint.`
  },
  // --- PRIVACY & LEGAL ---
  {
    triggers: [
      /(spyware|virus|tracked|secure my device|phone is acting weird|check for leaks)/i
    ],
    response: `Let's secure your device immediately. I've prepared a security checklist for your specific phone type.

:::TAKEDOWN_JSON::[{"id":"1","title":"Security Checklist","description":"Follow the step-by-step guide below to harden your device.","icon":"fa-list-check"},{"id":"2","title":"Report Spyware","description":"If you found suspicious apps, report them to the authorities.","actionLabel":"CyberCrime Portal","actionUrl":"https://cybercrime.gov.in","icon":"fa-bug-slash"}]:::

${SECURITY_JSON}

Please run through these checks now. Do you see any unknown apps in the device admin list?`
  },
  {
    triggers: [
      /(remove google search results|remove from google|delete from google|google search removal)/i
    ],
    response: `### 🗑️ Remove Google Search Results

Google provides tools to remove certain types of personal information from its search results.

:::TAKEDOWN_JSON::[{"id":"1","title":"Remove PII","description":"Request removal of phone numbers, emails, or addresses from search.","actionLabel":"PII Removal","actionUrl":"https://support.google.com/websearch/answer/9673730","icon":"fa-brands fa-google"},{"id":"2","title":"Remove NCII","description":"Request removal of non-consensual explicit images from search results.","actionLabel":"NCII Removal","actionUrl":"https://support.google.com/websearch/answer/6302812","icon":"fa-shield-halved"},{"id":"3","title":"Legal Removal","description":"Submit a legal request for content that violates the law.","actionLabel":"Legal Request","actionUrl":"https://support.google.com/legal/answer/3110420","icon":"fa-scale-balanced"}]:::

<<Next: Draft Police Complaint | Report Leaked Photos>>`
  },
  {
    triggers: [
      /(draft police complaint|write an fir|draft an email|draft email|write complaint|generate blank template)/i
    ],
    response: `I can help you draft a formal complaint. For your privacy and speed, here is a template you can copy, fill in with your details, and send to the authorities.

:::EMAIL_JSON::{"to":"cyberdome.pol@kerala.gov.in","subject":"Complaint: Cyber Crime Incident","body":"To,\\nThe Station House Officer\\nCyber Crime Police Station\\n\\nSubject: Complaint regarding [Briefly mention the incident, e.g., Financial Fraud / Harassment / Account Hacking]\\n\\nRespected Sir/Madam,\\n\\nI, [Your Name], residing at [Your Address], would like to report an incident that occurred on [Date of Incident].\\n\\nIncident Details:\\n[Clearly and factually describe what happened. Include platform names, usernames, transaction IDs, or phone numbers involved. Do not include emotional language or legal sections.]\\n\\nSuspect Information (if any):\\n[Provide any known details about the suspect, such as phone number, profile link, or UPI ID.]\\n\\nI request you to kindly investigate this matter and take necessary action.\\n\\nSincerely,\\n[Your Name]\\n[Your Phone Number]"}:::

**Privacy Note**: Please fill in your real name, phone number, and address manually before sending. Do not share them here.

<<Next: Call 1930 | Report Leaked Photos>>`
  }
];

export const checkFastResponse = (message: string): string | null => {
  const normalizedMsg = message.toLowerCase();
  
  for (const entry of KNOWLEDGE_BASE) {
    for (const pattern of entry.triggers) {
      if (pattern.test(normalizedMsg)) {
        return entry.response;
      }
    }
  }
  
  return null;
};