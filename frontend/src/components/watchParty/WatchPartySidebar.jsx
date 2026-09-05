import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaUsers, FaComments, FaCrown, FaCopy, FaCheck } from "react-icons/fa";

const WatchPartySidebar = ({
  messages,
  users,
  sendMessage,
  hostId,
  currentUser,
  roomId,
}) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [inputText, setInputText] = useState("");
  const [copied, setCopied] = useState(false);
  const chatBottomRef = useRef(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-[600px] w-full lg:w-96 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header with Share Button */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h2 className="font-semibold text-white text-sm tracking-wide">Watch Party</h2>
        </div>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs text-zinc-200 rounded-lg transition-all border border-zinc-700"
          title="Copy invite link"
        >
          {copied ? (
            <>
              <FaCheck className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <FaCopy />
              <span>Invite</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-950/40">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-medium border-b-2 transition-all ${
            activeTab === "chat"
              ? "border-emerald-500 text-emerald-400 bg-zinc-800/30"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FaComments />
          <span>Chat ({messages.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-medium border-b-2 transition-all ${
            activeTab === "users"
              ? "border-emerald-500 text-emerald-400 bg-zinc-800/30"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FaUsers />
          <span>Members ({users.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "chat" ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs italic">
                Say hello! Chat is live for everyone in this room.
              </div>
            ) : (
              messages.map((msg) => {
                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-2">
                      <span className="text-[11px] text-zinc-500 bg-zinc-800/60 px-2.5 py-1 rounded-full border border-zinc-800">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isMe = msg.user?._id === currentUser?._id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] font-semibold text-zinc-400">
                        {isMe ? "You" : msg.user?.username || "Guest"}
                      </span>
                      {msg.user?._id === hostId && (
                        <FaCrown className="text-amber-400 text-[10px]" title="Host" />
                      )}
                    </div>
                    <div
                      className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs break-words shadow-sm ${
                        isMe
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700/50"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-zinc-800 bg-zinc-900/60 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white p-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center"
            >
              <FaPaperPlane className="text-xs" />
            </button>
          </form>
        </div>
      ) : (
        /* Participants List */
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {users.map((user) => (
            <div
              key={user.socketId || user._id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800/60 hover:bg-zinc-800/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {user.username?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-white">
                      {user.fullName || user.username}
                    </span>
                    {user._id === hostId && (
                      <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full">
                        <FaCrown className="text-[8px]" /> Host
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-400">@{user.username}</span>
                </div>
              </div>

              {user._id === currentUser?._id && (
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                  You
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchPartySidebar;

