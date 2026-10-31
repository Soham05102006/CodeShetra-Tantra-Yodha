import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  CheckCircle2,
  Phone,
  PhoneCall,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Search,
  FileText,
  Plus,
  ArrowUpDown,
  ExternalLink,
  Edit2,
  X,
  Sparkles,
  TrendingUp,
  Clock,
  DollarSign,
  Download,
  Check,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

export default function PartyDirectory({ onTriggerVoice }) {
  const [parties, setParties] = useState([]);
  const [summary, setSummary] = useState({
    total_entities: 142,
    customers_count: 88,
    suppliers_count: 54,
    verified_gstins: 138,
    gst_verified_rate: '97.1%',
    avg_payment_delay: '4.2 Days',
    historical_avg_delay: '6.1d',
    active_dialects_count: 4,
    active_dialects: 'Hindi, Marathi, Gujarati, Punjabi',
    avg_reliability_score: '88.4 / 100',
    promptness_change: '+4.2% overall payment promptness'
  });
  const [selectedPartyId, setSelectedPartyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [gstFilter, setGstFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('default');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [callToast, setCallToast] = useState(null);

  // Form State for Adding New Party
  const [newParty, setNewParty] = useState({
    entity_name: '',
    party_type: 'Supplier',
    phone_number: '',
    gstin: '',
    gstin_status: 'VERIFIED',
    legal_name: '',
    preferred_language: 'Hindi (Bundeli)',
    calling_window: '10:00 AM - 02:00 PM',
    credit_terms: '15 Days Credit',
    max_auto_approval_threshold: 50000
  });

  // Fetch parties from backend
  const fetchParties = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (typeFilter !== 'ALL') params.append('party_type', typeFilter);
      if (gstFilter !== 'ALL') params.append('gstin_status', gstFilter);
      if (sortBy !== 'default') params.append('sort_by', sortBy);

      const res = await fetch(`http://localhost:8000/api/parties?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const list = data.parties || [];
        setParties(list);
        if (data.summary) setSummary(data.summary);
        if (list.length > 0 && selectedPartyId === null) {
          setSelectedPartyId(list[0].party_id);
        }
      }
    } catch (e) {
      console.warn('Failed to load parties:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, [searchQuery, typeFilter, gstFilter, sortBy]);

  const selectedParty = parties.find((p) => p.party_id === selectedPartyId) || parties[0] || null;

  // Editable configuration state for selected party
  const [editConfig, setEditConfig] = useState({
    preferred_language: '',
    calling_window: '',
    max_auto_approval_threshold: 50000,
    credit_terms: ''
  });

  useEffect(() => {
    if (selectedParty) {
      setEditConfig({
        preferred_language: selectedParty.preferred_language || 'Hindi (Bundeli)',
        calling_window: selectedParty.calling_window || '10:00 AM - 02:00 PM',
        max_auto_approval_threshold: selectedParty.max_auto_approval_threshold || 50000,
        credit_terms: selectedParty.credit_terms || '15 Days Credit'
      });
    }
  }, [selectedParty]);

  // Handle saving party configuration
  const handleSaveConfig = async () => {
    if (!selectedParty) return;
    try {
      const res = await fetch(`http://localhost:8000/api/parties/${selectedParty.party_id}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editConfig)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
        fetchParties();
      }
    } catch (e) {
      console.error('Failed to update party config:', e);
    }
  };

  // Handle creating new party
  const handleCreateParty = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/parties/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newParty)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewParty({
          entity_name: '',
          party_type: 'Supplier',
          phone_number: '',
          gstin: '',
          gstin_status: 'VERIFIED',
          legal_name: '',
          preferred_language: 'Hindi (Bundeli)',
          calling_window: '10:00 AM - 02:00 PM',
          credit_terms: '15 Days Credit',
          max_auto_approval_threshold: 50000
        });
        fetchParties();
      }
    } catch (err) {
      console.error('Error creating party:', err);
    }
  };

  // Trigger vernacular call
  const handleTriggerPartyCall = async (party) => {
    if (!party) return;
    try {
      const res = await fetch(`http://localhost:8000/api/parties/${party.party_id}/trigger-call`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setCallToast(`Dispatched vernacular call to ${party.entity_name} in ${party.preferred_language}!`);
        setTimeout(() => setCallToast(null), 3500);
      }
    } catch (e) {
      console.warn('Call dispatch notice:', e);
      setCallToast(`Simulating call to ${party.entity_name} in ${party.preferred_language}...`);
      setTimeout(() => setCallToast(null), 3500);
    }
    if (onTriggerVoice) {
      onTriggerVoice({
        entity_name: party.entity_name,
        phone_number: party.phone_number,
        invoice_number: `CRM-${party.party_id}`,
        amount_due: party.total_invoiced || 45000
      });
    }
  };

  // Parse interaction history
  const getInteractionHistory = (party) => {
    if (!party || !party.interaction_history) return [];
    try {
      if (typeof party.interaction_history === 'string') {
        return JSON.parse(party.interaction_history);
      }
      return party.interaction_history;
    } catch (e) {
      return [party.interaction_history];
    }
  };

  // Format phone number with masking
  const maskPhone = (phone) => {
    if (!phone) return '+91 98XXX XXXXX';
    if (phone.length <= 6) return phone;
    const prefix = phone.slice(0, 7);
    return `${prefix} XXXXX`;
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-100">
      {/* Toast Notification */}
      {callToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#101726] border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-cyan-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <PhoneCall className="w-4 h-4 text-cyan-400" />
          <span>{callToast}</span>
        </div>
      )}

      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1a2335]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Dashboard</span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400">Party Directory</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight mt-1">
            Party Directory & Master CRM
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Party
          </button>
        </div>
      </div>

      {/* 2. TOP SUMMARY METRIC CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Entities */}
        <div className="relative overflow-hidden rounded-xl bg-[#0f1623]/80 border border-cyan-500/50 p-4 shadow-[0_0_20px_rgba(6,182,212,0.12)] ring-1 ring-cyan-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Entities</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              +8 this month
            </span>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{summary.total_entities}</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {summary.customers_count} Customers, {summary.suppliers_count} Suppliers
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 2: Verified GSTINs */}
        <div className="relative overflow-hidden rounded-xl bg-[#0f1623]/80 border border-slate-800/80 p-4 shadow-lg backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified GSTINs</span>
            <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{summary.verified_gstins}</span>
            <span className="text-emerald-400 text-lg">✓</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">
            {summary.gst_verified_rate} Verified against GST Portal
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 3: Avg Payment Delay */}
        <div className="relative overflow-hidden rounded-xl bg-[#0f1623]/80 border border-slate-800/80 p-4 shadow-lg backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Payment Delay</span>
            {/* Sparkline wave */}
            <svg className="w-14 h-6 text-emerald-400" viewBox="0 0 100 40" fill="none">
              <path
                d="M 0 35 Q 25 10 50 25 T 100 15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{summary.avg_payment_delay}</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            (historical avg: {summary.historical_avg_delay})
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 4: Active Dialects */}
        <div className="relative overflow-hidden rounded-xl bg-[#0f1623]/80 border border-slate-800/80 p-4 shadow-lg backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Dialects</span>
            <div className="p-1 rounded-full bg-indigo-500/10 text-indigo-400">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{summary.active_dialects_count}</div>
          <p className="text-[11px] text-indigo-300/80 font-medium mt-1 truncate">
            ({summary.active_dialects})
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* 3. TOOLBAR & FILTERS */}
      <div className="p-3.5 rounded-xl bg-[#0e1420]/90 border border-[#1a2335] flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Search Input */}
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Party Name, Phone, GSTIN, or City..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#121927] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Entity Type Dropdown */}
          <div className="flex items-center gap-1 bg-[#121927] border border-slate-800 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 font-medium text-[11px]">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Types</option>
              <option value="Supplier" className="bg-slate-900">Suppliers</option>
              <option value="Customer" className="bg-slate-900">Customers</option>
            </select>
          </div>

          {/* GST Status Dropdown */}
          <div className="flex items-center gap-1 bg-[#121927] border border-slate-800 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 font-medium text-[11px]">GST:</span>
            <select
              value={gstFilter}
              onChange={(e) => setGstFilter(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">GST Status</option>
              <option value="VERIFIED" className="bg-slate-900">Verified</option>
              <option value="PENDING" className="bg-slate-900">Pending</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1 bg-[#121927] border border-slate-800 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 font-medium text-[11px]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="default" className="bg-slate-900">Default</option>
              <option value="reliability" className="bg-slate-900">Reliability Score</option>
              <option value="delay" className="bg-slate-900">Payment Delay</option>
              <option value="invoiced" className="bg-slate-900">Total Invoiced</option>
              <option value="name" className="bg-slate-900">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. MAIN COCKPIT SECTION: SPLIT-VIEW (TABLE + PROFILE INSPECTOR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT 7-COLS: PARTY DIRECTORY TABLE */}
        <div className="lg:col-span-7 rounded-xl bg-[#0d131f]/90 border border-red-500/30 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                PARTY DIRECTORY
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {parties.length} Master Entities
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-2.5 px-3">Entity Name</th>
                  <th className="py-2.5 px-2">Type</th>
                  <th className="py-2.5 px-3">Phone Number</th>
                  <th className="py-2.5 px-3">Preferred Language</th>
                  <th className="py-2.5 px-2">GSTIN Status</th>
                  <th className="py-2.5 px-3 text-center">Reliability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {parties.map((party) => {
                  const isSelected = selectedParty && selectedParty.party_id === party.party_id;
                  const isSupplier = party.party_type === 'Supplier';
                  const isVerified = party.gstin_status === 'VERIFIED';
                  const score = party.reliability_score || 90;
                  const isHighReliability = score >= 85;

                  return (
                    <tr
                      key={party.party_id}
                      onClick={() => setSelectedPartyId(party.party_id)}
                      className={`cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-[#121a29] ring-1 ring-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Entity Name */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-white tracking-wide flex items-center gap-2">
                          <span>{party.entity_name}</span>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-2">
                        {isSupplier ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/30 text-blue-300 border border-blue-500/30">
                            Supplier
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600/30 text-purple-300 border border-purple-500/30">
                            Customer
                          </span>
                        )}
                      </td>

                      {/* Phone Number */}
                      <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                        {maskPhone(party.phone_number)}
                      </td>

                      {/* Preferred Language */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-200">
                          {party.preferred_language || 'Hindi (Bundeli)'}
                        </span>
                      </td>

                      {/* GSTIN Status */}
                      <td className="py-3 px-2 whitespace-nowrap">
                        {isVerified ? (
                          <span className="text-[11px] font-bold text-emerald-400 font-mono tracking-wider">
                            [VERIFIED]
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-400 font-mono tracking-wider">
                            [PENDING]
                          </span>
                        )}
                      </td>

                      {/* Reliability Score Circular Progress */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 font-bold font-mono">
                          {/* Radial Progress Ring SVG */}
                          <div className="relative w-6 h-6 shrink-0">
                            <svg className="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-slate-800"
                                strokeWidth="4"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className={isHighReliability ? 'text-emerald-400' : 'text-amber-400'}
                                strokeDasharray={`${score}, 100`}
                                strokeWidth="4"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                          </div>
                          <span className={isHighReliability ? 'text-emerald-400 text-xs' : 'text-amber-400 text-xs'}>
                            {score}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT 5-COLS: PARTY PROFILE INSPECTOR (Matching Screenshot) */}
        <div className="lg:col-span-5 rounded-xl bg-[#101625]/95 border border-slate-800 p-5 shadow-2xl backdrop-blur-md sticky top-6">
          {selectedParty ? (
            <div className="space-y-4">
              {/* Profile Top Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  PARTY PROFILE
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTriggerPartyCall(selectedParty)}
                    className="p-1 rounded hover:bg-slate-800 text-cyan-400 transition-colors"
                    title="Trigger Vernacular Voice Call"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Company Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-wide">
                    {selectedParty.entity_name}
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {selectedParty.legal_name || selectedParty.entity_name}
                  </div>
                </div>
              </div>

              {/* GSTIN Banner */}
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    VERIFIED GSTIN: {selectedParty.gstin || '27AABCS1429B1Z'}
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400/80 cursor-pointer hover:text-emerald-300" />
              </div>

              {/* Details Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#0b0f19] p-3 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-slate-400 text-[11px] block">Preferred Language</span>
                  <span className="font-semibold text-white">
                    {editConfig.preferred_language}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Avg. Delay</span>
                  <span className="font-semibold text-white">
                    {selectedParty.avg_payment_delay_days || 5.1} Days
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Total Invoiced</span>
                  <span className="font-bold text-cyan-300 font-mono">
                    ₹{(selectedParty.total_invoiced || 342500).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Credit Terms</span>
                  <span className="font-semibold text-white">
                    {editConfig.credit_terms}
                  </span>
                </div>
              </div>

              {/* PAYMENT RISK GRAPH (Matching Screenshot) */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  <span>PAYMENT RISK GRAPH</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {selectedParty.risk_level || 'LOW'}
                  </span>
                </div>

                {/* Glowing Neon Gradient Area Wave */}
                <div className="h-20 w-full rounded-lg bg-gradient-to-b from-[#0e1b26] to-[#071018] border border-cyan-950 p-2 relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    {/* Area Fill */}
                    <path
                      d="M 0 65 Q 40 60 80 50 T 160 55 T 240 25 T 300 20 L 300 80 L 0 80 Z"
                      fill="url(#waveGradient)"
                    />
                    {/* Top Glowing Stroke */}
                    <path
                      d="M 0 65 Q 40 60 80 50 T 160 55 T 240 25 T 300 20"
                      stroke="#22d3ee"
                      strokeWidth="2.5"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>

              {/* AI INTERACTION HISTORY (ChromaDB Memory Timeline) */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    AI INTERACTION HISTORY
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">ChromaDB Sync</span>
                </div>

                <div className="bg-[#0b0f19] p-3 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                  {getInteractionHistory(selectedParty).map((historyItem, idx) => {
                    const isFirst = idx === 0;
                    return (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            isFirst ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-slate-600'
                          }`}
                        />
                        <span className="text-slate-300 leading-relaxed text-[11px]">
                          {historyItem}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Voice Agent Behavior Configuration Controls */}
              <div className="pt-2 border-t border-slate-800 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  AGENT BEHAVIOR PREFERENCES
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Speaking Dialect</label>
                    <select
                      value={editConfig.preferred_language}
                      onChange={(e) =>
                        setEditConfig({ ...editConfig, preferred_language: e.target.value })
                      }
                      className="w-full bg-[#0b0f19] border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Hindi (Bundeli)">Hindi (Bundeli)</option>
                      <option value="Hindi">Hindi (Standard)</option>
                      <option value="Hinglish">Hinglish</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Punjabi">Punjabi</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Calling Window</label>
                    <input
                      type="text"
                      value={editConfig.calling_window}
                      onChange={(e) =>
                        setEditConfig({ ...editConfig, calling_window: e.target.value })
                      }
                      className="w-full bg-[#0b0f19] border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleSaveConfig}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Saved Successfully!</span>
                      </>
                    ) : (
                      <span>Save Configuration</span>
                    )}
                  </button>
                  <button
                    onClick={() => handleTriggerPartyCall(selectedParty)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    Dial Call
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select an entity from the directory table to inspect profile.
            </div>
          )}
        </div>
      </div>

      {/* 5. ADD NEW PARTY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-[#0e1420] border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Add New Party / CRM Entity
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateParty} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Entity Business Name *</label>
                <input
                  type="text"
                  required
                  value={newParty.entity_name}
                  onChange={(e) => setNewParty({ ...newParty, entity_name: e.target.value })}
                  placeholder="e.g. Apex Engineering Works"
                  className="w-full bg-[#121927] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Party Category</label>
                  <select
                    value={newParty.party_type}
                    onChange={(e) => setNewParty({ ...newParty, party_type: e.target.value })}
                    className="w-full bg-[#121927] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Supplier">Supplier</option>
                    <option value="Customer">Customer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newParty.phone_number}
                    onChange={(e) => setNewParty({ ...newParty, phone_number: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-[#121927] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">GSTIN Number *</label>
                  <input
                    type="text"
                    required
                    value={newParty.gstin}
                    onChange={(e) => setNewParty({ ...newParty, gstin: e.target.value })}
                    placeholder="27AABCS1429B1Z"
                    className="w-full bg-[#121927] border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Preferred Dialect</label>
                  <select
                    value={newParty.preferred_language}
                    onChange={(e) => setNewParty({ ...newParty, preferred_language: e.target.value })}
                    className="w-full bg-[#121927] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Hindi (Bundeli)">Hindi (Bundeli)</option>
                    <option value="Hindi">Hindi (Standard)</option>
                    <option value="Hinglish">Hinglish</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Punjabi">Punjabi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Credit Window Terms</label>
                  <input
                    type="text"
                    value={newParty.credit_terms}
                    onChange={(e) => setNewParty({ ...newParty, credit_terms: e.target.value })}
                    placeholder="15 Days Credit"
                    className="w-full bg-[#121927] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Max Auto-Approval (₹)</label>
                  <input
                    type="number"
                    value={newParty.max_auto_approval_threshold}
                    onChange={(e) =>
                      setNewParty({
                        ...newParty,
                        max_auto_approval_threshold: parseFloat(e.target.value) || 50000
                      })
                    }
                    className="w-full bg-[#121927] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30"
                >
                  Save Party Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
