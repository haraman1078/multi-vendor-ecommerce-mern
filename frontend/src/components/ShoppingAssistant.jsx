import { useState, useRef, useEffect } from "react";
import API from "../api/axios";

/*
  WHY a floating chat bubble?
  It's accessible from every page without leaving the product list.
  Real e-commerce sites (Flipkart, Myntra) all have chat widgets now.
  The key UX decision: it doesn't cover the products — sits bottom-right,
  opens upward, closes when you click outside.
*/

const ShoppingAssistant = ({ products = [] }) => {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! 👋 I'm your shopping assistant. Tell me what you're looking for and I'll recommend products from our store!",
    },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message immediately (feels responsive)
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      // Send user message + product catalog to backend AI route
      const { data } = await API.post("/ai/shopping-assistant", {
        message: userMessage,
        products: products.map((p) => ({
          name:          p.name,
          price:         p.price,
          category:      p.category,
          averageRating: p.averageRating,
        })),
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I'm having trouble connecting right now. Please try again!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Chat Window ── */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96
                        bg-white border border-gray-200 rounded-2xl shadow-xl
                        flex flex-col overflow-hidden"
          style={{ height: "420px" }}>

          {/* Header */}
          <div className="bg-[#131921] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center
                              justify-center text-[#131921] text-sm font-bold">✨</div>
              <div>
                <p className="text-white text-sm font-medium">Shopping Assistant</p>
                <p className="text-gray-400 text-xs">Powered by Llama 3 (Groq)</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-yellow-400 text-gray-900 rounded-br-sm"
                    : "bg-white border border-gray-200 text-gray-700 rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm
                                px-4 py-2.5 flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips */}
          {messages.length === 1 && (
            <div className="px-3 py-2 flex gap-2 flex-wrap bg-gray-50 border-t border-gray-100">
              {[
                "Budget phones under ₹15000",
                "Best rated products",
                "Gift ideas under ₹1000",
              ].map((suggestion) => (
                <button key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-xs bg-white border border-gray-200 text-gray-600
                             px-2.5 py-1 rounded-full hover:border-yellow-400
                             hover:text-yellow-600 transition-colors">
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage}
            className="border-t border-gray-200 p-3 flex gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm
                         text-gray-800 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-yellow-400
                         focus:border-transparent disabled:opacity-60"
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50
                         text-gray-900 p-2 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* ── Floating Button ── */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-[#131921]
                   hover:bg-gray-800 text-white rounded-full shadow-lg
                   flex items-center justify-center transition-all
                   hover:scale-105 active:scale-95"
        aria-label="Open shopping assistant"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor"
            strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        ) : (
          <span className="text-xl">✨</span>
        )}

        {/* Pulse ring to draw attention */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-yellow-400 opacity-30
                           animate-ping" />
        )}
      </button>
    </>
  );
};

export default ShoppingAssistant;