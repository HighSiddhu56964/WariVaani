"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { missingPersonService, CreateMissingPersonPayload } from "@/services/missingPerson";
import { UserRoundSearch, Search, Send, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function UserMissingPersonPage() {
  const router = useRouter();

  // Mode state: Report Form vs Ticket Search
  const [activeTab, setActiveTab] = useState<"REPORT" | "SEARCH">("REPORT");

  // Form fields
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [clothing, setClothing] = useState("");
  const [lastSeenLocation, setLastSeenLocation] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search field
  const [searchTicketId, setSearchTicketId] = useState("");

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!name || !age || !contact) {
      setError("कृपया सर्व आवश्यक माहिती भरा (Name, Age and Contact are required)");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: CreateMissingPersonPayload = {
        name,
        age: parseInt(age, 10),
        clothing,
        last_seen_location: lastSeenLocation,
        contact,
        description,
      };

      const result = await missingPersonService.reportMissingPerson(payload);
      
      // Navigate to ticket detail page
      router.push(`/app/ticket/${result.ticket_id}`);
    } catch (err) {
      console.error("Failed to report missing person:", err);
      setError("तक्रार नोंदवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTicketId.trim()) return;
    router.push(`/app/ticket/${searchTicketId.trim()}`);
  };

  return (
    <div className="space-y-6 select-none pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-secondary dark:text-white flex items-center gap-2">
          <UserRoundSearch className="h-5 w-5 text-blue-600" />
          <span>हरवलेले व्यक्ती नोंदणी (Missing Person Assistance)</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          नातेवाईक हरवल्यास माहिती द्या किंवा तक्रार स्थिती तपासा (Report or track missing persons)
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-blue-50/50 dark:bg-zinc-900 p-1.5 rounded-2xl border border-blue-100 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("REPORT")}
          className={`py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === "REPORT"
              ? "bg-blue-600 text-white shadow-md"
              : "text-muted-foreground hover:text-secondary"
          }`}
        >
          📝 नवीन नोंदणी (Report New)
        </button>

        <button
          onClick={() => setActiveTab("SEARCH")}
          className={`py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === "SEARCH"
              ? "bg-blue-600 text-white shadow-md"
              : "text-muted-foreground hover:text-secondary"
          }`}
        >
          🔍 स्थिती तपासा (Track Ticket)
        </button>
      </div>

      {activeTab === "REPORT" ? (
        /* Form Card */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 border-2 border-blue-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4"
        >
          <div className="border-b border-blue-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-black text-secondary dark:text-white">
              हरवलेल्या व्यक्तीची माहिती (Missing Person Details)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              ही माहिती प्रशासन व स्वयंसेवकांना लगेच पाठवली जाईल.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                हरवलेल्या व्यक्तीचे नाव / Name *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. सखाराम पाटील"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-blue-150 dark:border-zinc-800 bg-blue-50/20 dark:bg-zinc-800 text-xs font-bold text-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">
                  वय / Age *
                </label>
                <input
                  type="number"
                  required
                  placeholder="उदा. 65"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-blue-150 dark:border-zinc-800 bg-blue-50/20 dark:bg-zinc-800 text-xs font-bold text-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">
                  तुमचा फोन नंबर / Contact *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="उदा. 9876543210"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-blue-150 dark:border-zinc-800 bg-blue-50/20 dark:bg-zinc-800 text-xs font-bold text-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                कपड्यांचे वर्णन / Clothing Description
              </label>
              <input
                type="text"
                placeholder="उदा. पांढरा कुर्ता आणि नेहरू टोपी"
                value={clothing}
                onChange={(e) => setClothing(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-blue-150 dark:border-zinc-800 bg-blue-50/20 dark:bg-zinc-800 text-xs font-bold text-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                शेवटचे पाहिलेले ठिकाण / Last Seen Location
              </label>
              <input
                type="text"
                placeholder="उदा. हडपसर विसावा मंडप"
                value={lastSeenLocation}
                onChange={(e) => setLastSeenLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-blue-150 dark:border-zinc-800 bg-blue-50/20 dark:bg-zinc-800 text-xs font-bold text-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                अतिरिक्त माहिती / Additional Details
              </label>
              <textarea
                rows={2}
                placeholder="इतर कोणतीही महत्त्वाची माहिती..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-blue-150 dark:border-zinc-800 bg-blue-50/20 dark:bg-zinc-800 text-xs font-bold text-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
            >
              {isSubmitting ? (
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>तक्रार नोंदवा (Submit Report)</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      ) : (
        /* Ticket Search Card */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 border-2 border-blue-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4"
        >
          <div className="border-b border-blue-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-black text-secondary dark:text-white">
              तिकीट नंबरने शोधा (Search by Ticket ID)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              नोंदणी केल्यानंतर मिळालेला Ticket ID टाका (e.g. TICKET-101)
            </p>
          </div>

          <form onSubmit={handleSearchTicket} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                Ticket ID / तिकीट क्रमांक
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="TICKET-101"
                  value={searchTicketId}
                  onChange={(e) => setSearchTicketId(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-2xl border border-blue-150 dark:border-zinc-800 bg-blue-50/20 dark:bg-zinc-800 text-xs font-bold font-mono text-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
            >
              <span>स्थिती पहा (Track Status)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
