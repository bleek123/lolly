import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tfcxplxafpiihetdrirf.supabase.co', 
  'sb_publishable_BiRjXdxVbBooeNU8DlIY7A_5_wauSnQ'
);

export default function App() {
  const [tab, setTab] = useState('gallery'); // 'gallery' or 'vault'
  const [photos, setPhotos] = useState([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const { data } = await supabase.storage.from('photos').list('', { 
      limit: 20, 
      sortBy: { column: 'created_at', order: 'desc' } 
    });
    if (data) {
      const urls = data.map(f => supabase.storage.from('photos').getPublicUrl(f.name).data.publicUrl);
      setPhotos(urls);
    }
  };

  const handleUpload = async (e) => {
    if (!e.target.files[0]) return;
    setUploading(true);
    const file = e.target.files[0];
    const name = `${Date.now()}-${file.name}`;
    await supabase.storage.from('photos').upload(name, file);
    await fetchPhotos();
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center font-sans select-none">
      
      {/* Header */}
      <div className="mt-10 mb-8 text-center">
        <h1 className="text-2xl font-light tracking-[0.5em] uppercase opacity-40">
          {tab === 'gallery' ? 'View Mode' : 'System Vault'}
        </h1>
      </div>

      <div className="w-full max-w-md px-6 pb-32">
        {tab === 'gallery' ? (
          /* TAB 1: IMMERSIVE VIEWING */
          <div className="space-y-4">
            <p className="text-[10px] text-center text-slate-500 mb-4 uppercase tracking-widest">Hold screen to decrypt visuals</p>
            <div 
              onMouseDown={() => setIsRevealed(true)}
              onMouseUp={() => setIsRevealed(false)}
              onTouchStart={() => setIsRevealed(true)}
              onTouchEnd={() => setIsRevealed(false)}
              className="grid grid-cols-1 gap-6"
            >
              {photos.map((url, i) => (
                <div key={i} className="w-full aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
                  <img 
                    src={url} 
                    className={`w-full h-full object-cover transition-all duration-1000 ${isRevealed ? 'blur-0 scale-100 opacity-100' : 'blur-3xl scale-110 opacity-20'}`} 
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* TAB 2: MANAGEMENT / UPLOAD */
          <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Inventory</h2>
              <label className="bg-white text-black h-10 w-10 rounded-xl flex items-center justify-center cursor-pointer active:scale-90 transition-all">
                <span className="text-xl font-bold">{uploading ? '...' : '+'}</span>
                <input type="file" accept="image/*" onChange={handleUpload} hidden />
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {photos.map((url, i) => (
                <div key={i} className="aspect-square rounded-lg bg-white/10 overflow-hidden opacity-50">
                  <img src={url} className="w-full h-full object-cover grayscale" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tab Bar */}
      <div className="fixed bottom-10 w-full max-w-xs bg-white/5 border border-white/10 backdrop-blur-2xl rounded-full p-2 flex justify-between shadow-2xl">
        <button 
          onClick={() => setTab('gallery')}
          className={`flex-1 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${tab === 'gallery' ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}
        >
          Gallery
        </button>
        <button 
          onClick={() => setTab('vault')}
          className={`flex-1 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${tab === 'vault' ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}
        >
          Vault
        </button>
      </div>
    </div>
  );
}