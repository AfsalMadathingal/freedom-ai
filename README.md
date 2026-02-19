# Freedom AI Web

An open-source, modern AI chat interface built with **React**, **Vite**, and **Tailwind CSS**. Designed to replicate a premium, fluid user experience similar to leading LLM interfaces.

## Features

- **Modern UI/UX**: Sleek dark mode design with glassmorphism effects.
- **Streaming Response**: Real-time, word-by-word streaming of AI responses.
- **Thinking Process**: dedicated UI for visualizing the AI's "thought process" (collapsible).
- **Markdown Support**: Full rendering for code blocks, tables, and lists using `react-markdown` and `remark-gfm`.
- **File Attachments**: Support for image and document uploads (UI ready).
- **Responsive**: Fully mobile-responsive sidebar and chat layout.
- **Customizable**: Easy to fork and adapt for your own backend API.

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Icons**: React Icons (Lucide)
- **Markdown**: React Markdown, Remark GFM, Rehype Highlight

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/freedom-ai-web.git
    cd freedom-ai-web
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## Configuration

- **API Endpoint**: By default, the app points to `http://localhost:8080` (see `src/api.js`). You will need a backend running compatible with the SSE streaming format used here, or modify `api.js` to point to a different provider (e.g., Anthropic, OpenAI).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# freedom-ai
