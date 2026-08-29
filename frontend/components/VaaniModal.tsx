'use client';

import React, { useState } from 'react';

interface VaaniModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VaaniModal({ isOpen, onClose }: VaaniModalProps) {
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected'>('idle');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FFF8F6] border-2 border-[#8d4b00]/30 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
        {/* Background Decorative Gradient */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#D99B4E]/20 rounded-full blur-2xl pointer-events-none"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FFEAE1] text-[#351000] flex items-center justify-center hover:bg-[#FFDBCC] transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Content */}
        <div className="flex flex-col items-center pt-2 pb-4">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#8d4b00] to-[#D99B4E] flex items-center justify-center text-white shadow-lg animate-pulse">
              <span className="material-symbols-outlined text-4xl">phone_in_talk</span>
            </div>
            <div className="absolute -inset-2 rounded-full border-2 border-[#D99B4E]/40 animate-ping pointer-events-none"></div>
          </div>

          <h3 className="text-2xl font-bold text-[#351000] marathi-text mb-1">वारीवाणी व्हॉईस असिस्टंट</h3>
          <p className="text-sm text-[#554336] marathi-text mb-6">
            {callState === 'idle' && 'वारीबद्दल माहिती मिळवण्यासाठी किंवा मदत मिळवण्यासाठी कॉल करा'}
            {callState === 'calling' && 'असिस्टंटशी संपर्क होत आहे...'}
            {callState === 'connected' && 'वारीवाणी सुरू आहे. बोलू शकता...'}
          </p>

          <div className="w-full space-y-3">
            {callState === 'idle' && (
              <>
                <button
                  onClick={() => setCallState('calling')}
                  className="w-full bg-[#8d4b00] hover:bg-[#6e3900] text-white py-3.5 px-6 rounded-2xl font-bold text-lg marathi-text shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98"
                >
                  <span className="material-symbols-outlined text-2xl">call</span>
                  आत्ता कॉल करा (AI Agent)
                </button>
                <div className="bg-[#FFEAE1] border border-[#8d4b00]/20 rounded-xl p-3 text-xs text-[#8d4b00] font-medium marathi-text">
                  📞 किंवा टेलिफोनवरून डायल करा: <strong>+91 80-XXXX-XXXX</strong>
                </div>
              </>
            )}

            {callState === 'calling' && (
              <button
                onClick={() => setCallState('connected')}
                className="w-full bg-[#D99B4E] text-white py-3.5 px-6 rounded-2xl font-bold text-lg marathi-text shadow-md animate-pulse"
              >
                कनेक्ट होत आहे... (क्लिक करा)
              </button>
            )}

            {callState === 'connected' && (
              <button
                onClick={() => {
                  setCallState('idle');
                  onClose();
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 px-6 rounded-2xl font-bold text-lg marathi-text shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-2xl">call_end</span>
                कॉल थांबवा
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
