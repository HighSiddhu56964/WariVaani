"use client";

import React, { useState } from "react";
import { WariVaaniHeader } from "@/components/nav/WariVaaniHeader";
import { WarkariBottomNav } from "@/components/nav/WariVaaniNavbar";
import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Square,
  Keyboard,
  Globe,
  Sparkles,
  Volume2,
  Send
} from "lucide-react";

export default function WarkariVoiceAssistantPage() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "agent"; text: string }>>([
    {
      sender: "agent",
      text: "राम कृष्ण हरी! मी वारीवाणी AI सहाय्यक आहे. मी पालखीचे ठिकाण, मुक्काम किंवा वैद्यकीय मदतीबद्दल सांगू शकतो.",
    },
  ]);
  const [textInput, setTextInput] = useState<string>("");
  const [showInput, setShowInput] = useState<boolean>(false);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTranscript("पालखी आता कुठे पोहोचली आहे?");
      setTimeout(() => {
        setIsRecording(false);
        setMessages((prev) => [
          ...prev,
          { sender: "user", text: "पालखी आता कुठे पोहोचली आहे?" },
          {
            sender: "agent",
            text: "संत ज्ञानेश्वर महाराज पालखी सध्या वाखरी येथे असून पुढील मुक्काम पंढरपूर येथे संध्याकाळी ५:३० वाजता आहे.",
          },
        ]);
        setTranscript("");
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const userText = textInput;
    setTextInput("");
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userText },
      {
        sender: "agent",
        text: `आपल्या '${userText}' या प्रश्नावर माहिती: जवळील वैद्यकीय मदत केंद्र वाखरी चौकात उपलब्ध आहे.`,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-24 flex flex-col justify-between">
      <div>
        <WariVaaniHeader title="Voice Assistant" subtitle="वारीवाणी आवाज सहाय्यक" role="warkari" />

        <main className="max-w-md mx-auto px-4 py-4 space-y-5">
          {/* Top Controls Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sarvam Saaras v3 STT</span>
            </span>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-200 rounded-full text-xs font-semibold text-stone-700 shadow-sm">
              <Globe className="w-3.5 h-3.5 text-orange-500" />
              <span>मराठी (mr-IN)</span>
            </div>
          </div>

          {/* Animated Hero Mic Orb (Screen 9) */}
          <div className="relative py-8 flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center my-4">
              {isRecording && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute w-44 h-44 rounded-full bg-orange-400/20 border border-orange-300"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                    className="absolute w-32 h-32 rounded-full bg-orange-500/25 border border-orange-400"
                  />
                </>
              )}

              <button
                onClick={toggleRecording}
                type="button"
                className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-4 border-white transition-all active:scale-90 ${
                  isRecording
                    ? "bg-rose-600 text-white shadow-rose-500/40"
                    : "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-orange-500/40 hover:scale-105"
                }`}
              >
                <Mic className="w-10 h-10 stroke-[2.2]" />
              </button>
            </div>

            <p className="text-xs font-bold text-stone-600 mt-2">
              {isRecording ? "ऐकत आहे... (Listening...)" : "बोलण्यासाठी मायक्रोफोनवर टॅप करा"}
            </p>

            {/* Sub Controls (Screen 9: Mute, Stop, Keyboard) */}
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                type="button"
                className={`p-3 rounded-2xl border ${
                  isMuted
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsRecording(false)}
                type="button"
                className="p-3 rounded-2xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                <Square className="w-5 h-5 fill-current text-rose-500" />
              </button>

              <button
                onClick={() => setShowInput(!showInput)}
                type="button"
                className="p-3 rounded-2xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                <Keyboard className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Live Transcript Box (Screen 9) */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-orange-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                Live Transcript
              </span>
              <span className="text-stone-400 font-normal">Saaras STT</span>
            </div>

            <div className="min-h-[50px] text-xs font-medium text-stone-800 bg-stone-50 rounded-2xl p-3 border border-stone-100 italic">
              {transcript || (isRecording ? "बोलणे सुरु करा..." : "काहीही विचारण्यासाठी मायक्रोफोन दाबा")}
            </div>
          </div>

          {/* Text Input Drawer if Keyboard toggled */}
          {showInput && (
            <form onSubmit={handleSendText} className="flex items-center gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="प्रश्न टाईप करा..."
                className="flex-1 px-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-orange-600 text-white rounded-2xl shadow-sm hover:bg-orange-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Conversation History (Screen 9) */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Conversation History
            </h4>

            <div className="space-y-2.5">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-3xl text-xs font-medium leading-relaxed max-w-[85%] ${
                    msg.sender === "user"
                      ? "bg-amber-100 text-amber-950 border border-amber-200 ml-auto rounded-tr-xs"
                      : "bg-white text-stone-900 border border-stone-200/80 mr-auto rounded-tl-xs shadow-sm"
                  }`}
                >
                  <div className="text-[10px] font-bold text-stone-400 mb-1">
                    {msg.sender === "user" ? "तुम्ही (You)" : "वारीवाणी AI"}
                  </div>
                  {msg.text}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <WarkariBottomNav />
    </div>
  );
}
