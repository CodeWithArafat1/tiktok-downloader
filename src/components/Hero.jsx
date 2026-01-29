import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Search, Loader2, Play, Pause, Music, Download, Image as ImageIcon, ExternalLink, User, Eye, Heart, MessageCircle } from 'lucide-react';

const Hero = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('video'); 
  const [modalOpen, setModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  // Helper: বড় সংখ্যা ফরম্যাট করার জন্য (যেমন: 1.2M)
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

    try {
      const res = await axios.get(`https://tiktok-downloader-backend-jet.vercel.app/api/tiktok/download?url=${url}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError('ভিডিও পাওয়া যায়নি। লিংকটি চেক করুন বা কিছুক্ষণ পর চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    let targetUrl = '';
    let filename = '';

    if (selectedFormat === 'video') {
        targetUrl = data.downloads.video;
        filename = `tiktok_video_${data.id}.mp4`;
    } else if (selectedFormat === 'audio') {
        targetUrl = data.downloads.music;
        filename = `tiktok_audio_${data.id}.mp3`;
    } else {
        targetUrl = data.downloads.thumbnail;
        filename = `tiktok_cover_${data.id}.jpg`;
    }

    try {
      const response = await fetch(`https://tiktok-downloader-backend-jet.vercel.app/api/tiktok/stream?url=${encodeURIComponent(targetUrl)}`);
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
    <div className="relative pt-32 pb-20 overflow-hidden min-h-screen font-sans">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-5xl mx-auto px-4 text-center">
        
        {/* Header */}
        <div className="mb-12 space-y-4">
          <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-cyan-400 tracking-wider uppercase">
            Fastest TikTok Downloader
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
            Save TikToks <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              Without Watermark
            </span>
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-16 z-20">
            <div className="relative flex items-center bg-[#1e293b]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-2 shadow-2xl shadow-cyan-500/10 transition-all focus-within:ring-2 focus-within:ring-cyan-500/50">
            <div className="pl-4 text-gray-400"><Search className="w-6 h-6" /></div>
            <input 
              type="text" 
              placeholder="Paste video link here..." 
              className="w-full bg-transparent text-white px-4 py-3 outline-none text-lg placeholder:text-gray-500 font-medium"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Search'}
            </button>
          </div>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl inline-block mb-8">
                {error}
            </div>
        )}

        {/* --- RESULT SECTION --- */}
        {data && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className="glass-card bg-[#0f172a]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl grid md:grid-cols-12 gap-8 items-start text-left relative overflow-hidden">
              
              {/* Background Glow inside card */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10" />

              {/* Left Column: Video Player */}
              <div className="md:col-span-5 relative group">
                <div 
                  className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] shadow-xl border border-white/5 cursor-pointer"
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
                      <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg group-hover:bg-cyan-500 group-hover:border-cyan-400">
                          {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                      </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Details & Actions */}
              <div className="md:col-span-7 flex flex-col h-full space-y-6">
                
                {/* User Profile & Title */}
                <div>
                  <a 
                    href={`https://www.tiktok.com/@${data.author.unique_id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-4 group/profile bg-white/5 hover:bg-white/10 p-2 pr-4 rounded-full transition-all mb-4 border border-white/5"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-500 relative flex-shrink-0 bg-gray-800">
                        <img 
                            src={data.author.avatar} 
                            className="w-full h-full object-cover" 
                            alt="Avatar"
                            onError={handleImageError} 
                        />
                        <div className="absolute inset-0 hidden items-center justify-center text-gray-400">
                            <User className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-base leading-tight group-hover/profile:text-cyan-400 transition-colors">
                            @{data.author.unique_id || data.author.nickname}
                        </h4>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            View Profile <ExternalLink className="w-3 h-3" />
                        </p>
                    </div>
                  </a>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-gray-100 leading-snug line-clamp-2">
                    {data.title || 'TikTok Video'}
                  </h3>

                  {/* --- NEW STATS SECTION (Gradient Text) --- */}
                  <div className="flex flex-wrap gap-4 mt-4">
                      {/* Views */}
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            {formatNumber(data.stats?.plays || 0)}
                        </span>
                        <span className="text-xs text-gray-500">Views</span>
                      </div>

                      {/* Likes */}
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        <Heart className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-500">
                            {formatNumber(data.stats?.likes || 0)}
                        </span>
                        <span className="text-xs text-gray-500">Likes</span>
                      </div>

                      {/* Comments */}
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        <MessageCircle className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                            {formatNumber(data.stats?.comments || 0)}
                        </span>
                        <span className="text-xs text-gray-500">Comments</span>
                      </div>
                  </div>
                </div>

                {/* Selection Grid */}
                <div className="grid gap-3 mt-2">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider ml-1">Select Format</p>
                    
                    {/* Video Card */}
                    <div 
                        onClick={() => setSelectedFormat('video')}
                        className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all group ${selectedFormat === 'video' ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${selectedFormat === 'video' ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-400'}`}>
                                <Play className="w-5 h-5 fill-current" />
                            </div>
                            <div>
                                <h4 className={`font-bold ${selectedFormat === 'video' ? 'text-cyan-400' : 'text-gray-200'}`}>Video</h4>
                                <p className="text-xs text-gray-500">MP4 • HD • No Watermark</p>
                            </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedFormat === 'video' ? 'border-cyan-500' : 'border-gray-600'}`}>
                            {selectedFormat === 'video' && <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full" />}
                        </div>
                    </div>

                    {/* Audio Card */}
                    <div 
                        onClick={() => setSelectedFormat('audio')}
                        className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all group ${selectedFormat === 'audio' ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${selectedFormat === 'audio' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                <Music className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className={`font-bold ${selectedFormat === 'audio' ? 'text-purple-400' : 'text-gray-200'}`}>Audio</h4>
                                <p className="text-xs text-gray-500">MP3 • Original Sound</p>
                            </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedFormat === 'audio' ? 'border-purple-500' : 'border-gray-600'}`}>
                            {selectedFormat === 'audio' && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />}
                        </div>
                    </div>

                    {/* Thumbnail Card */}
                    <div 
                        onClick={() => setSelectedFormat('cover')}
                        className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all group ${selectedFormat === 'cover' ? 'bg-pink-500/10 border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.15)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${selectedFormat === 'cover' ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                <ImageIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className={`font-bold ${selectedFormat === 'cover' ? 'text-pink-400' : 'text-gray-200'}`}>Thumbnail</h4>
                                <p className="text-xs text-gray-500">JPG • High Quality</p>
                            </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedFormat === 'cover' ? 'border-pink-500' : 'border-gray-600'}`}>
                            {selectedFormat === 'cover' && <div className="w-2.5 h-2.5 bg-pink-500 rounded-full" />}
                        </div>
                    </div>
                </div>

                {/* Download Button */}
                <button 
                    onClick={() => setModalOpen(true)}
                    className="w-full bg-white text-black hover:bg-cyan-50 font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg transition-transform hover:-translate-y-1 active:scale-95"
                >
                    <Download className="w-6 h-6" />
                    Download Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL (Same as before) --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all">
            <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                
                <div className="text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                        {selectedFormat === 'video' && <Play className="w-8 h-8 text-cyan-400 fill-current" />}
                        {selectedFormat === 'audio' && <Music className="w-8 h-8 text-purple-400" />}
                        {selectedFormat === 'cover' && <ImageIcon className="w-8 h-8 text-pink-400" />}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">Ready to Save?</h3>
                    <p className="text-gray-400 text-sm mb-8">
                        Downloading <strong>{selectedFormat.toUpperCase()}</strong> format.
                    </p>

                    {downloading ? (
                        <button disabled className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 animate-pulse">
                            <Loader2 className="w-5 h-5 animate-spin" /> Starting Download...
                        </button>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDownload}
                                className="px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors shadow-lg shadow-cyan-500/20"
                            >
                                Yes, Save
                            </button>
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