import { useState } from "react";
import Chat from "./chat.jsx";
import Home from "./home.jsx";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { ChatProvider } from "./context/ChatContext.jsx";

function App() {
  const [isPinned, setIsPinned] = useState(false);
  const router = createHashRouter([
    {
      path: "/",
      element: <Home isPinned={isPinned} setIsPinned={setIsPinned} />,
    },
    {
      path: "/chat/:id",
      element: <Chat isPinned={isPinned} setIsPinned={setIsPinned} />,
    },
  ]);
  return (
    <ChatProvider>
      <RouterProvider router={router} />
    </ChatProvider>
  );
}
export default App;
