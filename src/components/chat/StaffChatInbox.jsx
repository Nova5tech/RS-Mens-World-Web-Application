import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  Users,
  CheckCheck,
  Paperclip,
  Send,
  Info,
  ExternalLink,
  MoreVertical,
  Calendar,
  Phone,
  MapPin,
  Tag,
  Activity,
  User,
  Plus,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useBranch } from '../../context/BranchContext.jsx';

export default function StaffChatInbox({ onNavigateToLeads }) {
  const { showToast } = useToast();
  const { activeBranchId } = useBranch();

  // Filter tabs: All (24), Open (8), Pending (3), Closed (13)
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [inputMessage, setInputMessage] = useState('');

  // Initial conversations matching screenshot exactly
  const initialConversations = [
    {
      id: 'conv-1',
      customerName: 'Rahul Kumar',
      avatar: 'RK',
      isImageAvatar: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      lastMessage: 'Do you have formal shirts?',
      time: '2m',
      unread: true,
      status: 'OPEN',
      channel: 'WhatsApp',
      branch: 'Branch 1',
      fullBranchName: 'Branch 1 (Anna Nagar)',
      phone: '+91 98765 43210',
      interests: ['Formal Shirts', 'Size L'],
      leadStatus: 'New',
      followUpDate: 'Nov 20, 2025',
      contextBullets: [
        'Enquired about formal shirts.',
        'Interested in size L.',
        'Confirmed availability at Anna Nagar.',
        'Ready for store follow-up.',
      ],
      messages: [
        {
          id: 'm1',
          sender: 'customer',
          text: 'Do you have formal shirts?',
          time: '10:20 AM',
        },
        {
          id: 'm2',
          sender: 'bot',
          text: 'Yes, we have a new formal shirt collection starting from ₹1,299. Would you like to see some options?',
          time: '10:22 AM',
          status: 'read',
        },
        {
          id: 'm3',
          sender: 'customer',
          text: 'Please share a few options in size L.',
          time: '10:23 AM',
        },
        {
          id: 'm4',
          sender: 'bot',
          text: 'Here are some formal shirts in size L. Let me know which one you like.',
          time: '10:25 AM',
          status: 'read',
          products: [
            {
              id: 'p1',
              title: 'Crisp White Oxford',
              image: 'https://images.unsplash.com/photo-1620012253295-c15c429f66bf?auto=format&fit=crop&w=300&q=80',
            },
            {
              id: 'p2',
              title: 'Sky Blue Chambray',
              image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80',
            },
            {
              id: 'p3',
              title: 'Midnight Navy Slim',
              image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=300&q=80',
            },
          ],
        },
        {
          id: 'm5',
          sender: 'customer',
          text: 'The blue one looks good. Is it available at your Anna Nagar store?',
          time: '10:27 AM',
        },
        {
          id: 'm6',
          sender: 'bot',
          text: 'Yes, it is in stock at our Anna Nagar branch. Would you like me to create a lead so our team can assist you further?',
          time: '10:28 AM',
          status: 'read',
        },
      ],
    },
    {
      id: 'conv-2',
      customerName: 'Priya Sharma',
      avatar: 'PS',
      lastMessage: 'What are the offers this week?',
      time: '5m',
      unread: true,
      status: 'OPEN',
      channel: 'Website Chat',
      branch: 'Branch 2',
      fullBranchName: 'Branch 2 (Rajahmundry)',
      phone: '+91 98451 22334',
      interests: ['Wedding Suits', 'Accessories'],
      leadStatus: 'Follow-up',
      followUpDate: 'Nov 22, 2025',
      contextBullets: [
        'Enquired about weekend promotional discounts.',
        'Interested in groom three-piece bespoke suits.',
        'Requested catalog download link.',
      ],
      messages: [
        {
          id: 'ps1',
          sender: 'customer',
          text: 'What are the offers this week?',
          time: '11:10 AM',
        },
        {
          id: 'ps2',
          sender: 'bot',
          text: 'We currently have a 15% promotional privilege on bespoke wedding suits and blazers across all store locations.',
          time: '11:12 AM',
          status: 'read',
        },
      ],
    },
    {
      id: 'conv-3',
      customerName: 'Arjun Reddy',
      avatar: 'AR',
      lastMessage: 'Available in size L?',
      time: '12m',
      unread: false,
      status: 'OPEN',
      channel: 'WhatsApp',
      branch: 'Branch 3',
      fullBranchName: 'Branch 3 (Vijayawada)',
      phone: '+91 97011 55667',
      interests: ['Linen Blazers'],
      leadStatus: 'Qualified',
      followUpDate: 'Nov 24, 2025',
      contextBullets: [
        'Checked size L stock for luxury beige linen blazer.',
        'Confirmed ready trial appointment for Sunday.',
      ],
      messages: [
        {
          id: 'ar1',
          sender: 'customer',
          text: 'Available in size L?',
          time: '11:00 AM',
        },
        {
          id: 'ar2',
          sender: 'bot',
          text: 'Yes! We have 4 pieces in stock at our Vijayawada MG Road boutique.',
          time: '11:02 AM',
          status: 'read',
        },
      ],
    },
    {
      id: 'conv-4',
      customerName: 'Vikram Singh',
      avatar: 'VS',
      isImageAvatar: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      lastMessage: 'Do you have a store near me?',
      time: '30m',
      unread: false,
      status: 'PENDING',
      channel: 'Instagram',
      branch: 'Branch 1',
      fullBranchName: 'Branch 1 (Anna Nagar)',
      phone: '+91 99887 66554',
      interests: ['Store Locator'],
      leadStatus: 'New',
      followUpDate: 'Nov 21, 2025',
      contextBullets: [
        'Customer asked for nearest store address in Chennai/AP.',
        'Sent location maps card and branch opening hours.',
      ],
      messages: [
        {
          id: 'vs1',
          sender: 'customer',
          text: 'Do you have a store near me?',
          time: '10:45 AM',
        },
        {
          id: 'vs2',
          sender: 'bot',
          text: 'Our flagship store is located at Main Road, Rajahmundry, with branches in Anna Nagar, Kakinada, and Vijayawada.',
          time: '10:46 AM',
          status: 'read',
        },
      ],
    },
    {
      id: 'conv-5',
      customerName: 'Neha Iyer',
      avatar: 'NI',
      lastMessage: 'Can I get the latest collection...',
      time: '46m',
      unread: false,
      status: 'CLOSED',
      channel: 'WhatsApp',
      branch: 'Branch 2',
      fullBranchName: 'Branch 2 (Kakinada)',
      phone: '+91 94432 11223',
      interests: ['Festive Kurta', 'Sherwani'],
      leadStatus: 'Converted',
      followUpDate: 'Completed',
      contextBullets: [
        'Shared latest Winter 2025 Lookbook PDF.',
        'Customer completed in-store purchase.',
      ],
      messages: [
        {
          id: 'ni1',
          sender: 'customer',
          text: 'Can I get the latest festive collection catalog?',
          time: '09:30 AM',
        },
        {
          id: 'ni2',
          sender: 'bot',
          text: 'Certainly! Here is our high-resolution lookbook link for 2025 Royal Menswear.',
          time: '09:32 AM',
          status: 'read',
        },
      ],
    },
    {
      id: 'conv-6',
      customerName: 'Karthik M',
      avatar: 'KM',
      lastMessage: 'What is the return policy?',
      time: '1h',
      unread: false,
      status: 'CLOSED',
      channel: 'Website Form',
      branch: 'Branch 4',
      fullBranchName: 'Branch 4 (Guntur)',
      phone: '+91 91234 56789',
      interests: ['Exchange Policy'],
      leadStatus: 'Closed',
      followUpDate: 'Completed',
      contextBullets: [
        'Clarified 14-day unworn exchange policy with original bill.',
        'Issue resolved satisfactorily.',
      ],
      messages: [
        {
          id: 'km1',
          sender: 'customer',
          text: 'What is the return policy?',
          time: '09:00 AM',
        },
        {
          id: 'km2',
          sender: 'bot',
          text: 'All readymade items can be exchanged within 14 days with the original store receipt. Altered or bespoke suits are trial-fitted to guarantee satisfaction.',
          time: '09:02 AM',
          status: 'read',
        },
      ],
    },
  ];

  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConvId, setSelectedConvId] = useState('conv-1');
  const messagesEndRef = useRef(null);

  const selectedConv =
    conversations.find(c => c.id === selectedConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv?.messages]);

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'OPEN' && conv.status !== 'OPEN') return false;
    if (activeTab === 'PENDING' && conv.status !== 'PENDING') return false;
    if (activeTab === 'CLOSED' && conv.status !== 'CLOSED') return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        conv.customerName.toLowerCase().includes(q) ||
        conv.lastMessage.toLowerCase().includes(q) ||
        conv.branch.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSendMessage = e => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: `user-${Date.now()}`,
      sender: 'bot',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === selectedConv.id) {
          return {
            ...c,
            lastMessage: newMsg.text,
            time: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setInputMessage('');
    showToast('Message sent to customer', 'success');
  };

  const handleCreateLead = () => {
    showToast(`Lead created for ${selectedConv.customerName} in ${selectedConv.fullBranchName}`, 'success');
    if (onNavigateToLeads) {
      setTimeout(() => onNavigateToLeads(), 1200);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-140px)] min-h-[660px] max-w-[1600px] mx-auto font-sans pb-4">
      {/* ======================================================== */}
      {/* COLUMN 1: Conversation List (~28% width / col-span-3 or 4) */}
      {/* ======================================================== */}
      <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col overflow-hidden">
        {/* Filter Tabs Header */}
        <div className="px-4 pt-3.5 border-b border-slate-100 flex items-center justify-between text-xs select-none">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`pb-3 font-bold transition-all relative ${
              activeTab === 'ALL'
                ? 'text-[#0f766e]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>All (24)</span>
            {activeTab === 'ALL' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f766e] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('OPEN')}
            className={`pb-3 font-semibold transition-all relative ${
              activeTab === 'OPEN'
                ? 'text-[#0f766e] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Open (8)</span>
            {activeTab === 'OPEN' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f766e] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('PENDING')}
            className={`pb-3 font-semibold transition-all relative ${
              activeTab === 'PENDING'
                ? 'text-[#0f766e] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Pending (3)</span>
            {activeTab === 'PENDING' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f766e] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('CLOSED')}
            className={`pb-3 font-semibold transition-all relative ${
              activeTab === 'CLOSED'
                ? 'text-[#0f766e] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Closed (13)</span>
            {activeTab === 'CLOSED' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f766e] rounded-full" />
            )}
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-3.5 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200/90 rounded-xl outline-none focus:border-[#0f766e] placeholder-slate-400 transition-colors shadow-2xs"
            />
          </div>
        </div>

        {/* Scrollable Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1.5 divide-y divide-slate-50">
          {filteredConversations.map(conv => {
            const isSelected = selectedConvId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#e6fbf1] shadow-2xs'
                    : 'hover:bg-slate-50/80'
                }`}
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  {conv.isImageAvatar ? (
                    <img
                      src={conv.avatarUrl}
                      alt={conv.customerName}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center font-bold text-xs shrink-0">
                      <User className="w-5 h-5 text-[#0f766e]" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                      {conv.customerName}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {conv.lastMessage}
                    </div>
                  </div>
                </div>

                {/* Right: Time & Unread Status Dot */}
                <div className="flex flex-col items-end shrink-0 gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {conv.time}
                  </span>
                  {conv.unread ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  ) : (
                    <span className="w-2.5 h-2.5" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* COLUMN 2: Active Chat Conversation (~48% width / col-span-5 or 6) */}
      {/* ======================================================== */}
      <div className="lg:col-span-5 xl:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col overflow-hidden">
        {/* Chat Header matching screenshot */}
        <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {selectedConv.isImageAvatar ? (
              <img
                src={selectedConv.avatarUrl}
                alt={selectedConv.customerName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center font-bold text-xs">
                {selectedConv.avatar}
              </div>
            )}
            <div>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                {selectedConv.customerName}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {selectedConv.channel} • {selectedConv.branch}
              </p>
            </div>
          </div>

          {/* Action Icons matching screenshot */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <button
              className="p-2 hover:bg-slate-100 rounded-lg hover:text-slate-700 transition-colors"
              title="Conversation Info"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              className="p-2 hover:bg-slate-100 rounded-lg hover:text-slate-700 transition-colors"
              title="Open External Chat"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              className="p-2 hover:bg-slate-100 rounded-lg hover:text-slate-700 transition-colors"
              title="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
          {selectedConv.messages.map(msg => {
            const isBot = msg.sender === 'bot';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBot ? 'items-end' : 'items-start'}`}
              >
                {/* Bubble */}
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] sm:max-w-[78%] text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? 'bg-[#dcfce7] text-slate-900 rounded-tr-xs shadow-2xs'
                      : 'bg-[#f1f5f9] text-slate-900 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {/* Product Carousel showcase (for message 4 in screenshot) */}
                  {msg.products && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {msg.products.map(prod => (
                        <div
                          key={prod.id}
                          className="rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-2xs group"
                        >
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-full h-24 sm:h-28 object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <p>{msg.text}</p>
                </div>

                {/* Timestamp & double checkmarks */}
                <div
                  className={`flex items-center gap-1 text-[11px] text-slate-400 mt-1 px-1 font-medium ${
                    isBot ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.time}</span>
                  {isBot && <CheckCheck className="w-3.5 h-3.5 text-[#10b981]" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar matching screenshot */}
        <div className="p-3.5 border-t border-slate-100 bg-white">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Attach File or Product"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#0f766e] text-slate-800 placeholder-slate-400 transition-all"
            />

            <button
              type="submit"
              className="w-10 h-10 rounded-xl bg-[#064e43] hover:bg-[#085a4e] active:bg-[#053e35] text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ======================================================== */}
      {/* COLUMN 3: Lead Details & Context (~24% width / col-span-3) */}
      {/* ======================================================== */}
      <div className="lg:col-span-3 xl:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header Row: Title & Create Lead Button */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Lead Details
            </h3>
            <button
              onClick={handleCreateLead}
              className="px-3 py-1.5 bg-[#0f766e] hover:bg-[#0d635c] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Lead</span>
            </button>
          </div>

          {/* Lead Information Fields matching reference screenshot */}
          <div className="space-y-4 py-4 text-xs">
            {/* Name */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <User className="w-4 h-4 text-slate-400" />
                <span>Name</span>
              </div>
              <span className="font-bold text-slate-900">{selectedConv.customerName}</span>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Phone</span>
              </div>
              <span className="font-bold text-slate-900">{selectedConv.phone}</span>
            </div>

            {/* Branch */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Branch</span>
              </div>
              <span className="font-bold text-slate-900">{selectedConv.fullBranchName}</span>
            </div>

            {/* Interest */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Tag className="w-4 h-4 text-slate-400" />
                <span>Interest</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {selectedConv.interests.map(item => (
                  <span
                    key={item}
                    className="px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#0f766e] font-bold text-[11px]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Lead Status Dropdown */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Activity className="w-4 h-4 text-slate-400" />
                <span>Lead Status</span>
              </div>
              <select
                defaultValue={selectedConv.leadStatus}
                className="py-1 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#0f766e] cursor-pointer shadow-2xs"
              >
                <option value="New">New</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
              </select>
            </div>

            {/* Follow-up Date */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Follow-up</span>
              </div>
              <div className="flex items-center gap-1.5 py-1 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedConv.followUpDate}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 my-2" />

          {/* Conversation Context Section matching screenshot */}
          <div className="pt-2">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-3">
              Conversation Context
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              {selectedConv.contextBullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
