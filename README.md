# TeleCloud ☁️

TeleCloud is a powerful cloud storage solution that leverages Telegram's unlimited storage API, featuring intelligent large file handling, a modern responsive UI, and robust file management capabilities.

> [!NOTE]
> This project uses Telegram as a storage backend. Please ensure you comply with Telegram's Terms of Service.

## 🎯 Who is TeleCloud for?

TeleCloud is designed for:

- Developers who want **free / low-cost cloud storage**
- Users comfortable with **self-hosting**
- Projects that need **large file storage without S3 costs**

Not recommended if:

- You need enterprise SLA
- You don’t want to manage Telegram bots or Cloudflare

## ✨ Key Features

- **🚀 Unlimited Storage**: Utilizes Telegram's infrastructure for reliable and unlimited file storage.
- **📦 Large File Support**: **Auto-slicing** technology automatically splits files larger than 20MB (or custom limits -no implement yet) into manageable chunks, bypassing standard bot API restrictions.
- **🎨 Modern UI**: Built with **React 19**, **Vite**, and **TailwindCSS v4**, featuring a beautiful, responsive interface with Dark Mode support.
- **📂 Smart File Management**:
  - Drag-and-drop uploads.
  - Advanced sorting and searching.
  - File previews (Video streaming, Markdown rendering, Image viewing).
  - Folder-like organization.
- **⚡ High Performance**: Powered by **Cloudflare Workers** and **D1 Database** for low-latency metadata access and proxying.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, TailwindCSS
- **Backend**: Cloudflare Workers (Edge Compute)
- **Database**: Cloudflare D1 (SQLite at the Edge)
- **Integration**: Telegram Bot API

## 🚀 Setup & Deployment

### 📦 Prerequisites

- Node.js >= 18
- Cloudflare account
- Telegram Bot Token (get from @BotFather)
- Basic knowledge of Cloudflare Workers

### 1. Clone & Install

```bash
git clone https://github.com/Im-Not-God/TeleCloud.git
cd telecloud
npm install
```

### 2. Backend Setup (Cloudflare Worker & D1)

**Deploy Worker:**

```bash
# Deploy the worker logic
npx wrangler deploy worker.js --name telecloud-worker
```

**Setup Database (D1):**

1. Create the D1 database:
   ```bash
   npx wrangler d1 create telecloud-db
   ```
2. Initialize the database schema:
   ```bash
   npx wrangler d1 execute telecloud-db --file=./schema.sql
   ```
   _(Note: For remote database, add `--remote` flag if needed)_

**Connect Worker to D1:**

- Go to your Cloudflare Dashboard -> Workers -> [Your Worker] -> Settings -> Variables.
- Add a D1 Database binding with variable name: `DB`.
- Select your `telecloud-db`.

### 3. Frontend Setup (Local Development)

**Run Locally:**

```bash
npm run dev
```

Open `http://localhost:3000` to view the app.

### 4. Deployment (Cloudflare Pages)

**Option A: Command Line**
Build and deploy directly using Wrangler:

```bash
npm run publish
```

**Option B: GitHub Integration (Recommended)**

1. Go to Cloudflare Dashboard -> Workers & Pages -> Create Application -> Pages -> Connect to Git.
2. Select your repository.
3. **Build Settings**:
   - **Framework Preset**: React (Vite)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deploy!

## 🧪 Development Approach

TeleCloud is primarily developed using a **vibe-driven coding approach**.

This means:

- Rapid prototyping and iteration over rigid upfront design
- Heavy use of intuition, experimentation, and real-world testing
- Refactoring happens continuously as features stabilize

While the development style is informal, the project still emphasizes:

- Clear architecture boundaries
- Practical reliability over theoretical perfection
- Incremental improvement rather than premature optimization

As the project matures, parts of the codebase may be refactored, documented, or formalized further.

## 📄 License

MIT
