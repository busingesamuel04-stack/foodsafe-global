# NutriScan Global

> **International Food Product Intelligence & Metabolic Health Tracker**

NutriScan is a modern, mobile-first international food intelligence platform. Designed to operate globally with **$0 operational overhead**, it decodes barcodes and food products worldwide—translating complex ingredient labels into personalized metabolic insights, glycemic spike simulations, and real-time clean eating metrics.

Deployed on **Cloudflare Pages**, backed by **Supabase**, and integrated with the worldwide **Open Food Facts API** (covering millions of international packaged food products).

---

## 🌍 Core Capabilities

1. **Global Barcode Scanner & Universal Search**:
   - Live camera barcode scanning using `html5-qrcode` with automated environment autofocus.
   - Worldwide product lookup across millions of international brands via the Open Food Facts v2 API.
   - Offline benchmark tests for global household staples (Coca-Cola, Oreo, Nutella).

2. **Personalized Health Lens (5 Dimensions)**:
   - 🩸 **Blood Sugar & Diabetes Prevention**: Evaluates glycemic spikes, free sucrose/fructose load, and lack of fiber buffers.
   - ⚖️ **Weight Loss & Calorie Management**: Analyzes caloric density, liquid calories, and satiety signaling.
   - ❤️ **Cardiovascular & Blood Pressure**: Monitors sodium levels, saturated fats, and industrial palm oils.
   - 🛡️ **Clean Eating & Additive-Free**: Scans for synthetic colorants, preservatives, and NOVA Group 4 ultra-processed classifications.
   - ⚡ **Sustained Energy & Anti-Crash**: Predicts afternoon energy crashes and postprandial glucose volatility.

3. **Biochemical Product Intelligence**:
   - **Metabolic Glycemic Spike Predictor**: Dynamically models glucose trajectory and energy crash risks.
   - **Visual Sugar Cubes Breakdown**: Quantifies exact sugar content (1 cube = 4g) against the **World Health Organization (WHO) 25g daily maximum**.
   - **Chemical Additives & E-Numbers Decoder**: Translates E-numbers (E150d, E338, E211, E951, E621, etc.) into plain-language health explanations and safety classifications.
   - **Smart Healthier Alternatives**: Recommends cleaner alternatives with lower sugar profiles.

4. **Today's Metabolic Journal**:
   - Live **Clean Eating Index (0–100)**.
   - Daily sugar limit tracking against WHO guidelines.
   - Real-time ultra-processed food tally and chemical additive consumption logs.

5. **International Crowdsourced Registry**:
   - Open contribution system allowing consumers anywhere in the world to submit new or unindexed packaged food products directly to the database.

---

## 🏗️ Technical Architecture ($0 Operational Cost)

| Component | Technology | Cost | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15, React 19, TypeScript | **$0** | High-performance mobile-first application |
| **Styling & UI** | Tailwind CSS, Lucide Icons | **$0** | Responsive, accessible modern design |
| **Edge Hosting & CDN** | Cloudflare Pages | **$0** | Global edge network with zero latency |
| **Product Database** | Open Food Facts API | **$0** | Worldwide crowdsourced food database |
| **Cloud Database** | Supabase (PostgreSQL with RLS) | **$0** | Community product submissions & persistence |
| **Barcode Engine** | html5-qrcode | **$0** | In-browser camera barcode recognition |

---

## 🚀 Local Development

```bash
# Clone the repository
git clone https://github.com/busingesamuel04-stack/foodsafe-global.git
cd foodsafe-global

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Verification Suite
```bash
# Run linting, TypeScript checks, and Node test runner
npm run check

# Verify Next.js static export for Cloudflare Pages
npm run build:export
```

---

## 🌐 Live Deployment

* **Production URL**: [https://foodsafe-global.pages.dev](https://foodsafe-global.pages.dev)
* **GitHub Repository**: [https://github.com/busingesamuel04-stack/foodsafe-global](https://github.com/busingesamuel04-stack/foodsafe-global)
