

# Freedom AI Web

<img width="1280" height="720" alt="Colorful Blue Illustrated Zoom Video Call Education Zoom Virtual Background (1)" src="https://github.com/user-attachments/assets/9e4c66d7-24ec-497c-9698-facaf19641ed" />


A high-fidelity **Claude AI** clone designed to replicate the premium look and feel of the official interface. The main goal of this project is to provide a seamless, fluid AI chat experience by leveraging an external proxy API to access powerful models freely.

## Backend & Model

This application leverages the **[antigravity-claude-proxy](https://github.com/badrisnarayanan/antigravity-claude-proxy)** to provide access to models available freely on Antigravity. To use this app, you must first start the proxy server locally. The frontend proxies all requests through this server to receive AI responses.

**Required Proxy Server:** [https://github.com/badrisnarayanan/antigravity-claude-proxy](https://github.com/badrisnarayanan/antigravity-claude-proxy)

## Features

- **Modern UI/UX**: Sleek dark mode design mirroring the Claude.ai interface.
- **Streaming Response**: Real-time, word-by-word streaming of AI responses.
- **Thinking Process**: Dedicated UI for visualizing the AI's "thought process" (collapsible).
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
- **A compatible proxy server** (running locally — see API contract below)

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

---

## Proxy API Contract

The frontend communicates with the proxy on a configurable port (default `8080`). If you want to use a **different or custom proxy**, it must implement the following two endpoints exactly.

> **Base URL:** `http://localhost:<PORT>` — configurable at first launch via the UI.

---

### 1. `GET /v1/models` — List Available Models

Used on startup to populate the model selector and verify the proxy is reachable.

**Request**
```
GET http://localhost:8080/v1/models
```
No headers or body required.

**Expected Response** — `200 OK`, `Content-Type: application/json`
```json
{
  "data": [
    {
      "id": "claude-opus-4-5",
      "description": "Claude Opus"
    },
    {
      "id": "claude-sonnet-4-5",
      "description": "Claude Sonnet"
    }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `data` | `array` | List of model objects |
| `data[].id` | `string` | Model identifier sent in chat requests |
| `data[].description` | `string` | Human-readable label shown in the UI. Falls back to `id` if omitted. |

> Any non-`200` response or network error is treated as **proxy unavailable**, triggering the error modal.

---

### 2. `POST /v1/messages` — Send a Chat Message (Streaming)

Used for every chat turn. **Must support SSE streaming.**

**Request**
```
POST http://localhost:8080/v1/messages
Content-Type: application/json
x-api-key: test
anthropic-version: 2023-06-01
```

**Request Body**
```json
{
  "model": "claude-sonnet-4-5",
  "max_tokens": 16384,
  "stream": true,
  "messages": [
    { "role": "user", "content": "Hello!" },
    { "role": "assistant", "content": "Hi there!" },
    { "role": "user", "content": "Tell me a joke." }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `model` | `string` | One of the `id` values returned by `/v1/models` |
| `max_tokens` | `number` | Hard-coded to `16384` |
| `stream` | `boolean` | Always `true` |
| `messages` | `array` | Full conversation history, alternating `user` / `assistant` roles |
| `messages[].role` | `"user"` \| `"assistant"` | — |
| `messages[].content` | `string` \| `array` | Plain string or Anthropic-style content blocks (for file attachments) |

---

**Response** — `200 OK`, `Content-Type: text/event-stream`

The response must be a standard **Server-Sent Events (SSE)** stream. Each line is prefixed with `data: ` and contains a JSON object. The stream ends with `data: [DONE]`.

```
data: {"type":"content_block_start", ...}
data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hi"}}
data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"!"}}
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"}}
data: [DONE]
```

**SSE Event types handled by the client:**

| `type` | `delta.type` | Description |
|---|---|---|
| `content_block_delta` | `text_delta` | Streamed text chunk. `delta.text` is appended to the response. |
| `content_block_delta` | `thinking_delta` | Streamed thinking/reasoning chunk. `delta.thinking` is displayed in the collapsible thinking panel. |
| `message_delta` | *(any)* | Acknowledged but not used (stop reason is ignored). |
| `error` | — | `error.message` is surfaced as a chat error. |

> Any other event types are silently ignored. Unknown fields within known events are also safely ignored.

---

### Using a Custom Proxy

If you are implementing your own proxy instead of using `antigravity-claude-proxy`, your server must:

1. **Expose** `GET /v1/models` returning the model list shape above.
2. **Expose** `POST /v1/messages` accepting the Anthropic-compatible body and responding with a valid SSE stream.
3. **Allow CORS** from `http://localhost:5173` (or wherever the frontend is served), since the browser makes direct cross-origin requests to the proxy.
4. **Accept any value** for `x-api-key` and `anthropic-version` headers (the frontend sends fixed placeholder values).

Example minimal CORS headers your proxy should return:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type, x-api-key, anthropic-version
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

---

## Configuration

- **Proxy Port**: Configurable at first launch via the in-app setup dialog. Change it anytime via the sidebar settings. The port is persisted in `localStorage` under the key `claude-proxy-port`.
- **Default Port**: `8080`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
