export async function sendMessage(messages, model, onChunk, signal, baseUrl = 'http://localhost:8080', system = '') {
  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'test',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 16384,
      stream: true,
      system: system,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  let fullText = '';
  let fullThinking = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep the last partial line

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6).trim();
        if (dataStr === '[DONE]') continue;
        try {
          const data = JSON.parse(dataStr);
          
          // Handle Text Delta
          if (data.type === 'content_block_delta' && data.delta?.type === 'text_delta') {
             const text = data.delta.text;
             fullText += text;
             onChunk({ text: fullText, thinking: fullThinking });
          }
          
          // Handle Thinking Delta
          else if (data.type === 'content_block_delta' && data.delta?.type === 'thinking_delta') {
             const thinking = data.delta.thinking;
             fullThinking += thinking;
             onChunk({ text: fullText, thinking: fullThinking });
          }
          
          // Handle Message Delta (optional, for stops)
          else if (data.type === 'message_delta') {
             // Handle stop reason if needed
          }
          
          // Handle Error
          else if (data.type === 'error') {
             const errorMsg = data.error?.message || 'Unknown error';
             onChunk({ error: errorMsg });
          }

        } catch (e) {
          // console.error('Error parsing SSE data:', e);
        }
      }
    }
  }

  // Return the final objects
  return { text: fullText, thinking: fullThinking };
}

export async function sendMessageNonStreaming(messages, model, baseUrl = 'http://localhost:8080') {
  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'test',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 16384,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  // TODO: Handle thinking in non-streaming response if needed
  return data.content?.[0]?.text || '';
}
