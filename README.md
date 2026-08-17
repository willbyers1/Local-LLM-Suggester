<div align="center">

# 🧠 Local LLM Advisor

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge)

</div>

> Real-time local LLM hardware compatibility engine & AI recommendation system for desktop, laptop, and workstation configurations.

---

## 📋 Features

- 💻 **Deterministic Hardware Compatibility Engine**: Calculates precise memory footprints, VRAM usage, KV cache overhead, and system safety margins without guesswork.
- ⚡ **BYOK AI Recommendation**: Bring Your Own Key architecture supporting OpenAI, Anthropic, and Gemini to generate intelligent model suggestions based on computed engine metrics.
- 📊 **Multi-Model Comparison**: Compare up to three open-weight models side-by-side across execution modes, context window limits, and quantization tradeoffs.
- 🛡️ **Session-Only Security**: API keys are processed in ephemeral server memory or sent directly through secure Server Actions—never stored in databases, cookies, or `localStorage`.
- 🎛️ **Quick Hardware Presets & Filtering**: Pre-populate hardware parameters instantly or apply granular filters by parameter count, model family, use case, and runtime.
- 🛠️ **Runtime Guidance**: Recommends optimal execution environments including Ollama, LM Studio, llama.cpp, and KoboldCpp with official direct links.

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) (App Router & Server Actions)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zod](https://zod.dev/) (Schema Validation)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

---

## 🚀 Quick Start & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mertbatubulbul/local-llm-advisor.git
   cd local-llm-advisor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 API Key & Configuration

Basic hardware compatibility analysis functions entirely offline without any external API keys.

To enable the intelligent **AI Recommendation** feature, you can supply your own key inside the app interface via **BYOK (Bring Your Own Key)** mode.

### Environment Variables (Optional)
Create a `.env.local` file in the root directory if you want to provide fallback options:

```env
# Optional: Server-side fallback encryption key for persistent session security
ENCRYPTION_KEY=your_32_byte_secret_key_here
```

> **Security Note:** User-provided API keys are kept strictly in session memory or routed securely via Server Actions. Keys are never logged, persisted, or exposed to browser logs.

---

## ⚙️ How It Works

1. **Enter System Specs**: Provide your GPU model, VRAM size, system RAM, CPU details, operating system, and disk space (or select a quick hardware preset).
2. **Run Compatibility Analysis**: The deterministic engine calculates usable memory, overheads, context scaling, and safety thresholds across popular open-weight model families (Llama, Qwen, Mistral, Gemma, Phi, DeepSeek).
3. **Review Execution Modes**: Identify whether models will run in **Full GPU**, **Partial GPU Offloading**, or **CPU-Only** execution.
4. **Get AI Recommendations**: Optionally configure your preferred AI provider (OpenAI, Anthropic, Gemini) with BYOK to receive customized, use-case specific model suggestions.
5. **Compare & Launch**: Compare top candidate models side-by-side and follow official runtime installation links.

---

## 📦 Building for Production

To compile and test the production build locally:

```bash
# Build the production bundle
npm run build

# Preview the production build
npm run start
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Created By Mert Batu BULBUL**
* 🎓 AI Engineering & Full Stack Developer * 💻 React *

**Don't forget to star ⭐ this repo if you found it useful!**

</div>

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues) if you want to contribute.