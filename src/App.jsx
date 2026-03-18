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

    const statusSubscription = supabase.channel('vibe-room')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'status' }, 
      payload => setVibe(payload.new.current_vibe))
      .subscribe();

    return () => supabase.removeChannel(statusSubscription);
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
    const { data } = await supabase.storage.from('photos').list('', { limit: 10, sortBy: { column: 'created_at', order: 'desc' } });
    if (data) {
      const urls = data.map(f => supabase.storage.from('photos').getPublicUrl(f.name).data.publicUrl);
      setPhotos(urls);
    }
  };

  const uploadPhoto = async (e) => {
    setUploading(true);
    const file = e.target.files[0];
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('photos').upload(fileName, file);
    if (!error) fetchPhotos();
    setUploading(false);
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 flex flex-col items-center p-6 ${vibe === 'Safe' ? 'bg-cyan-900' : 'bg-slate-900'} text-white font-sans`}>
      <h1 className="text-2xl font-bold text-pink-300 mt-8">Lolly & You</h1>

      {/* VIBE SECTION */}
      <div className="w-full max-w-sm mt-10 grid grid-cols-2 gap-4">
        <button onClick={() => updateVibe('Cuddly')} className={`p-6 rounded-3xl border-2 transition-all ${vibe === 'Cuddly' ? 'bg-pink-600 border-white shadow-lg scale-105' : 'bg-slate-800 border-transparent opacity-50'}`}>🧸 Cuddly</button>
        <button onClick={() => updateVibe('Intimate')} className={`p-6 rounded-3xl border-2 transition-all ${vibe === 'Intimate' ? 'bg-red-600 border-white shadow-lg scale-105' : 'bg-slate-800 border-transparent opacity-50'}`}>✨ Intimate</button>
      </div>

      {/* PHOTO VAULT SECTION */}
      <div className="w-full max-w-sm mt-12 bg-slate-800/50 p-6 rounded-[2.5rem] border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-pink-200">Private Vault</h3>
          <label className="bg-pink-500 p-2 rounded-full cursor-pointer hover:bg-pink-400 transition-colors">
            <span className="text-lg">{uploading ? '⌛' : '📸'}</span>
            <input type="file" accept="image/*" onChange={uploadPhoto} hidden disabled={uploading} />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-700 relative group">
              <img src={url} className="w-full h-full object-cover blur-md group-active:blur-0 transition-all cursor-pointer" alt="Private" />
            </div>
          ))}
          {photos.length === 0 && <div className="col-span-3 py-10 text-center text-[10px] text-slate-500 uppercase tracking-widest">No photos yet...</div>}
        </div>
      </div>

      <button onClick={() => updateVibe('Safe')} className="mt-8 text-[10px] uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors italic">Activate Safe Space 🛡️</button>
    </div>
  );
}