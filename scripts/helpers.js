(function(window, $){
  "use strict";
  window.App = window.App || {};

  // Namespaced storage helpers (avoid reserved globals)
  const NS = 'fitx';
  const KEYS = {
    config: `${NS}.challenge.config`,
    reels: `${NS}.reels`
  };

  function read(key, fallback){
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch(e){
      console.error('Storage read failed', e);
      return fallback;
    }
  }
  function write(key, value){
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch(e){
      console.error('Storage write failed', e);
      return false;
    }
  }

  window.App.Storage = {
    keys: KEYS,
    get: read,
    set: write,
    push: function(key, item){
      const arr = read(key, []);
      arr.push(item);
      return write(key, arr);
    },
    remove: function(key){
      try { window.localStorage.removeItem(key); } catch(e){ console.error('Storage remove failed', e); }
    }
  };

  // Time helpers
  function pad(n){ return n < 10 ? `0${n}` : `${n}`; }
  function msToParts(ms){
    const clamp = Math.max(0, ms);
    const days = Math.floor(clamp / (24*60*60*1000));
    const hrs = Math.floor((clamp % (24*60*60*1000)) / (60*60*1000));
    const mins = Math.floor((clamp % (60*60*1000)) / (60*1000));
    const secs = Math.floor((clamp % (60*1000)) / 1000);
    return { days, hrs, mins, secs };
  }
  function formatParts(p){
    return `${pad(p.days)}d ${pad(p.hrs)}h ${pad(p.mins)}m ${pad(p.secs)}s`;
  }
  function nextWeekdayAt(baseDate, weekday, hour){
    // weekday: 0 Sun ... 6 Sat
    const d = new Date(baseDate.getTime());
    d.setSeconds(0,0);
    const day = d.getDay();
    let delta = (weekday - day + 7) % 7;
    if (delta === 0 && d.getHours() >= hour) delta = 7;
    d.setDate(d.getDate() + delta);
    d.setHours(hour, 0, 0, 0);
    return d;
  }
  function addDays(date, days){
    const d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
  }

  function ensureConfig(){
    let cfg = read(KEYS.config, null);
    const now = new Date();
    if (!cfg){
      // Default: starts next Monday 7:00 and lasts 28 days
      const start = nextWeekdayAt(now, 1, 7);
      const end = addDays(start, 28);
      cfg = {
        startISO: start.toISOString(),
        endISO: end.toISOString(),
        weeks: 4,
        rewards: [
          { title: 'Week 1', prize: 'Smart water bottle', id: 1 },
          { title: 'Week 2', prize: 'Resistance bands set', id: 2 },
          { title: 'Week 3', prize: 'Wireless earbuds', id: 3 },
          { title: 'Week 4', prize: 'Recovery bundle', id: 4 }
        ]
      };
      write(KEYS.config, cfg);
    }
    return cfg;
  }

  function getStatus(cfg){
    const now = new Date();
    const start = new Date(cfg.startISO);
    const end = new Date(cfg.endISO);
    const mode = now < start ? 'pre' : (now > end ? 'post' : 'live');
    return { mode, now, start, end };
  }

  function weekWindow(cfg, index){
    // index: 0..weeks-1
    const start = new Date(cfg.startISO);
    const wStart = addDays(start, index * 7);
    const wEnd = addDays(wStart, 7); // exclusive end
    return { start: wStart, end: wEnd };
  }

  function timeTo(target){
    const now = Date.now();
    return Math.max(0, target.getTime() - now);
  }

  function uid(){
    return `id_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  }

  window.App.Utils = {
    pad,
    msToParts,
    formatParts,
    nextWeekdayAt,
    addDays,
    ensureConfig,
    getStatus,
    weekWindow,
    timeTo,
    uid
  };

})(window, jQuery);
