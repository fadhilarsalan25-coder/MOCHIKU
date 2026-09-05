import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bot,
  Send,
  X,
  Search,
  MapPin,
  Zap,
  Brain,
  Compass,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  Heart,
  MessageSquare,
  Flame,
  Coffee,
  HelpCircle,
} from 'lucide-react';
import { soundFX } from '../utils/audio';
import { ChatMessage, ChatModelMode, UserAccount, CartItem, FlavorId, ToppingId } from '../types';

interface GeminiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onAddToCart?: (item: CartItem) => void;
  onNavigateToMap?: () => void;
}

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAddToCart,
  onNavigateToMap,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'sommelier'>('chat');
  const [selectedMode, setSelectedMode] = useState<ChatModelMode>('general');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sommelier state
  const [sommelierMood, setSommelierMood] = useState('Lagi butuh mood booster & manis segar');
  const [sommelierOccasion, setSommelierOccasion] = useState('Ngemil santai sore hari');
  const [sommelierSweet, setSommelierSweet] = useState('Manis pas');
  const [sommelierLoading, setSommelierLoading] = useState(false);
  const [sommelierResult, setSommelierResult] = useState<any | null>(null);

  // Chat message history
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initialName = currentUser ? currentUser.name.split(' ')[0] : 'Sahabat Mochiku';
    return [
      {
        id: 'msg-init',
        role: 'model',
        content: `Konnichiwa, ${initialName}! 🌸✨ Aku **Mochiku-chan**, asisten AI cerdas & sommelier mochi resmi MOCHIKU.\n\nAda yang bisa kubantu hari ini? Kamu bisa:\n- ⚡ **Tanya Cepat**: info menu, ketahanan daifuku, atau kalori.\n- 🔍 **Google Search Grounding**: cari tren daifuku viral terbaru di Jepang.\n- 🗺️ **Google Maps Grounding**: cek rute & lokasi outlet MOCHIKU terdekat.\n- 🍡 **AI Sommelier**: racik mochi sesuai suasana hatimu!`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash',
        mode: 'general',
      },
    ];
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Handle sending a chat message
  const handleSendMessage = async (textToSend?: string, modeOverride?: ChatModelMode) => {
    const prompt = (textToSend || inputMessage).trim();
    if (!prompt || isLoading) return;

    soundFX.playPop(520);
    setInputMessage('');
    setErrorMessage(null);

    const activeMode = modeOverride || selectedMode;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      mode: activeMode,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Prepare payload for multi-turn chat
      const formattedMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Add user context to system instruction if available
      let customSystem = undefined;
      if (currentUser) {
        customSystem = `The user chatting is "${currentUser.name}", a valued member with ${currentUser.points} points and favorite flavor ${currentUser.favoriteFlavor || 'Strawberry Daifuku'}. Address them warmly!`;
      }

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedMessages,
          modelType: activeMode,
          systemInstruction: customSystem,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const data = await res.json();

      // Extract grounding sources if Google Search was active
      let groundingSources = undefined;
      let searchQueries = undefined;
      if (data.groundingMetadata?.groundingChunks) {
        const chunks = data.groundingMetadata.groundingChunks.filter((c: any) => c.web?.uri);
        groundingSources = chunks.map((c: any) => ({
          title: c.web.title || 'Sumber Web',
          url: c.web.uri,
        }));
        searchQueries = data.groundingMetadata.webSearchQueries;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.text || 'Gomen ne, coba tanyakan sekali lagi ya! 🌸',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || 'gemini-3.5-flash',
        mode: activeMode,
        groundingSources,
        searchQueries,
      };

      setMessages((prev) => [...prev, botMsg]);
      soundFX.playSuccess();
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Gagal terhubung ke Gemini API. Pastikan server aktif.');
      soundFX.playPop(300);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sommelier Generate
  const handleGenerateSommelier = async () => {
    soundFX.playPop(560);
    setSommelierLoading(true);
    setSommelierResult(null);

    try {
      const res = await fetch('/api/gemini/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: sommelierMood,
          occasion: sommelierOccasion,
          preference: sommelierSweet,
        }),
      });

      if (!res.ok) {
        throw new Error('Gagal meracik rekomendasi rasa.');
      }

      const data = await res.json();
      setSommelierResult(data);
      soundFX.playSuccess();
    } catch (err: any) {
      console.error('Sommelier error:', err);
      // Fallback recommendation
      setSommelierResult({
        recommendedFlavor: 'strawberry',
        flavorName: 'Signature Ichigo Daifuku Deluxe',
        toppings: ['Matcha Dust', 'Edible Gold'],
        sweetLevel: 75,
        explanation: 'Kombinasi stroberi segar asam manis dengan balutan pasta kacang merah halus dan taburan matcha bubuk asli Jepang akan langsung membangkitkan senyum dan energimu!',
      });
    } finally {
      setSommelierLoading(false);
    }
  };

  const handleAddSommelierToCart = () => {
    if (!sommelierResult || !onAddToCart) return;

    let flavorId: FlavorId = 'strawberry';
    if (['matcha', 'strawberry', 'mango', 'oreo', 'chocolate'].includes(sommelierResult.recommendedFlavor)) {
      flavorId = sommelierResult.recommendedFlavor as FlavorId;
    }

    const newItem: CartItem = {
      id: `ai-mochi-${Date.now()}`,
      flavorId,
      toppingId: 'marshmallow',
      quantity: 1,
      unitPrice: 5000,
      customNote: `AI Racikan: ${sommelierResult.flavorName}`,
      bundleTitle: `Mochiku AI Chef Special: ${sommelierResult.flavorName}`,
    };

    onAddToCart(newItem);
    soundFX.playSuccess();
    onClose();
  };

  const QUICK_PROMPTS = [
    { label: '🔥 Menu Mochi Terlaris', prompt: 'Apa saja menu mochi paling best-seller di MOCHIKU dan apa keistimewaannya?', mode: 'fast' as ChatModelMode },
    { label: '🔍 Tren Daifuku Viral Jepang', prompt: 'Carikan info dan tren resep daifuku viral terbaru di Tokyo Jepang tahun ini.', mode: 'search' as ChatModelMode },
    { label: '🗺️ Rute & Outlet Jakarta Terdekat', prompt: 'Di mana saja alamat outlet MOCHIKU di Jakarta (Senopati, GI, PIK) dan bagaimana rute ke sana?', mode: 'maps' as ChatModelMode },
    { label: '❄️ Tips Simpan Mochi Awet', prompt: 'Bagaimana cara menyimpan daifuku fresh agar kulitnya tetap lembut dan tidak mengeras?', mode: 'fast' as ChatModelMode },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-2xl bg-[#FFFDF9] rounded-3xl shadow-2xl border border-[#FCE7F3] overflow-hidden flex flex-col h-[90vh] max-h-[720px]"
      >
        {/* MODAL HEADER */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-[#FFF0F5] via-[#FFF5EA] to-[#FFE4EC] border-b border-[#FCE7F3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF85A2] to-[#F472B6] flex items-center justify-center text-xl shadow-md">
              <span>🍡</span>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-fredoka font-bold text-lg text-[#5C3D2E] flex items-center gap-1">
                  Mochiku AI Concierge
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DB2777] text-white">
                  Gemini
                </span>
              </div>
              <p className="text-[11px] text-[#8C5D43]">
                Asisten Cerdas, Google Search & Maps Grounding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="hidden xs:flex items-center p-1 bg-white/80 rounded-xl border border-[#FBCFE8] text-xs font-fredoka font-semibold text-[#8C5D43]">
              <button
                onClick={() => {
                  soundFX.playPop(480);
                  setActiveTab('chat');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-[#FF85A2] text-white shadow-xs'
                    : 'hover:text-[#5C3D2E]'
                }`}
              >
                Chat Multi-Turn
              </button>
              <button
                onClick={() => {
                  soundFX.playPop(480);
                  setActiveTab('sommelier');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'sommelier'
                    ? 'bg-[#FF85A2] text-white shadow-xs'
                    : 'hover:text-[#5C3D2E]'
                }`}
              >
                <span>AI Sommelier</span>
                <Sparkles className="w-3 h-3 text-amber-300" />
              </button>
            </div>

            <button
              onClick={() => {
                soundFX.playPop(400);
                onClose();
              }}
              className="p-2 rounded-full hover:bg-white text-[#8C5D43] transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MOBILE SUB-TABS */}
        <div className="flex xs:hidden border-b border-[#FCE7F3] bg-white text-xs font-fredoka font-semibold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 text-center border-b-2 transition-all ${
              activeTab === 'chat'
                ? 'border-[#FF85A2] text-[#DB2777] bg-[#FFF0F5]'
                : 'border-transparent text-[#8C5D43]'
            }`}
          >
            Chat Multi-Turn
          </button>
          <button
            onClick={() => setActiveTab('sommelier')}
            className={`flex-1 py-2 text-center border-b-2 transition-all ${
              activeTab === 'sommelier'
                ? 'border-[#FF85A2] text-[#DB2777] bg-[#FFF0F5]'
                : 'border-transparent text-[#8C5D43]'
            }`}
          >
            ✨ AI Taste Sommelier
          </button>
        </div>

        {/* TAB 1: MULTI-TURN CHAT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* INTELLIGENCE MODE SELECTOR BAR */}
            <div className="px-4 py-2 bg-[#FFFDF9] border-b border-[#F0E6DF] flex items-center justify-between gap-2 overflow-x-auto shrink-0">
              <span className="text-[11px] font-bold text-[#8C5D43] uppercase tracking-wider shrink-0">
                Mode AI:
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playPop(450);
                    setSelectedMode('fast');
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                    selectedMode === 'fast'
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : 'bg-[#FFF5EA] text-[#8C5D43] hover:bg-[#FFE8EE]'
                  }`}
                  title="Menggunakan gemini-3.1-flash-lite untuk respon super cepat"
                >
                  <Zap className="w-3 h-3" />
                  <span>Cepat (Flash Lite)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playPop(450);
                    setSelectedMode('general');
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                    selectedMode === 'general'
                      ? 'bg-[#FF85A2] text-white shadow-xs font-bold'
                      : 'bg-[#FFF5EA] text-[#8C5D43] hover:bg-[#FFE8EE]'
                  }`}
                  title="Menggunakan gemini-3.5-flash untuk tugas umum"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Standar (3.5 Flash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playPop(450);
                    setSelectedMode('search');
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                    selectedMode === 'search'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                  title="Menggunakan gemini-3.5-flash dengan googleSearch tool untuk info web terverifikasi"
                >
                  <Search className="w-3 h-3" />
                  <span>Google Search</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playPop(450);
                    setSelectedMode('maps');
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                    selectedMode === 'maps'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                  title="Menggunakan gemini-3.5-flash dengan googleMaps tool untuk info lokasi & outlet"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Google Maps</span>
                </button>
              </div>
            </div>

            {/* MESSAGES THREAD */}
            <div
              ref={chatContainerRef}
              className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-[#FFFDF9] to-[#FFF9F5]"
            >
              {messages.map((msg) => {
                const isBot = msg.role === 'model';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    {isBot && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF85A2] to-[#F472B6] flex items-center justify-center text-sm shadow-xs shrink-0 mt-0.5">
                        <span>🍡</span>
                      </div>
                    )}

                    <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5`}>
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isBot
                            ? 'bg-white text-[#5C3D2E] border border-[#F5DEB3]/60 rounded-tl-xs'
                            : 'bg-gradient-to-r from-[#FF85A2] to-[#F472B6] text-white rounded-tr-xs'
                        }`}
                      >
                        {/* Message content formatted */}
                        <div className="whitespace-pre-wrap font-sans">
                          {msg.content}
                        </div>

                        {/* Google Search Grounding Sources Cards */}
                        {msg.groundingSources && msg.groundingSources.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600">
                              <Search className="w-3 h-3" />
                              <span>Sumber Terverifikasi Google Search:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.groundingSources.slice(0, 4).map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-semibold transition-colors border border-blue-100"
                                >
                                  <span className="truncate max-w-[140px]">{source.title}</span>
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Search Queries badge */}
                        {msg.searchQueries && msg.searchQueries.length > 0 && (
                          <div className="mt-2 text-[10px] text-slate-500 flex flex-wrap items-center gap-1">
                            <span className="font-semibold">Kueri pencarian:</span>
                            {msg.searchQueries.map((q, qIdx) => (
                              <span key={qIdx} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                "{q}"
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Meta footer: timestamp & model tag */}
                      <div
                        className={`flex items-center gap-2 text-[10px] text-[#A8A29E] px-1 ${
                          isBot ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {isBot && msg.modelUsed && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#FFF0F5] text-[#DB2777] font-semibold">
                            {msg.mode === 'search' ? '🔍 Search Grounding' : msg.mode === 'maps' ? '🗺️ Maps Grounding' : msg.modelUsed}
                          </span>
                        )}
                      </div>
                    </div>

                    {!isBot && (
                      <div className="w-8 h-8 rounded-full bg-[#FFF0F5] border border-[#FBCFE8] flex items-center justify-center text-sm shadow-xs shrink-0 mt-0.5">
                        {currentUser?.avatarEmoji || '👤'}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-[#8C5D43]">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF85A2] to-[#F472B6] flex items-center justify-center text-xs animate-bounce">
                    🍡
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-[#F5DEB3]/60 flex items-center gap-2 shadow-xs">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#FF85A2] animate-ping" />
                    <span className="font-fredoka text-xs text-[#5C3D2E]">
                      {selectedMode === 'search'
                        ? 'Menelusuri web dengan Google Search...'
                        : selectedMode === 'maps'
                        ? 'Memeriksa lokasi & rute Google Maps...'
                        : 'Mochiku-chan sedang mengetik...'}
                    </span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <div className="flex-1">
                    <p className="font-semibold">{errorMessage}</p>
                    <p className="text-[11px] text-rose-600 mt-1">
                      Tips: Pastikan GEMINI_API_KEY sudah terpasang di Settings &gt; Secrets.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* QUICK SUGGESTION CHIPS */}
            <div className="px-4 py-2 bg-[#FFFDF9] border-t border-[#F0E6DF] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider shrink-0">
                Pintasan:
              </span>
              {QUICK_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedMode(item.mode);
                    handleSendMessage(item.prompt, item.mode);
                  }}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-[#FFF0F5] border border-[#FBCFE8] text-[11px] font-fredoka font-semibold text-[#8C5D43] hover:text-[#DB2777] shadow-2xs transition-all active:scale-95 whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* CHAT INPUT FORM */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 sm:p-4 bg-white border-t border-[#FCE7F3] flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  selectedMode === 'search'
                    ? 'Tanya resep / tren terkini dengan Google Search...'
                    : selectedMode === 'maps'
                    ? 'Tanya rute ke outlet MOCHIKU terdekat...'
                    : 'Tanya apa saja seputar mochi & toko...'
                }
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FFFDF9] border border-[#F0E6DF] focus:border-[#FF85A2] focus:ring-2 focus:ring-[#FF85A2]/20 text-xs sm:text-sm text-[#5C3D2E] placeholder-[#B5A69F] outline-hidden transition-all"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#FF85A2] to-[#F472B6] hover:from-[#F472B6] hover:to-[#DB2777] text-white font-fredoka font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </form>

          </div>
        )}

        {/* TAB 2: AI TASTE SOMMELIER */}
        {activeTab === 'sommelier' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-[#FFFDF9] to-[#FFF5EA]">
            
            {/* HERO PROMO */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-[#FFF0F5] to-[#FFE4EC] border border-[#FBCFE8] flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-2xl shrink-0">
                ✨
              </div>
              <div>
                <h4 className="font-fredoka font-bold text-sm sm:text-base text-[#5C3D2E]">
                  AI Mochi Sommelier & Mood Matcher
                </h4>
                <p className="text-xs text-[#8C5D43] leading-relaxed">
                  Ceritakan suasana hatimu saat ini, dan Gemini Intelligence akan meracik kombinasi Daifuku paling harmonis untukmu!
                </p>
              </div>
            </div>

            {/* PREFERENCE SELECTORS */}
            <div className="space-y-4">
              {/* Mood selector */}
              <div>
                <label className="block text-xs font-bold text-[#5C3D2E] mb-1.5">
                  1. Bagaimana Suasana Hatimu Saat Ini? (Mood)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: '🌈 Butuh Mood Booster', val: 'Lagi butuh mood booster & manis segar' },
                    { label: '🍵 Butuh Ketenangan (Zen)', val: 'Lagi ingin santai tenang, rileks dengan aroma teh pekat' },
                    { label: '🍫 Manja & Craving Cokelat', val: 'Lagi craving cokelat pekat lumer dan creamy' },
                    { label: '🥭 Segar & Tropis', val: 'Lagi gerah pengen buah mangga tropis juicy manis asam' },
                    { label: '🍪 Cheerful & Crunchy', val: 'Lagi ceria pengen yang renyah berpadu lembut' },
                    { label: '👑 Mewah Spesial', val: 'Lagi ingin memanjakan diri dengan dessert premium' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        soundFX.playPop(480);
                        setSommelierMood(item.val);
                      }}
                      className={`p-2.5 rounded-2xl text-left text-xs font-fredoka font-semibold transition-all cursor-pointer border ${
                        sommelierMood === item.val
                          ? 'bg-[#FF85A2] text-white border-[#FF85A2] shadow-sm'
                          : 'bg-white text-[#5C3D2E] border-[#F0E6DF] hover:bg-[#FFF0F5]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion selector */}
              <div>
                <label className="block text-xs font-bold text-[#5C3D2E] mb-1.5">
                  2. Momen / Waktu Menikmati
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'Ngemil santai sore hari',
                    'Hadiah manis untuk orang terkasih',
                    'Teman nugas / kerja fokus',
                  ].map((occ, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        soundFX.playPop(480);
                        setSommelierOccasion(occ);
                      }}
                      className={`p-2 rounded-2xl text-center text-xs font-medium transition-all cursor-pointer border ${
                        sommelierOccasion === occ
                          ? 'bg-[#5C3D2E] text-white border-[#5C3D2E]'
                          : 'bg-white text-[#8C5D43] border-[#F0E6DF] hover:bg-[#FFF5EA]'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button
                type="button"
                onClick={handleGenerateSommelier}
                disabled={sommelierLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF85A2] via-[#F472B6] to-[#DB2777] hover:from-[#F472B6] hover:to-[#BE185D] text-white font-fredoka font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sommelierLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini sedang meracik resep terbaik...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Racikkan Mochi Sesuai Moodku Sekarang ✨</span>
                  </>
                )}
              </button>
            </div>

            {/* SOMMELIER RESULT CARD */}
            {sommelierResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-3xl bg-white border-2 border-[#F472B6] shadow-md space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0F5] text-[#DB2777] border border-[#FBCFE8]">
                      Rekomendasi Spesial AI
                    </span>
                    <h4 className="font-fredoka font-bold text-lg text-[#5C3D2E] mt-1">
                      {sommelierResult.flavorName || 'Mochi Custom Spesial'}
                    </h4>
                    <p className="text-xs text-[#8C5D43] mt-0.5">
                      Tingkat Manis: {sommelierResult.sweetLevel || 75}% • Rasa Utama: {sommelierResult.recommendedFlavor?.toUpperCase() || 'STRAWBERRY'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF0F5] flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {sommelierResult.recommendedFlavor === 'matcha'
                      ? '🍵'
                      : sommelierResult.recommendedFlavor === 'mango'
                      ? '🥭'
                      : sommelierResult.recommendedFlavor === 'oreo'
                      ? '🍪'
                      : sommelierResult.recommendedFlavor === 'chocolate'
                      ? '🍫'
                      : '🍓'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#F5DEB3]/60 text-xs text-[#5C3D2E] leading-relaxed italic">
                  "{sommelierResult.explanation}"
                </div>

                {sommelierResult.toppings && sommelierResult.toppings.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-[#8C5D43]">Topping Pelengkap yang Disarankan:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {sommelierResult.toppings.map((top: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-[#FFF5EA] text-[#8C5D43] font-fredoka font-semibold text-xs border border-[#F7D6C8]"
                        >
                          ✨ {top}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddSommelierToCart}
                    className="flex-1 py-2.5 rounded-2xl bg-[#5C3D2E] hover:bg-[#432C20] text-white font-fredoka font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Tambahkan ke Keranjang (Rp 5.000)</span>
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        )}

      </motion.div>
    </div>
  );
};
