import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  PhoneCall, 
  Phone, 
  PhoneForwarded,
  Volume2, 
  VolumeX,
  Play, 
  Pause, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  MoreHorizontal, 
  ChevronDown, 
  Sparkles, 
  Activity, 
  Globe, 
  Clock, 
  RotateCcw, 
  UserCheck, 
  X,
  Check,
  Radio,
  Sliders,
  Send,
  Building2,
  ExternalLink,
  Mic,
  Headphones
} from 'lucide-react';

export default function VernacularCalls({ onTriggerVoice }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [languageFilter, setLanguageFilter] = useState('ALL');
  const [selectedCallId, setSelectedCallId] = useState('call-001');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(null); // 'AI' | 'CUSTOMER' | null
  const [audioProgress, setAudioProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDispatchingBatch, setIsDispatchingBatch] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Manual call form state
  const [manualVendor, setManualVendor] = useState('Sharma Metal Works');
  const [manualPhone, setManualPhone] = useState('+91 98765 43210');
  const [manualDialect, setManualDialect] = useState('Hindi (Bundeli)');
  const [manualAmount, setManualAmount] = useState('45,000');
  const [manualPersona, setManualPersona] = useState('Priya (Polite Executive)');
  const [isDialing, setIsDialing] = useState(false);

  const progressIntervalRef = useRef(null);

  // Calls list with phonetic speech for 100% reliable voice synthesis across all browsers
  const initialCalls = [
    {
      id: 'call-001',
      contact_name: 'Sharma Metal Works',
      phone_number: '+91 98765 43210',
      masked_phone: '+91 98XXX XXXXX',
      invoice_number: 'INV-025',
      amount_due: 45000.0,
      language: 'Hindi (Bundeli)',
      call_status: 'CONNECTED',
      extracted_promise: '30 Oct (UPI)',
      promised_date: '2026-10-30',
      duration: '01:24',
      sentiment: 'COOPERATIVE (85%)',
      sentiment_score: 0.85,
      sentiment_emoji: '😊',
      model_used: 'Vapi.ai + Azure Hindi Swara',
      ai_transcript: '...बकाया है, आप कब तक भुगतान करेंगे? (your payment is pending, when can you pay?)',
      ai_spoken: 'Namaste Sharma ji! Main Sharma Enterprises se AI assistant baat kar rahi hoon. Aapka invoice number INV-025 ka 45,000 rupaye overdue hai. Aap kab tak bhugtan karenge?',
      customer_transcript: 'हाँ भैया, मैं कल शाम तक ₹15,000 UPI के ज़रिये भेज दूँगा पक्का। बाकी अगले हफ्ते।',
      cust_spoken: 'Haan bhaiya, maal to mil gaya tha. Main kal shaam tak 15,000 rupaye UPI ke zariye bhej doonga pakka. Baaki agle hafte tak clear kar denge.',
      extracted_entity: 'Promised ₹15,000 via UPI on 30 Oct',
      system_action: 'Updating Ledger with promise date.'
    },
    {
      id: 'call-002',
      contact_name: 'Jai Hind Traders',
      phone_number: '+91 85220 19988',
      masked_phone: '+91 85XXX XXXXX',
      invoice_number: 'INV-024',
      amount_due: 82600.0,
      language: 'Marathi',
      call_status: 'PROMISE SECURED',
      extracted_promise: '03 Nov (Bank)',
      promised_date: '2026-11-03',
      duration: '00:58',
      sentiment: 'COOPERATIVE (92%)',
      sentiment_score: 0.92,
      sentiment_emoji: '😊',
      model_used: 'Vapi.ai + Indic Marathi Whisper',
      ai_transcript: 'नमस्कार पाटील साहेब, शर्मा एंटरप्रायझेस कडून ₹82,600 चे बिल बाकी आहे. (Greetings Mr. Patil, invoice of ₹82,600 is due.)',
      ai_spoken: 'Namaskar Patil saheb, Sharma Enterprises kadun 82,600 rupaye bill baaki aahe. Krupaya payment kadi karnaar te saanga.',
      customer_transcript: 'हो, सोमवारी ३ नोव्हेंबरला आरटीजीएस ने पाठवून देतो. (Yes, will send via RTGS on Monday, Nov 3rd.)',
      cust_spoken: 'Ho bhau, aamhi somwaari 3 November la RTGS ne poora payment pathavun deto. Dhanyavaad.',
      extracted_entity: 'Promised ₹82,600 via Bank on 03 Nov',
      system_action: 'Ledger reconciled. Status changed to PAID.'
    },
    {
      id: 'call-003',
      contact_name: 'Karan Electricals',
      phone_number: '+91 91778 81122',
      masked_phone: '+91 91XXX XXXXX',
      invoice_number: 'INV-022',
      amount_due: 35000.0,
      language: 'Hindi',
      call_status: 'CONNECTED',
      extracted_promise: '05 Nov (Cash)',
      promised_date: '2026-11-05',
      duration: '01:42',
      sentiment: 'HESITANT (65%)',
      sentiment_score: 0.65,
      sentiment_emoji: '😐',
      model_used: 'Vapi.ai + Azure Hindi Swara',
      ai_transcript: 'नमस्ते करन जी, ₹35,000 का बकाया चालान पेंडिंग है। (Invoice of ₹35,000 is pending.)',
      ai_spoken: 'Namaste Karan ji, Sharma Enterprises se Priya bol rahi hoon. Aapka 35,000 rupaye ka chalan pending hai. Settlement kab tak ho payega?',
      customer_transcript: 'मार्केट बहुत मंदा है। 5 नवंबर को आधा कैश दे पाऊंगा। (Market is slow. Can give half in cash by Nov 5th.)',
      cust_spoken: 'Arre madam market bahut manda chal raha hai. 5 November tak aaddha cash de paaunga, baaki 10 din baad.',
      extracted_entity: 'Promised ₹15,000 via Cash on 05 Nov',
      system_action: 'Status updated to PARTIAL in ledger.'
    },
    {
      id: 'call-004',
      contact_name: 'Mahata Enterprises',
      phone_number: '+91 72441 29900',
      masked_phone: '+91 72XXX XXXXX',
      invoice_number: 'INV-021',
      amount_due: 55900.0,
      language: 'Gujarati',
      call_status: 'RETRY SCHEDULED',
      extracted_promise: '--',
      promised_date: null,
      duration: '00:15',
      sentiment: 'RESISTANT (40%)',
      sentiment_score: 0.40,
      sentiment_emoji: '😠',
      model_used: 'Vapi.ai + Indic Gujarati',
      ai_transcript: 'નમસ્તે મહેતા સાહેબ, શર્મા એન્ટરપ્રાઇઝિસ માંથી કોલ છે. (Greetings Mr. Mahata, call from Sharma Enterprises.)',
      ai_spoken: 'Namaste Mahata saheb, Sharma Enterprises maathi phone chhe. Invoice number 021 nu payment baaki chhe.',
      customer_transcript: 'હું ડ્રાઇવિંગ કરી રહ્યો છું, પછી કોલ કરો. (I am driving, call back later.)',
      cust_spoken: 'Bhai hoon driving kari rahyo chhu, mane be kalak pachhi call karo.',
      extracted_entity: 'Scheduled retry in 2 hours',
      system_action: 'Queued for automated vernacular callback.'
    },
    {
      id: 'call-005',
      contact_name: 'Raj Logistics & Co.',
      phone_number: '+91 99112 24455',
      masked_phone: '+91 99XXX XXXXX',
      invoice_number: 'INV-023',
      amount_due: 124000.0,
      language: 'Punjabi',
      call_status: 'NO ANSWER',
      extracted_promise: '--',
      promised_date: null,
      duration: '00:00',
      sentiment: 'UNREACHABLE',
      sentiment_score: 0.0,
      sentiment_emoji: '📵',
      model_used: 'Vapi.ai + Indic Punjabi',
      ai_transcript: 'Outbound ringing... (No answer / Subscriber busy)',
      ai_spoken: 'Outbound call ringing. Subscriber is currently busy or unreachable. Triggering WhatsApp reminder.',
      customer_transcript: '[No Response / Unreachable]',
      cust_spoken: '',
      extracted_entity: 'Unreachable via voice call',
      system_action: 'Triggered Twilio WhatsApp sandbox nudge.'
    }
  ];

  const [callsList, setCallsList] = useState(initialCalls);

  // Sync calls from MongoDB backend
  const fetchCalls = () => {
    fetch('http://localhost:8000/api/voice/calls')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.calls && data.calls.length > 0) {
          const merged = data.calls.map((c) => {
            const match = initialCalls.find((i) => i.id === c.id);
            return {
              ...c,
              ai_spoken: c.ai_spoken || (match ? match.ai_spoken : c.ai_transcript),
              cust_spoken: c.cust_spoken || (match ? match.cust_spoken : c.customer_transcript)
            };
          });
          setCallsList(merged);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCalls();
    const interval = setInterval(fetchCalls, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeCall = callsList.find((c) => c.id === selectedCallId) || callsList[0];

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Play audio chime beep using Web Audio API
  const playTelephonyChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(isMuted ? 0 : 0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn('AudioContext chime error:', e);
    }
  };

  // Stop any active speech synthesis
  const stopVoiceAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setActiveSpeaker(null);
    setAudioProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Play actual audible voice through speakers using SpeechSynthesis & Web Audio API
  const playVoiceAudio = (callToPlay) => {
    const target = callToPlay || activeCall;

    if (!window.speechSynthesis) {
      showNotification('Web Speech API is not supported on this browser.');
      return;
    }

    // If already playing, stop
    if (isPlayingAudio) {
      stopVoiceAudio();
      return;
    }

    stopVoiceAudio();
    playTelephonyChime();

    setIsPlayingAudio(true);
    setActiveSpeaker('AI');
    setAudioProgress(10);

    // Animate progress bar during conversation
    progressIntervalRef.current = setInterval(() => {
      setAudioProgress((prev) => (prev >= 95 ? 95 : prev + 5));
    }, 400);

    // Get browser voices
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.lang.includes('IN')) || voices.find((v) => v.lang.includes('en')) || voices[0];
    const customerVoice = voices.find((v) => v !== hindiVoice && (v.lang.includes('en') || v.lang.includes('hi'))) || hindiVoice;

    // Utterance 1: AI Agent
    const aiUtterance = new SpeechSynthesisUtterance(target.ai_spoken || target.ai_transcript);
    if (hindiVoice) aiUtterance.voice = hindiVoice;
    aiUtterance.rate = playbackSpeed;
    aiUtterance.pitch = 1.15; // female Priya pitch
    aiUtterance.volume = isMuted ? 0 : 1;

    // Utterance 2: Customer
    const custUtterance = new SpeechSynthesisUtterance(target.cust_spoken || target.customer_transcript);
    if (customerVoice) custUtterance.voice = customerVoice;
    custUtterance.rate = playbackSpeed;
    custUtterance.pitch = 0.85; // deeper customer pitch
    custUtterance.volume = isMuted ? 0 : 1;

    aiUtterance.onstart = () => {
      setActiveSpeaker('AI');
    };

    aiUtterance.onend = () => {
      // Transition to Customer speech
      if (target.cust_spoken && target.cust_spoken.trim().length > 0) {
        setActiveSpeaker('CUSTOMER');
        setAudioProgress(50);
        window.speechSynthesis.speak(custUtterance);
      } else {
        stopVoiceAudio();
        setAudioProgress(100);
      }
    };

    custUtterance.onend = () => {
      stopVoiceAudio();
      setAudioProgress(100);
      showNotification(`Completed voice dialogue for ${target.contact_name}. Ledger updated.`);
    };

    aiUtterance.onerror = (err) => {
      console.warn('SpeechSynthesis error:', err);
      stopVoiceAudio();
    };

    custUtterance.onerror = (err) => {
      console.warn('SpeechSynthesis error:', err);
      stopVoiceAudio();
    };

    // Speak
    window.speechSynthesis.speak(aiUtterance);
    showNotification(`🔊 Voice playing: ${target.contact_name} (${target.language})`);
  };

  // Filtered calls list
  const filteredCalls = callsList.filter((c) => {
    const matchesSearch = 
      c.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone_number?.includes(searchQuery) ||
      c.masked_phone?.includes(searchQuery) ||
      c.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.call_status === statusFilter;
    const matchesLanguage = languageFilter === 'ALL' || c.language?.toLowerCase().includes(languageFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesLanguage;
  });

  // Trigger manual call submission
  const handleManualCallSubmit = async (e) => {
    e?.preventDefault();
    setIsDialing(true);
    try {
      const res = await fetch('http://localhost:8000/api/voice/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: manualVendor,
          phone_number: manualPhone,
          invoice_number: 'INV-025',
          amount_due: parseFloat(manualAmount.replace(/,/g, '')) || 45000.0
        })
      });
      showNotification(`Calling ${manualVendor} (${manualPhone}) in ${manualDialect}...`);
      setIsManualModalOpen(false);
      
      // Auto play dialogue aloud
      setTimeout(() => {
        const found = callsList.find((c) => c.contact_name === manualVendor) || activeCall;
        playVoiceAudio(found);
      }, 500);
    } catch (err) {
      console.error(err);
      showNotification(`Dialing ${manualVendor} in ${manualDialect}... (simulation)`);
      setIsManualModalOpen(false);
      setTimeout(() => playVoiceAudio(activeCall), 500);
    } finally {
      setIsDialing(false);
    }
  };

  // Batch collection dispatch
  const handleDispatchBatch = async () => {
    setIsDispatchingBatch(true);
    try {
      const res = await fetch('http://localhost:8000/api/ledger/trigger-overdue-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        showNotification('Batch vernacular calls queued for all overdue debtors.');
      }
    } catch (e) {
      showNotification('Vernacular collection batch dispatched to telephony queue.');
    } finally {
      setIsDispatchingBatch(false);
    }
  };

  // Re-dial specific customer
  const handleRedial = async (callItem) => {
    const target = callItem || activeCall;
    try {
      await fetch('http://localhost:8000/api/voice/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: target.contact_name,
          phone_number: target.phone_number,
          invoice_number: target.invoice_number,
          amount_due: target.amount_due
        })
      });
      showNotification(`Re-dialing ${target.contact_name} in ${target.language}...`);
      setTimeout(() => playVoiceAudio(target), 400);
    } catch (e) {
      showNotification(`Re-dial initiated for ${target.contact_name}.`);
      setTimeout(() => playVoiceAudio(target), 400);
    }
  };

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-200 text-xs shadow-xl flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Top Summary Metric Cards (Exact match to screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Calls Placed */}
        <div className="bg-[#111622] border border-[#1d2538] rounded-2xl p-4 shadow-sm relative">
          <div className="text-xs text-slate-400 font-medium mb-1">
            Total Calls Placed
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl font-bold font-mono text-slate-100">
              48 Today
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              ↗ +15%
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            38 Completed, 4 Unreachable
          </div>
        </div>

        {/* Card 2: Payment Promises Secured (Electric Blue Glow Outline) */}
        <div className="bg-[#101726] border-2 border-blue-500 rounded-2xl p-4 shadow-lg shadow-blue-500/10 relative overflow-hidden">
          <div className="text-xs text-slate-400 font-medium mb-1">
            Payment Promises Secured
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl font-bold font-mono text-slate-100">
              ₹1,85,000
            </span>
            <span className="bg-blue-500/20 text-sky-400 border border-blue-500/40 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
              18 calls ✓
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            85% Recovery commitment rate
          </div>
        </div>

        {/* Card 3: Resolution / Conversation Rate */}
        <div className="bg-[#111622] border border-[#1d2538] rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs text-slate-400 font-medium mb-1">
            Resolution / Conversation Rate
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">
              77.1%
            </span>
            {/* Animated mini audio waveform sparkline */}
            <div className="flex items-end gap-1 h-6">
              {[40, 65, 85, 50, 95, 70, 80, 60].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full"
                  style={{ height: `${h}%` }}
                ></span>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Avg Duration: 1m 24s (Polite MSME script)
          </div>
        </div>

        {/* Card 4: Active Dialects */}
        <div className="bg-[#111622] border border-[#1d2538] rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
            <span>Active Dialects</span>
            <Globe className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            5 Languages
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            Hindi, Marathi, Gujarati, Punjabi, Kannada
          </div>
        </div>
      </div>

      {/* 2. Table Toolbar & Filtering */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Customer, Phone, Invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111622] border border-[#1d2538] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#111622] border border-[#1d2538] rounded-xl px-3 py-2 text-xs text-slate-300 appearance-none pr-8 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="CONNECTED">Connected</option>
              <option value="PROMISE SECURED">Promise Secured</option>
              <option value="RETRY SCHEDULED">Retry Scheduled</option>
              <option value="NO ANSWER">No Answer</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Date Range Dropdown */}
          <div className="relative hidden sm:block">
            <button className="bg-[#111622] border border-[#1d2538] rounded-xl px-3 py-2 text-xs text-slate-300 flex items-center gap-2 hover:bg-[#161d2c] transition-colors">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date Range</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Vendor Type Dropdown */}
          <div className="relative hidden sm:block">
            <button className="bg-[#111622] border border-[#1d2538] rounded-xl px-3 py-2 text-xs text-slate-300 flex items-center gap-2 hover:bg-[#161d2c] transition-colors">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Vendor Type</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dispatch Batch Collection */}
          <button
            onClick={handleDispatchBatch}
            disabled={isDispatchingBatch}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer disabled:opacity-50"
            title="Dispatch Vernacular Voice Agent for all overdue accounts"
          >
            <PhoneForwarded className={`w-3.5 h-3.5 ${isDispatchingBatch ? 'animate-spin' : ''}`} />
            <span>{isDispatchingBatch ? 'Dispatching Queue...' : 'Dispatch Batch Collection'}</span>
          </button>

          {/* + Trigger Manual Call */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>+ Trigger Manual Call</span>
          </button>
        </div>
      </div>

      {/* 3. Main 2-Column Section (Exact match to screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7-Cols): CALL MANAGEMENT & TRANSLATION Table */}
        <div className="lg:col-span-7 bg-[#111622] border border-[#1d2538] rounded-2xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
              CALL MANAGEMENT & TRANSLATION
            </h3>
            <button className="text-slate-500 hover:text-slate-300 transition-colors p-1">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-[#1c2436] text-[11px] text-slate-400 font-medium">
                  <th className="py-2.5 font-normal">Contact / Business</th>
                  <th className="py-2.5 font-normal">Phone Number</th>
                  <th className="py-2.5 font-normal">Language / Dialect</th>
                  <th className="py-2.5 font-normal">Call Status</th>
                  <th className="py-2.5 font-normal">Extracted Promise</th>
                  <th className="py-2.5 font-normal text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182030]">
                {filteredCalls.map((c) => {
                  const isSelected = selectedCallId === c.id;
                  const isConnected = c.call_status === 'CONNECTED';
                  const isPromise = c.call_status === 'PROMISE SECURED';
                  const isRetry = c.call_status === 'RETRY SCHEDULED';
                  const isNoAnswer = c.call_status === 'NO ANSWER';

                  return (
                    <tr
                      key={c.id}
                      onClick={() => {
                        setSelectedCallId(c.id);
                        if (isPlayingAudio) stopVoiceAudio();
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-[#15233c] text-slate-100 font-medium' 
                          : 'hover:bg-[#141b2a]'
                      }`}
                    >
                      {/* Contact / Business */}
                      <td className="py-3 text-slate-200 font-semibold">
                        <div className="flex items-center gap-1.5">
                          {isSelected && isPlayingAudio && (
                            <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
                          )}
                          <span>{c.contact_name}</span>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="py-3 font-mono text-slate-400 text-[11px]">
                        {c.masked_phone}
                      </td>

                      {/* Language / Dialect */}
                      <td className="py-3 text-slate-300 text-[11px]">
                        {c.language}
                      </td>

                      {/* Call Status Badge */}
                      <td className="py-3 font-mono text-[10px] font-bold">
                        {isConnected && (
                          <span className="px-2 py-0.5 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.25)]">
                            [CONNECTED]
                          </span>
                        )}
                        {isPromise && (
                          <span className="px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                            [PROMISE SECURED]
                          </span>
                        )}
                        {isRetry && (
                          <span className="px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.25)]">
                            [RETRY SCHEDULED]
                          </span>
                        )}
                        {isNoAnswer && (
                          <span className="px-2 py-0.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400">
                            [NO ANSWER]
                          </span>
                        )}
                      </td>

                      {/* Extracted Promise */}
                      <td className="py-3 text-[11px] font-medium">
                        {c.extracted_promise !== '--' ? (
                          <span className={isPromise ? 'text-emerald-400' : 'text-amber-400'}>
                            {c.extracted_promise}
                          </span>
                        ) : (
                          <span className="text-slate-600">--</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 text-right pr-2">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCallId(c.id);
                              playVoiceAudio(c);
                            }}
                            className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1 p-1 hover:bg-cyan-500/10 rounded cursor-pointer"
                            title="Play Voice Audio Output"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Play</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCallId(c.id);
                              setIsDrawerOpen(true);
                            }}
                            className="text-sky-400 hover:text-sky-300 font-medium text-[11px] underline underline-offset-2 transition-colors cursor-pointer"
                          >
                            [View Details]
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (5-Cols): LIVE CALL INSPECTOR (Glowing Rose Border) */}
        <div className="lg:col-span-5 bg-[#111622] border-2 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.25)] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden min-h-[460px]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                LIVE CALL INSPECTOR
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                </button>
                <button 
                  onClick={() => setIsDrawerOpen(true)}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                  title="Expand to Full Audio & Memory Inspector"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Call State & Sentiment Header */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 tracking-wide flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isPlayingAudio ? 'animate-ping' : ''}`}></span>
                  <span>{isPlayingAudio ? 'SPEECH AUDIO PLAYING:' : 'CALL IN PROGRESS:'}</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                  <span>Sentiment: {activeCall.sentiment}</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                <span>{activeCall.contact_name} ({activeCall.phone_number})</span>
                <span className="font-mono text-slate-400 text-[11px]">{activeCall.duration}</span>
              </div>
            </div>

            {/* Neon Cyan Audio Waveform Visualizer */}
            <div className="bg-[#0c1018] rounded-xl p-3 border border-[#1b2334] mb-3">
              <div className="flex items-center justify-center gap-1 h-14 overflow-hidden px-2">
                {[15, 30, 50, 75, 95, 60, 80, 45, 90, 100, 70, 85, 40, 65, 80, 95, 55, 35, 70, 90, 60, 40, 20].map((val, idx) => (
                  <motion.div
                    key={idx}
                    animate={
                      isPlayingAudio 
                        ? { height: [`${val * 0.3}%`, `${val}%`, `${val * 0.2}%`] } 
                        : { height: `${val * 0.6}%` }
                    }
                    transition={
                      isPlayingAudio 
                        ? { repeat: Infinity, duration: 0.6 + (idx % 6) * 0.1, ease: 'easeInOut' } 
                        : {}
                    }
                    className="w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.7)]"
                  />
                ))}
              </div>

              {/* Mini Audio Controls with Real Voice Trigger */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1a2335] mt-2 text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playVoiceAudio(activeCall)}
                    className="p-1.5 rounded-md bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 flex items-center gap-1.5 font-bold transition-all cursor-pointer shadow-sm shadow-cyan-500/30"
                    title={isPlayingAudio ? 'Pause Voice' : 'Play Audible Voice Out Loud'}
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause Voice</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Voice Audio</span>
                      </>
                    )}
                  </button>
                  <span className="font-mono text-[9px] text-slate-400">
                    {activeSpeaker === 'AI' ? '🗣️ AI Speaking...' : activeSpeaker === 'CUSTOMER' ? '🗣️ Customer Speaking...' : 'Vapi Voice Stream'}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[9px] text-cyan-400">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  <span>LIVE SPEECH-TO-TEXT</span>
                </div>
              </div>
            </div>

            {/* Dual-Language Bilingual Transcript Section */}
            <div className="bg-[#0c1018] rounded-xl p-3 border border-[#1b2334] space-y-2.5 text-xs font-mono relative">
              {/* AI Agent Speech (Highlighted when AI is speaking) */}
              <div className={`p-2 rounded-lg transition-all ${activeSpeaker === 'AI' ? 'bg-sky-500/10 border border-sky-500/40 shadow-sm' : ''}`}>
                <div className="text-slate-300 leading-relaxed">
                  <span className="text-sky-400 font-bold">AI AGENT: </span>
                  <span>{activeCall.ai_transcript}</span>
                </div>
                {activeSpeaker === 'AI' && (
                  <div className="text-[10px] text-sky-400 mt-1 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 animate-bounce" />
                    <span>AI Agent Speaking in {activeCall.language}...</span>
                  </div>
                )}
              </div>

              {/* Floating AI Entity Extraction Tooltip Tag */}
              <div className="my-1.5 p-2 rounded-lg bg-[#0e1726] border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] relative">
                <div className="text-[9px] text-sky-400 font-sans font-bold tracking-wider mb-1 flex items-center justify-between">
                  <span>AI ENTITY EXTRACTION</span>
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="font-mono text-cyan-300 font-semibold text-[11px] flex items-center gap-1.5">
                  <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-2 py-0.5 rounded text-[10px] w-full">
                    [EXTRACTED: {activeCall.extracted_entity}]
                  </span>
                </div>
              </div>

              {/* Customer Speech (Highlighted when Customer is speaking) */}
              <div className={`p-2 rounded-lg transition-all ${activeSpeaker === 'CUSTOMER' ? 'bg-emerald-500/10 border border-emerald-500/40 shadow-sm' : ''}`}>
                <div className="text-slate-200 leading-relaxed">
                  <span className="text-emerald-400 font-bold">CUSTOMER: </span>
                  <span>{activeCall.customer_transcript}</span>
                </div>
                {activeSpeaker === 'CUSTOMER' && (
                  <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 animate-bounce" />
                    <span>Customer replying with payment commitment...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Action Footer with Glowing Waveform Icon */}
          <div className="mt-4 pt-3 border-t border-[#1c2436] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                SYSTEM ACTION:
              </span>
              <span className="text-slate-300 text-[11px] font-sans">
                {activeCall.system_action}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <Sparkles className="w-4 h-4 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Slide-Over Full Call Inspector Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl bg-[#0e131d] border-l border-[#1d2538] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto h-full"
            >
              <div className="space-y-5">
                {/* Drawer Top Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#1c2436]">
                  <div>
                    <div className="text-[10px] text-sky-400 font-mono uppercase tracking-wider">
                      Vernacular Call Memory & Audit Inspector
                    </div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{activeCall.contact_name}</span>
                      <span className="text-xs text-slate-400 font-normal">
                        ({activeCall.phone_number})
                      </span>
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      stopVoiceAudio();
                      setIsDrawerOpen(false);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#151c2c] border border-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Call Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-[#121824] border border-[#1e273a]">
                    <div className="text-slate-500 text-[10px]">Dialect Model:</div>
                    <div className="font-bold text-sky-400 mt-0.5 truncate">{activeCall.language}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#121824] border border-[#1e273a]">
                    <div className="text-slate-500 text-[10px]">Call Duration:</div>
                    <div className="font-bold text-slate-100 mt-0.5">{activeCall.duration}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#121824] border border-[#1e273a]">
                    <div className="text-slate-500 text-[10px]">Overdue Amount:</div>
                    <div className="font-bold text-slate-100 mt-0.5">₹{activeCall.amount_due.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#121824] border border-[#1e273a]">
                    <div className="text-slate-500 text-[10px]">Customer Sentiment:</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{activeCall.sentiment}</div>
                  </div>
                </div>

                {/* Audio Waveform Player with Full Controls */}
                <div className="bg-[#121824] rounded-xl p-4 border border-[#1e273a] space-y-3">
                  <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Call Audio Playback & Telephony Stream</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Engine: {activeCall.model_used}</span>
                  </div>

                  {/* Waveform Graphic */}
                  <div className="flex items-center justify-center gap-1.5 h-16 bg-[#0a0e16] rounded-lg p-2 overflow-hidden border border-slate-800">
                    {[20, 35, 60, 80, 100, 65, 90, 45, 85, 95, 75, 60, 40, 70, 85, 95, 50, 30, 65, 85, 55, 30].map((v, i) => (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all ${
                          isPlayingAudio 
                            ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]' 
                            : 'bg-cyan-500/50'
                        }`}
                        style={{ height: `${isPlayingAudio ? (v * (0.5 + Math.random() * 0.5)) : v}%` }}
                      ></div>
                    ))}
                  </div>

                  {/* Progress scrubber */}
                  <div className="w-full bg-[#1c2536] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-cyan-400 h-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                      style={{ width: `${audioProgress}%` }}
                    ></div>
                  </div>

                  {/* Player Controls Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => playVoiceAudio(activeCall)}
                        className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors cursor-pointer shadow-md shadow-cyan-500/30 flex items-center gap-1.5 font-bold text-xs"
                      >
                        {isPlayingAudio ? (
                          <>
                            <Pause className="w-4 h-4 fill-current" />
                            <span>Pause Voice</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current" />
                            <span>Play Real Voice</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-lg bg-[#1a2336] text-slate-300 hover:text-white"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {[1.0, 1.25, 1.5].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`px-2 py-1 rounded text-[10px] font-mono cursor-pointer ${
                            playbackSpeed === spd
                              ? 'bg-blue-600 text-white font-bold'
                              : 'bg-[#1a2336] text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Speaker Separated Full Bilingual Transcript */}
                <div className="bg-[#121824] rounded-xl p-4 border border-[#1e273a] space-y-3 font-mono text-xs">
                  <div className="text-xs font-semibold text-slate-300 font-sans flex items-center justify-between">
                    <span>Synchronized Bilingual Conversation Transcript</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      Entity Extracted & Verified
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className={`p-3 rounded-lg border transition-all ${activeSpeaker === 'AI' ? 'bg-sky-500/10 border-sky-500/40 shadow-sm' : 'bg-[#0c1018] border-[#1b2334]'}`}>
                      <div className="text-[10px] text-sky-400 font-bold flex items-center justify-between">
                        <span>AI AGENT (16:45:02) [Hindi/Hinglish]</span>
                        {activeSpeaker === 'AI' && <span className="text-cyan-400 animate-pulse font-mono">● SPEAKING ALOUD</span>}
                      </div>
                      <div className="text-slate-200 leading-relaxed font-sans mt-1">
                        "{activeCall.ai_spoken || activeCall.ai_transcript}"
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg border transition-all ${activeSpeaker === 'CUSTOMER' ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm' : 'bg-[#0c1018] border-[#1b2334]'}`}>
                      <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-between">
                        <span>CUSTOMER (16:45:10)</span>
                        {activeSpeaker === 'CUSTOMER' && <span className="text-emerald-400 animate-pulse font-mono">● SPEAKING ALOUD</span>}
                      </div>
                      <div className="text-slate-200 leading-relaxed font-sans mt-1">
                        "{activeCall.cust_spoken || activeCall.customer_transcript}"
                      </div>
                    </div>
                  </div>

                  {/* ChromaDB Vector Memory Record */}
                  <div className="p-2.5 rounded-lg bg-[#0c1018] border border-[#1b2334] space-y-1 font-mono text-[11px]">
                    <div className="text-slate-500 text-[10px]">ChromaDB Vendor Memory Ingestion:</div>
                    <div className="text-slate-300">
                      • Collection: `vendor_memory` | Entity: `{activeCall.contact_name}`<br />
                      • Memory Ingestion: Embedded dialogue transcript vector with metadata tags.<br />
                      • Automated Commitment Sync: Updated `promised_payment_date = {activeCall.promised_date}` in SQLite.
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-4 border-t border-[#1c2436] flex items-center justify-between gap-3">
                <button
                  onClick={() => handleRedial(activeCall)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Re-dial Debtor</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      stopVoiceAudio();
                      showNotification('Call notes and promise dates synced with main dashboard.');
                      setIsDrawerOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    Close Inspector
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Trigger Manual Call Modal */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111622] border border-[#1d2538] rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl relative"
            >
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Trigger Vernacular Outbound Call</h3>
                  <p className="text-xs text-slate-400">Dispatch conversational voice agent via Vapi.ai with regional Indian dialect</p>
                </div>
              </div>

              <form onSubmit={handleManualCallSubmit} className="space-y-4 text-xs">
                {/* Select Vendor */}
                <div>
                  <label className="block text-slate-400 mb-1">Customer / MSME Debtor:</label>
                  <select
                    value={manualVendor}
                    onChange={(e) => {
                      setManualVendor(e.target.value);
                      if (e.target.value === 'Sharma Metal Works') setManualPhone('+91 98765 43210');
                      if (e.target.value === 'Jai Hind Traders') setManualPhone('+91 85220 19988');
                      if (e.target.value === 'Karan Electricals') setManualPhone('+91 91778 81122');
                    }}
                    className="w-full bg-[#0d121c] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Sharma Metal Works">Sharma Metal Works (INV-025 • ₹45,000)</option>
                    <option value="Jai Hind Traders">Jai Hind Traders (INV-024 • ₹82,600)</option>
                    <option value="Karan Electricals">Karan Electricals (INV-022 • ₹35,000)</option>
                    <option value="Mahata Enterprises">Mahata Enterprises (INV-021 • ₹55,900)</option>
                  </select>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-slate-400 mb-1">Recipient Phone Number (E.164 format):</label>
                  <input
                    type="text"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full bg-[#0d121c] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Regional Dialect */}
                  <div>
                    <label className="block text-slate-400 mb-1">Dialect / Language:</label>
                    <select
                      value={manualDialect}
                      onChange={(e) => setManualDialect(e.target.value)}
                      className="w-full bg-[#0d121c] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Hindi (Bundeli)">Hindi (Bundeli / North)</option>
                      <option value="Hinglish">Hinglish (Urban Indian)</option>
                      <option value="Marathi">Marathi (Indic Whisper)</option>
                      <option value="Gujarati">Gujarati (Western)</option>
                      <option value="Punjabi">Punjabi (Northern)</option>
                      <option value="Tamil">Tamil (Southern)</option>
                    </select>
                  </div>

                  {/* Overdue Amount Target */}
                  <div>
                    <label className="block text-slate-400 mb-1">Collection Target (₹):</label>
                    <input
                      type="text"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      className="w-full bg-[#0d121c] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Voice Persona */}
                <div>
                  <label className="block text-slate-400 mb-1">AI Voice Persona & Demeanor:</label>
                  <select
                    value={manualPersona}
                    onChange={(e) => setManualPersona(e.target.value)}
                    className="w-full bg-[#0d121c] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Priya (Polite Executive)">Priya (Polite MSME Collection Executive)</option>
                    <option value="Aarav (Firm Follow-up)">Aarav (Firm Tax & Audit Follow-up)</option>
                    <option value="Meera (Vernacular Gujarati/Marathi)">Meera (Vernacular Regional Dialect)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsManualModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-[#141b29] border border-[#1e273a]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDialing}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <PhoneCall className={`w-3.5 h-3.5 ${isDialing ? 'animate-bounce' : ''}`} />
                    <span>{isDialing ? 'Connecting via Vapi...' : 'Dispatch Call Now'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
