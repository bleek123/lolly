import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tfcxplxafpiihetdrirf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_BiRjXdxVbBooeNU8DlIY7A_5_wauSnQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [vibe, setVibe] = useState('Neutral');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStatus();
    fetchPhotos();
    const channel = supabase.channel('vibe-room')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'status' }, 
      (payload) => setVibe(payload.new.current_vibe))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchStatus = async () => {
    const { data } = await supabase.from('status').select('current_vibe').eq('id', 1).single();
    if (data) setVibe(data.current_vibe);
  };

  const updateVibe = async (newVibe) => {
    setVibe(newVibe);
    await supabase.from('status').update({ current_vibe: newVibe }).eq('id', 1);
  };

  const fetchPhotos = async () => {
    const { data } = await supabase.storage.from('photos').list('', { limit: 6, sortBy: { column: 'created_at', order: 'desc' } });
    if (data) {
      const urls = data.map(f => supabase.storage.from('photos').getPublicUrl(f.name).data.publicUrl);
      setPhotos(urls);
    }
  };

  const uploadPhoto = async (e) => {
    if (!e.target.files[0]) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileName = `${Date.now()}-${file.name}`;
    await supabase.storage.from('photos').upload(fileName, file);
    await fetchPhotos();
    setUploading(false);
  };

  return (
    <div className={`min-h-screen transition-all duration-700 flex flex-col items-center px-6 py-12 
      ${vibe === 'Safe' ? 'bg-[#020617]' : 'bg-black'} text-white font-sans`}>
      
      <div className="text-center mb-12">
        <h1 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-tr from-pink-500 via-rose-500 to-violet-600">
          Lolly
        </h1>
        <p className="text-[10px] uppercase tracking-[0.5em] text-slate-500 mt-4 font-bold opacity-60">Private Sync Active</p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => updateVibe('Cuddly')} 
            className={`aspect-square rounded-[3.5rem] transition-all duration-500 flex flex-col items-center justify-center border-2 
            ${vibe === 'Cuddly' ? 'bg-pink-500/20 border-pink-500 shadow-lg scale-105' : 'bg-white/5 border-transparent opacity-40 hover:opacity-100'}`}>
            <span className="text-5xl mb-3">🧸</span>
            <span className="text-[11px] font-black uppercase tracking-widest text-pink-200">Cuddly</span>
          </button>

          <button onClick={() => updateVibe('Intimate')} 
            className={`aspect-square rounded-[3.5rem] transition-all duration-500 flex flex-col items-center justify-center border-2 
            ${vibe === 'Intimate' ? 'bg-rose-500/20 border-rose-500 shadow-lg scale-105' : 'bg-white/5 border-transparent opacity-40 hover:opacity-100'}`}>
            <span className="text-5xl mb-3">✨</span>
            <span className="text-[11px] font-black uppercase tracking-widest text-rose-200">Intimate</span>
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 backdrop-blur-3xl shadow-2xl relative">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Memory Vault</h2>
            <label className="bg-white text-black h-12 w-12 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-90 transition-all shadow-lg">
              <span className="text-2xl font-light">{uploading ? '...' : '+'}</span>
              <input type="file" accept="image/*" onChange={uploadPhoto} hidden />
            </label>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {photos.map((url, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-black/50 border border-white/5 group relative">
                <img src={url} className="w-full h-full object-cover blur-3xl group-active:blur-0 transition-all duration-1000 scale-125" alt="" />
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => updateVibe('Safe')} 
          className={`w-full py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.5em] transition-all border-2
          ${vibe === 'Safe' ? 'bg-cyan-500 border-cyan-400 text-white shadow-xl' : 'bg-white/5 border-transparent text-slate-600'}`}>
          {vibe === 'Safe' ? '🛡️ Shields Up' : 'Request Safe Space'}
        </button>
      </div>
    </div>
  );
}