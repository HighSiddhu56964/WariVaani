'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/BottomNav';

export default function MissingPersonPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between relative bg-[#FFF8E8] text-[#4A3219] overflow-y-auto pb-24">
      {/* Header */}
      <header className="pt-6 pb-4 px-5 bg-gradient-to-b from-[#FCF3D7] to-transparent sticky top-0 z-20 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-red-600 fill text-2xl">
            person_search
          </span>
          <h1 className="text-xl font-bold text-[#351000] marathi-text">
            बेपत्ता व्यक्ती नोंदणी (Lost & Found)
          </h1>
        </div>
      </header>

      <main className="px-5 flex flex-col gap-4 z-10 relative">
        {/* Emergency Alert Banner */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600 text-3xl">emergency</span>
            <div>
              <p className="text-xs font-bold text-red-900 marathi-text">तात्काळ मदत आवश्यक आहे?</p>
              <p className="text-[11px] text-red-700 marathi-text">वारीवाणी हेल्पलाईन: १८००-१२३-४५६</p>
            </div>
          </div>
          <a
            href="tel:1800123456"
            className="bg-red-600 text-white font-bold text-xs px-3 py-2 rounded-xl marathi-text shadow-xs"
          >
            कॉल करा
          </a>
        </div>

        {submitted ? (
          <div className="bg-[#FCF3D7] border-2 border-emerald-500 rounded-2xl p-6 text-center space-y-3 animate-fade-in">
            <span className="material-symbols-outlined text-emerald-600 text-5xl">check_circle</span>
            <h2 className="text-xl font-bold text-[#351000] marathi-text">तक्रार यशस्वीरित्या नोंदवली आहे!</h2>
            <p className="text-xs text-[#554336] marathi-text">
              माहिती वारी सुरक्षा पथक आणि सर्व कंट्रोल रूमकडे पाठवण्यात आली आहे.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-[#E27730] text-white font-bold text-sm px-6 py-2.5 rounded-xl marathi-text mt-4"
            >
              नवीन नोंदणी करा
            </button>
          </div>
        ) : (
          /* Form Container */
          <form onSubmit={handleSubmit} className="bg-[#FCF3D7] border border-[#E9D8A6] rounded-2xl p-4 space-y-4 shadow-md">
            {/* Photo Upload Area */}
            <div>
              <label className="block text-xs font-bold text-[#351000] mb-1.5 marathi-text">
                व्यक्तीचा फोटो (पर्यायी)
              </label>
              <div className="border-2 border-dashed border-[#E27730]/40 rounded-xl p-4 flex flex-col items-center justify-center bg-white/60 hover:bg-white transition-colors cursor-pointer text-center">
                <span className="material-symbols-outlined text-3xl text-[#E27730] mb-1">
                  add_a_photo
                </span>
                <span className="text-xs font-bold text-[#351000] marathi-text">फोटो अपलोड करण्यासाठी क्लिक करा</span>
                <span className="text-[10px] text-[#554336] marathi-text">JPG, PNG (कमाल ५ MB)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#351000] mb-1 marathi-text">
                बेपत्ता व्यक्तीचे पूर्ण नाव *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. सखाराम जगताप"
                className="w-full bg-white border border-[#E9D8A6] rounded-xl px-3 py-2.5 text-sm text-[#351000] marathi-text focus:outline-none focus:border-[#E27730]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#351000] mb-1 marathi-text">वय *</label>
                <input
                  type="number"
                  required
                  placeholder="उदा. ६५"
                  className="w-full bg-white border border-[#E9D8A6] rounded-xl px-3 py-2.5 text-sm text-[#351000] focus:outline-none focus:border-[#E27730]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#351000] mb-1 marathi-text">लिंग *</label>
                <select className="w-full bg-white border border-[#E9D8A6] rounded-xl px-3 py-2.5 text-sm text-[#351000] marathi-text focus:outline-none focus:border-[#E27730]">
                  <option>पुरुष</option>
                  <option>स्त्री</option>
                  <option>बालक / मुलगा</option>
                  <option>बालिका / मुलगी</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#351000] mb-1 marathi-text">
                शेवटचे पाहिलेले ठिकाण *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. दिवे घाट पायथा, सकाळी १०:००"
                className="w-full bg-white border border-[#E9D8A6] rounded-xl px-3 py-2.5 text-sm text-[#351000] marathi-text focus:outline-none focus:border-[#E27730]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#351000] mb-1 marathi-text">
                कपड्यांचा रंग / वैशिष्ट्ये
              </label>
              <textarea
                rows={2}
                placeholder="उदा. पांढरा सदरा, पांढरी टोपी, हातात पिशवी..."
                className="w-full bg-white border border-[#E9D8A6] rounded-xl px-3 py-2 text-sm text-[#351000] marathi-text focus:outline-none focus:border-[#E27730]"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#351000] mb-1 marathi-text">
                तुमचा मोबाईल नंबर (संपर्कासाठी) *
              </label>
              <input
                type="tel"
                required
                placeholder="९८७६५४३२१०"
                className="w-full bg-white border border-[#E9D8A6] rounded-xl px-3 py-2.5 text-sm text-[#351000] focus:outline-none focus:border-[#E27730]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-base py-3 rounded-xl shadow-md marathi-text flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <span className="material-symbols-outlined text-xl">send</span>
              तक्रार सबमिट करा
            </button>
          </form>
        )}
      </main>

      {/* Shared Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
