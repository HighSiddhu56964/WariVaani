'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSetupPage() {
  const router = useRouter();
  // Initially null so both accordion cards are CLOSED when user enters the page
  const [connectionType, setConnectionType] = useState<'in_wari' | 'family_in_wari' | null>(null);
  const [hasWariMobile, setHasWariMobile] = useState<'yes' | 'no'>('yes');
  const [language, setLanguage] = useState<'marathi' | 'hindi' | 'english'>('marathi');

  const handleToggleOption = (option: 'in_wari' | 'family_in_wari') => {
    // Allows freely opening AND closing cards on click
    setConnectionType((prev) => (prev === option ? null : option));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/home');
  };

  return (
    <main className="w-full h-full flex flex-col justify-between relative bg-[#FBF3E7] text-[#3e2723] p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FBF3E7]/80 to-[#FBF3E7] pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col flex-1 py-4">
        {/* Header */}
        <header className="text-center mb-6 flex flex-col items-center">
          <h1 className="text-[#3e2723] text-2xl font-semibold marathi-text tracking-wider mb-1 drop-shadow-sm">
            ॥ राम कृष्ण हरी ॥
          </h1>

          <div className="flex items-center justify-center space-x-2 my-2 w-48">
            <div className="h-px bg-[#d4af37] flex-grow"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37] transform rotate-45"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div>
            <div className="h-px bg-[#d4af37] flex-grow"></div>
          </div>
          <p className="text-xl text-[#3e2723] mt-1 marathi-text">तुमचे स्वागत आहे</p>
        </header>

        {/* Main Form Content */}
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col gap-4">
          <section className="text-center">
            <h2 className="text-xl font-bold text-[#3e2723] mb-1 marathi-text">
              तुम्ही वारीशी कसे जोडलेले आहात?
            </h2>
            <p className="text-sm text-[#5c1607] mb-4 marathi-text">तुमचा अनुभव निवडा.</p>

            <div className="space-y-4 text-left">
              {/* CHOICE 1: In Wari */}
              <div>
                <div
                  onClick={() => handleToggleOption('in_wari')}
                  className={`card-surface rounded-2xl p-5 cursor-pointer transition-all ${
                    connectionType === 'in_wari'
                      ? 'border-2 border-[#D99B4E] shadow-[0_0_15px_rgba(217,155,78,0.3)] bg-[#F5E9D6]'
                      : 'border border-[#C9A45C]/30 bg-[#F5E9D6]/60 hover:border-[#D99B4E]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">🙏</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#3e2723] marathi-text">मी वारीत आहे</h3>
                      <p className="text-sm text-[#5c1607] marathi-text">माझ्या वारीसाठी</p>
                    </div>
                    <span className="material-symbols-outlined text-[#D99B4E] text-2xl transition-transform duration-200">
                      {connectionType === 'in_wari' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                    </span>
                  </div>
                </div>

                {/* EXPANDED SECTION 1: In Wari details */}
                {connectionType === 'in_wari' && (
                  <div className="mt-2 bg-[#F5E9D6] border border-[#D99B4E]/40 rounded-2xl p-5 space-y-4 animate-fade-in shadow-inner">
                    <h3 className="text-base font-bold text-[#3e2723] border-b border-[#82746c]/20 pb-2 marathi-text">
                      तुमच्याबद्दल थोडंसं सांगा
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-[#3e2723] mb-1 marathi-text">
                        तुमचे नाव
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा. विठ्ठल पाटील"
                        className="w-full bg-[#FFF8F5] border border-[#d4c3ba] rounded-xl px-4 py-3 text-[#3e2723] marathi-text focus:outline-none focus:border-[#D99B4E]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3e2723] mb-1 marathi-text">
                        मोबाईल नंबर
                      </label>
                      <div className="flex gap-2">
                        <span className="bg-[#e9e1dd] px-4 py-3 rounded-xl text-[#3e2723] border border-[#d4c3ba] font-medium">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="9876543210"
                          className="flex-grow bg-[#FFF8F5] border border-[#d4c3ba] rounded-xl px-4 py-3 text-[#3e2723] focus:outline-none focus:border-[#D99B4E]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3e2723] mb-1 marathi-text">
                        तुमची वारी कोणासोबत?
                      </label>
                      <select className="w-full bg-[#FFF8F5] border border-[#d4c3ba] rounded-xl px-4 py-3 text-[#3e2723] marathi-text focus:outline-none focus:border-[#D99B4E]">
                        <option>एकटे / एकटी</option>
                        <option>कुटुंबासोबत</option>
                        <option>मित्र / नातेवाईक</option>
                        <option>दिंडीसोबत</option>
                      </select>
                    </div>

                    {/* Language Selection */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-[#3e2723] marathi-text">भाषा:</span>
                      <div className="flex gap-2 bg-[#FFF8F5] px-3 py-1.5 rounded-xl border border-[#d4c3ba] text-xs">
                        <button
                          type="button"
                          onClick={() => setLanguage('marathi')}
                          className={`font-bold ${language === 'marathi' ? 'text-[#D99B4E]' : 'text-[#82746c]'}`}
                        >
                          मराठी
                        </button>
                        <span>|</span>
                        <button
                          type="button"
                          onClick={() => setLanguage('hindi')}
                          className={`font-bold ${language === 'hindi' ? 'text-[#D99B4E]' : 'text-[#82746c]'}`}
                        >
                          हिंदी
                        </button>
                        <span>|</span>
                        <button
                          type="button"
                          onClick={() => setLanguage('english')}
                          className={`font-bold ${language === 'english' ? 'text-[#D99B4E]' : 'text-[#82746c]'}`}
                        >
                          English
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CHOICE 2: Family in Wari */}
              <div>
                <div
                  onClick={() => handleToggleOption('family_in_wari')}
                  className={`card-surface rounded-2xl p-5 cursor-pointer transition-all ${
                    connectionType === 'family_in_wari'
                      ? 'border-2 border-[#D99B4E] shadow-[0_0_15px_rgba(217,155,78,0.3)] bg-[#F5E9D6]'
                      : 'border border-[#C9A45C]/30 bg-[#F5E9D6]/60 hover:border-[#D99B4E]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">❤️</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#3e2723] marathi-text">
                        माझे कुटुंबीय वारीत आहेत
                      </h3>
                      <p className="text-sm text-[#5c1607] marathi-text">त्यांच्यासोबत राहा</p>
                    </div>
                    <span className="material-symbols-outlined text-[#D99B4E] text-2xl transition-transform duration-200">
                      {connectionType === 'family_in_wari' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                    </span>
                  </div>
                </div>

                {/* EXPANDED SECTION 2: Family in Wari */}
                {connectionType === 'family_in_wari' && (
                  <div className="mt-2 bg-[#F5E9D6] border border-[#D99B4E]/40 rounded-2xl p-5 space-y-4 animate-fade-in shadow-inner">
                    <h3 className="text-base font-bold text-[#3e2723] border-b border-[#82746c]/20 pb-2 marathi-text">
                      वारकऱ्याशी जोडूया
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-[#3e2723] mb-1 marathi-text">
                        तुमचे नाव
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="तुमचे नाव"
                        className="w-full bg-[#FFF8F5] border border-[#d4c3ba] rounded-xl px-4 py-3 text-[#3e2723] marathi-text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3e2723] mb-1 marathi-text">
                        तुमचा मोबाईल नंबर
                      </label>
                      <div className="flex gap-2">
                        <span className="bg-[#e9e1dd] px-4 py-3 rounded-xl text-[#3e2723] border border-[#d4c3ba] font-medium">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="9876543210"
                          className="flex-grow bg-[#FFF8F5] border border-[#d4c3ba] rounded-xl px-4 py-3 text-[#3e2723]"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-sm font-medium text-[#3e2723] mb-2 marathi-text">
                        वारकऱ्याचा मोबाईल आहे?
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setHasWariMobile('yes')}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-bold marathi-text ${
                            hasWariMobile === 'yes'
                              ? 'bg-[#D99B4E] text-white border-[#D99B4E]'
                              : 'bg-[#FFF8F5] text-[#3e2723] border-[#d4c3ba]'
                          }`}
                        >
                          📱 मोबाईल नंबर आहे
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasWariMobile('no')}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-bold marathi-text ${
                            hasWariMobile === 'no'
                              ? 'bg-[#D99B4E] text-white border-[#D99B4E]'
                              : 'bg-[#FFF8F5] text-[#3e2723] border-[#d4c3ba]'
                          }`}
                        >
                          🤍 नंबर नाही
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full btn-primary rounded-full py-4 font-bold text-xl marathi-text flex items-center justify-center gap-2 mt-auto shadow-lg hover:scale-[1.02] active:scale-98 transition-transform"
          >
            पुढे <span className="material-symbols-outlined text-2xl">arrow_forward</span>
          </button>
        </form>
      </div>
    </main>
  );
}
