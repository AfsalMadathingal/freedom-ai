# Freedom AI Web

An open-source, modern AI chat interface built with **React**, **Vite**, and **Tailwind CSS**. This application is a visual clone of **[claude.ai](https://claude.ai)**, meticulously replicating its premium style and fluid user experience.

## Backend & Model

This application leverages the **[antigravity-claude-proxy](https://github.com/badrisnarayanan/antigravity-claude-proxy)** to provide access to models available freely on Antigravity. To use this app, you must first start the proxy server locally. The frontend proxies all requests through this server to receive AI responses.

**Required Proxy Server:** [https://github.com/badrisnarayanan/antigravity-claude-proxy](https://github.com/badrisnarayanan/antigravity-claude-proxy)

## Features

- **Modern UI/UX**: Sleek dark mode design mirroring the Claude.ai interface.
- **Streaming Response**: Real-time, word-by-word streaming of AI responses.
- **Thinking Process**: dedicated UI for visualizing the AI's "thought process" (collapsible).
- **Markdown Support**: Full rendering for code blocks, tables, and lists using `react-markdown` and `remark-gfm`.
- **File Attachments**: Support for image and document uploads (UI ready).
- **Responsive**: Fully mobile-responsive sidebar and chat layout.

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Icons**: React Icons (Lucide)
- **Markdown**: React Markdown, Remark GFM, Rehype Highlight

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- **Antigravity Proxy Server** (running locally)

### Installation

1.  **Start the Proxy Server**:
    Follow the instructions at [antigravity-claude-proxy](https://github.com/badrisnarayanan/antigravity-claude-proxy) to get your local backend running (usually on `http://localhost:8080`).

2.  **Clone this repository**:
    ```bash
    git clone https://github.com/your-username/freedom-ai-web.git
    cd freedom-ai-web
    ```

3.  **Install dependencies**:
    ```bash
    npm install
    ```

4.  **Start the development server**:
    ```bash
    npm run dev
    ```

5.  **Open [http://localhost:5173](http://localhost:5173)** in your browser.

## Configuration

- **API Endpoint**: By default, the app points to `http://localhost:8080` (see `src/api.js`). Ensure your proxy server is running on this port for the app to function correctly.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
