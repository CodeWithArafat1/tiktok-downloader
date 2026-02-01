import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Search, Loader2, Play, Pause, Music, Download, Image as ImageIcon, ExternalLink, User, Eye, Heart, MessageCircle, Youtube, Facebook, Instagram, Video } from 'lucide-react';


const BACKEND_URL = "http://localhost:5000";
// const BACKEND_URL = "https://tiktok-downloader-backend-jet.vercel.app";

const Hero = () => {
  const [activeTab, setActiveTab] = useState('tiktok');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  
  const [selectedFormat, setSelectedFormat] = useState('video'); 
  const [modalOpen, setModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  // --- Tabs Data (Brand Colors & linears) ---
  const tabs = [
      { 
        id: 'youtube', 
        label: 'YouTube', 
        icon: Youtube, 
        linear: 'from-red-600 to-rose-600', 
        shadow: 'shadow-red-500/40',
        hoverText: 'group-hover:text-red-500' 
      },
      { 
        id: 'facebook', 
        label: 'Facebook', 
        icon: Facebook, 
        linear: 'from-blue-700 to-blue-500', 
        shadow: 'shadow-blue-500/40',
        hoverText: 'group-hover:text-blue-500' 
      },
      { 
        id: 'instagram', 
        label: 'Instagram', 
        icon: Instagram, 
        linear: 'from-pink-600 to-purple-600', 
        shadow: 'shadow-pink-500/40',
        hoverText: 'group-hover:text-pink-500' 
      },
      { 
        id: 'tiktok', 
        label: 'TikTok', 
        icon: Video, 
        linear: 'from-cyan-500 to-blue-500', 
        shadow: 'shadow-cyan-500/40',
        hoverText: 'group-hover:text-cyan-400' 
      },
  ];

  // Helper Functions
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

 const handleSearch = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setData(null);
    setSelectedFormat('video');
    setIsPlaying(false);

    // ১. ভ্যালিডেশন চেক
    let isValid = true;
    if (activeTab === 'tiktok' && !url.includes('tiktok.com')) isValid = false;
    else if (activeTab === 'facebook' && (!url.includes('facebook.com') && !url.includes('fb.watch'))) isValid = false;
    else if (activeTab === 'youtube' && (!url.includes('youtube.com') && !url.includes('youtu.be'))) isValid = false;
    else if (activeTab === 'instagram' && !url.includes('instagram.com')) isValid = false; // 👈 ইনস্টাগ্রাম চেক

    if (!isValid) {
        setError(`Please enter a valid ${tabs.find(t => t.id === activeTab).label} link.`);
        setLoading(false);
        return;
    }

    try {
      // ২. সঠিক এন্ডপয়েন্ট সিলেক্ট করা (Fix Here)
      let endpoint = '';
      switch (activeTab) {
          case 'tiktok': 
              endpoint = '/api/tiktok/download'; 
              break;
          case 'facebook': 
              endpoint = '/api/facebook/download'; 
              break;
          case 'instagram': 
              endpoint = '/api/instagram/download'; 
              break;
          case 'youtube':
              endpoint = '/api/youtube/download';
              break;
          default: 
              endpoint = '/api/tiktok/download';
      }

     
      const res = await axios.get(`${BACKEND_URL}${endpoint}?url=${url}`);
      
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('ভিডিও পাওয়া যায়নি। লিংকটি চেক করুন বা কিছুক্ষণ পর চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    let targetUrl = '';
    let filename = '';
    const prefix = activeTab; 

    if (selectedFormat === 'video') {
        targetUrl = data.downloads.video;
        filename = `${prefix}_video_${data.id || Date.now()}.mp4`;
    } else if (selectedFormat === 'audio') {
        targetUrl = data.downloads.music;
        filename = `${prefix}_audio_${data.id || Date.now()}.mp3`;
    } else {
        targetUrl = data.downloads.thumbnail;
        filename = `${prefix}_cover_${data.id || Date.now()}.jpg`;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/tiktok/stream?url=${encodeURIComponent(targetUrl)}`);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      setModalOpen(false);
    } catch (err) {
      window.open(targetUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative pt-32 pb-20 overflow-hidden min-h-screen font-sans bg-[#0B0F19] text-white selection:bg-cyan-500/30">
      
      {/* 🔥 NEW BACKGROUND: Only 2 Blobs (Left Top & Right Bottom) 🔥 */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          {/* Blob 1: Purple/Pink (Top Left) */}
          <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-blob"></div>
          
          {/* Blob 2: Cyan/Blue (Bottom Right) */}
          <div className="absolute bottom-[-10%] right-[-10%] w-150 h-150 bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
        
        {/* Header Title */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-cyan-400 tracking-widest uppercase mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Universal Downloader
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-2xl">
            Download Content <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 animate-linear">
              Without Limits
            </span>
          </h1>
        </div>

        {/* 🔥 NEW BEAUTIFUL BUTTONS (Tabs) 🔥 */}
        <div className="flex flex-wrap justify-center gap-5 mb-16">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setData(null);
                            setError('');
                            setUrl('');
                        }}
                        className={`
                            group relative px-8 py-3.5 rounded-full font-bold transition-all duration-300
                            ${isActive 
                                ? 'text-white scale-110' 
                                : 'bg-[#1e293b]/40 text-gray-400 border border-white/5 hover:border-white/20 hover:bg-[#1e293b]/60'}
                        `}
                    >
                        {/* Active State Background & Glow */}
                        {isActive && (
                            <>
                                <div className={`absolute inset-0 rounded-full bg-linear-to-r ${tab.linear} blur-md opacity-60`}></div>
                                <div className={`absolute inset-0 rounded-full bg-linear-to-r ${tab.linear} shadow-lg ${tab.shadow}`}></div>
                            </>
                        )}

                        {/* Button Content */}
                        <div className="relative z-10 flex items-center gap-2.5">
                            <tab.icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-white' : tab.hoverText}`} />
                            <span className={`transition-colors duration-300 ${isActive ? 'text-white' : tab.hoverText}`}>
                                {tab.label}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-20 z-20">
            <div className={`relative group flex items-center bg-[#0F172A]/60 backdrop-blur-2xl rounded-2xl border p-2 shadow-2xl transition-all duration-500 focus-within:ring-2 focus-within:ring-cyan-500/50 focus-within:shadow-[0_0_40px_rgba(6,182,212,0.15)] ${error ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}>
                <div className="pl-4 text-gray-400 group-focus-within:text-cyan-400 transition-colors">
                    <Search className="w-6 h-6" />
                </div>
                <input 
                  type="text" 
                  placeholder={`Paste ${tabs.find(t => t.id === activeTab).label} link here...`} 
                  className="w-full bg-transparent text-white px-4 py-4 outline-none text-lg placeholder:text-gray-500 font-medium"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-cyan-500/25"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Search'}
                </button>
            </div>
            {error && (
                <div className="absolute -bottom-14 left-0 w-full text-center animate-in slide-in-from-top-2 fade-in">
                    <span className="inline-flex items-center gap-2 text-red-200 text-sm font-semibold bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 shadow-lg backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                        {error}
                    </span>
                </div>
            )}
        </div>

        {/* Result Section */}
        {data && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#1e293b]/40 backdrop-blur-3xl p-6 md:p-10 shadow-2xl grid md:grid-cols-12 gap-10 items-start text-left">
              
              {/* Card Inner Glow */}
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

              {/* Left Column: Player */}
              <div className="md:col-span-5 relative group">
                <div 
                  className="relative rounded-3xl overflow-hidden bg-black aspect-9/16 shadow-2xl border border-white/10 cursor-pointer group-hover:border-cyan-500/30 transition-colors"
                  onClick={togglePlay}
                >
                  <video 
                      ref={videoRef}
                      src={data.downloads.video} 
                      poster={data.cover}
                      className="w-full h-full object-contain"
                      playsInline
                      loop
                      onEnded={() => setIsPlaying(false)}
                  />
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100 bg-black/20' : 'bg-black/30'}`}>
                      <button className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-[0_0_30px_rgba(0,0,0,0.3)] group-hover:bg-cyan-500 group-hover:border-cyan-400">
                          {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                      </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Info & Actions */}
              <div className="md:col-span-7 flex flex-col h-full space-y-8">
                
                {/* Profile */}
                <div>
                  <a 
                    href={activeTab === 'tiktok' ? `https://www.tiktok.com/@${data.author?.unique_id}` : '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-4 group/profile bg-white/5 hover:bg-white/10 p-2.5 pr-6 rounded-full transition-all mb-6 border border-white/5 hover:border-cyan-500/30 backdrop-blur-sm"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-cyan-500 relative shrink-0 bg-gray-800 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <img 
                            src={data.author?.avatar} 
                            className="w-full h-full object-cover" 
                            alt="Avatar"
                            onError={handleImageError} 
                        />
                        <div className="absolute inset-0 hidden items-center justify-center text-gray-400"><User className="w-6 h-6" /></div>
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-lg leading-tight group-hover/profile:text-cyan-400 transition-colors">
                            @{data.author?.unique_id || 'Unknown'}
                        </h4>
                        <p className="text-sm text-gray-400 flex items-center gap-1 group-hover/profile:text-gray-300">View Profile <ExternalLink className="w-3 h-3" /></p>
                    </div>
                  </a>
                  
                  <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight line-clamp-2 drop-shadow-md">
                    {data.title || `${activeTab} Video`}
                  </h3>

                  {/* Stats Badges */}
                  <div className="flex flex-wrap gap-3 mt-6">
                      <div className="flex items-center gap-2 bg-[#0F172A]/50 px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md">
                        <Eye className="w-5 h-5 text-cyan-400" />
                        <span className="font-bold text-white">{formatNumber(data.stats?.plays || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-[#0F172A]/50 px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md">
                        <Heart className="w-5 h-5 text-pink-500" />
                        <span className="font-bold text-white">{formatNumber(data.stats?.likes || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-[#0F172A]/50 px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md">
                        <MessageCircle className="w-5 h-5 text-purple-500" />
                        <span className="font-bold text-white">{formatNumber(data.stats?.comments || 0)}</span>
                      </div>
                  </div>
                </div>

                {/* Selection Cards */}
                <div className="grid gap-4 mt-2">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider ml-1 mb-1">Select Format</p>
                    
                    <div 
                        onClick={() => setSelectedFormat('video')}
                        className={`cursor-pointer p-5 rounded-2xl border flex items-center justify-between transition-all group duration-300
                            ${selectedFormat === 'video' 
                                ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
                    >
                        <div className="flex items-center gap-5">
                            <div className={`p-3.5 rounded-xl ${selectedFormat === 'video' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' : 'bg-gray-800 text-gray-400'}`}>
                                <Play className="w-6 h-6 fill-current" />
                            </div>
                            <div>
                                <h4 className={`font-bold text-lg ${selectedFormat === 'video' ? 'text-cyan-400' : 'text-gray-200'}`}>Video</h4>
                                <p className="text-sm text-gray-500">MP4 • HD • No Watermark</p>
                            </div>
                        </div>
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${selectedFormat === 'video' ? 'border-cyan-500' : 'border-gray-600 group-hover:border-gray-500'}`}>
                            {selectedFormat === 'video' && <div className="w-3.5 h-3.5 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />}
                        </div>
                    </div>

                    <div 
                        onClick={() => setSelectedFormat('audio')}
                        className={`cursor-pointer p-5 rounded-2xl border flex items-center justify-between transition-all group duration-300
                            ${selectedFormat === 'audio' 
                                ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.1)]' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
                    >
                        <div className="flex items-center gap-5">
                            <div className={`p-3.5 rounded-xl ${selectedFormat === 'audio' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/40' : 'bg-gray-800 text-gray-400'}`}>
                                <Music className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className={`font-bold text-lg ${selectedFormat === 'audio' ? 'text-purple-400' : 'text-gray-200'}`}>Audio</h4>
                                <p className="text-sm text-gray-500">MP3 • Original Sound</p>
                            </div>
                        </div>
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${selectedFormat === 'audio' ? 'border-purple-500' : 'border-gray-600 group-hover:border-gray-500'}`}>
                            {selectedFormat === 'audio' && <div className="w-3.5 h-3.5 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />}
                        </div>
                    </div>
                </div>

                {/* Download Button */}
                <button 
                    onClick={() => setModalOpen(true)}
                    className="w-full bg-white text-black hover:bg-cyan-50 font-bold py-5 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 text-xl transition-transform hover:-translate-y-1 active:scale-95 mt-4"
                >
                    <Download className="w-7 h-7" />
                    Download Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all">
            <div className="bg-[#1e293b] border border-white/10 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-cyan-500 to-purple-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>
                <div className="text-center relative z-10">
                    <div className="w-24 h-24 bg-linear-to-br from-white/5 to-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
                        {selectedFormat === 'video' && <Play className="w-10 h-10 text-cyan-400 fill-current drop-shadow-glow" />}
                        {selectedFormat === 'audio' && <Music className="w-10 h-10 text-purple-400 drop-shadow-glow" />}
                        {selectedFormat === 'cover' && <ImageIcon className="w-10 h-10 text-pink-400 drop-shadow-glow" />}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ready to Save?</h3>
                    <p className="text-gray-400 text-sm mb-8">Downloading <strong>{selectedFormat.toUpperCase()}</strong> format.</p>
                    {downloading ? (
                        <button disabled className="w-full bg-white/5 border border-white/10 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 animate-pulse">
                            <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                        </button>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setModalOpen(false)} className="px-4 py-3.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white font-medium transition-colors">Cancel</button>
                            <button onClick={handleDownload} className="px-4 py-3.5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 hover:to-blue-600 text-white font-bold transition-all shadow-lg hover:shadow-cyan-500/25">Yes, Save</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Hero;