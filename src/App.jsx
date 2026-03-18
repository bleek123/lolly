import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tfcxplxafpiihetdrirf.supabase.co', 
  'sb_publishable_BiRjXdxVbBooeNU8DlIY7A_5_wauSnQ'
);

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const { data } = await supabase.storage.from('photos').list('', { 
      limit: 12, 
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
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 font-sans select-none">
      
      {/* Stealth Header */}
      <div className="mt-12 mb-16 text-center">
        <h1 className="text-4xl font-thin tracking-[0.8em] uppercase opacity-20">System</h1>
        <div className="h-[1px] w-12 bg-white/10 mx-auto mt-4"></div>
      </div>

      <div className="w-full max-w-md">
        {/* The Grid */}
        <div 
          onMouseDown={() => setIsRevealed(true)}
          onMouseUp={() => setIsRevealed(false)}
          onTouchStart={() => setIsRevealed(true)}
          onTouchEnd={() => setIsRevealed(false)}
          className="grid grid-cols-3 gap-2 bg-white/[0.02] p-4 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-2xl transition-all active:scale-[0.98]"
        >
          {photos.map((url, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/5 relative">
              <img 
                src={url} 
                className={`w-full h-full object-cover transition-all duration-700 ${isRevealed ? 'blur-0 scale-100' : 'blur-2xl scale-110 opacity-30'}`} 
                alt=""
              />
            </div>
          ))}
          
          {/* Ghost Upload Slot */}
          <label className="aspect-square rounded-xl border border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
            <span className="text-xl font-light opacity-20">{uploading ? '...' : '+'}</span>
            <input type="file" accept="image/*" onChange={handleUpload} hidden />
          </label>
        </div>

        {/* Instructions */}
        <p className="text-center mt-8 text-[10px] uppercase tracking-[0.3em] text-slate-600 font-bold">
          {isRevealed ? 'Access Granted' : 'Hold Grid to Decrypt'}
        </p>
      </div>

      {/* Secret Safe Switch in Bottom Right */}
      <div className="fixed bottom-6 right-6 opacity-5 hover:opacity-100 transition-opacity">
        <button className="text-[10px] uppercase tracking-widest font-bold text-rose-500">
          Emergency Wipe
        </button>
      </div>
    </div>
  );
}