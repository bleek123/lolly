import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. Fixed API Credentials
const SUPABASE_URL = 'https://tfcxplxafpiihetdrirf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_BiRjXdxVbBooeNU8DlIY7A_5_wauSnQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [vibe, setVibe] = useState('Neutral');

  useEffect(() => {
    // Pull the initial status when the app opens
    const getInitialStatus = async () => {
      const { data } = await supabase.from('status').select('current_vibe').eq('id', 1).single();
      if (data) setVibe(data.current_vibe);
    };
    getInitialStatus();

    // Listen for real-time updates
    const channel = supabase.channel('vibe-room')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'status' }, 
      (payload) => {
        setVibe(payload.new.current_vibe);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const updateVibe = async (newVibe) => {
    setVibe(newVibe);
    await supabase.from('status').update({ current_vibe: newVibe }).eq('id', 1);
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 flex flex-col items-center p-8 
      ${vibe === 'Safe' ? 'bg-cyan-900' : 'bg-slate-900'} text-white font-sans`}>
      
      <h1 className="text-3xl font-bold text-pink-300 mt-12 tracking-tight">Lolly & You</h1>
      <p className="text-slate-400 text-sm mt-2 mb-12">Private Sync Active</p>

      {vibe === 'Safe' ? (
        <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
          <div className="text-6xl mb-6">🛡️</div>
          <h2 className="text-2xl font-bold text-cyan-200 uppercase tracking-widest">Safe Space</h2>
          <p className="text-cyan-400 mt-2 italic">Time for a quiet breath...</p>
          <button 
            onClick={() => updateVibe('Neutral')}
            className="mt-12 border border-cyan-500/50 px-8 py-3 rounded-full text-cyan-300 hover:bg-cyan-800 transition-colors"
          >
            I'm Ready Again
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => updateVibe('Cuddly')}
              className={`p-8 rounded-[2rem] flex flex-col items-center justify-center transition-all duration-500 border-2 
              ${vibe === 'Cuddly' ? 'bg-pink-500 border-white/20 scale-105 shadow-2xl' : 'bg-slate-800 border-transparent opacity-40'}`}
            >
              <span className="text-4xl mb-2">🧸</span>
              <span className="text-[10px] font-black uppercase tracking-tighter">Cuddly</span>
            </button>
            
            <button 
              onClick={() => updateVibe('Intimate')}
              className={`p-8 rounded-[2rem] flex flex-col items-center justify-center transition-all duration-500 border-2 
              ${vibe === 'Intimate' ? 'bg-red-500 border-white/20 scale-105 shadow-2xl' : 'bg-slate-800 border-transparent opacity-40'}`}
            >
              <span className="text-4xl mb-2">✨</span>
              <span className="text-[10px] font-black uppercase tracking-tighter">Intimate</span>
            </button>
          </div>
          
          <button 
            onClick={() => updateVibe('Safe')}
            className="w-full p-6 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center gap-3 hover:bg-slate-700 transition-all active:scale-95"
          >
            <span className="text-xl">🛡️</span>
            <span className="font-bold text-xs uppercase tracking-widest text-slate-300">Safe Space</span>
          </button>
        </div>
      )}

      <footer className="mt-auto pb-10 text-[10px] text-slate-600 uppercase tracking-widest">
        End-to-End Private
      </footer>
    </div>
  );
}