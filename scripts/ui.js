(function(window, $){
  "use strict";
  window.App = window.App || {};

  // State and configuration
  window.App.state = {
    timers: { main: null, milestone: null, reward: null, hub: null },
    reels: [],
    cfg: null
  };

  function sampleReels(){
    return [
      { id: 's1', name: 'Kai', note: 'Day 3: 25-min HIIT and 8k steps', photo: 'https://images.unsplash.com/photo-1571731956672-ac8e9a212b49?q=80&w=800&auto=format&fit=crop' },
      { id: 's2', name: 'Mina', note: 'Day 7: First 10k steps of the year!', photo: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800&auto=format&fit=crop' },
      { id: 's3', name: 'Owen', note: 'Day 12: Legs day burned!', photo: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop' },
      { id: 's4', name: 'Rae', note: 'Day 15: Yoga and recovery win', photo: 'https://images.unsplash.com/photo-1540206276207-3af25c08abc4?q=80&w=800&auto=format&fit=crop' }
    ];
  }

  function loadReels(){
    const saved = window.App.Storage.get(window.App.Storage.keys.reels, null);
    if (!saved){
      const seed = sampleReels();
      window.App.Storage.set(window.App.Storage.keys.reels, seed);
      return seed;
    }
    return saved;
  }

  function saveReels(list){
    window.App.Storage.set(window.App.Storage.keys.reels, list);
  }

  function renderHeroCountdown(){
    const cfg = window.App.state.cfg;
    const s = window.App.Utils.getStatus(cfg);
    const side = $('#side-count');
    const heroMode = $('#hero-mode');

    function tick(){
      const status = window.App.Utils.getStatus(cfg);
      const target = status.mode === 'pre' ? status.start : status.end;
      const parts = window.App.Utils.msToParts(window.App.Utils.timeTo(target));
      side.find('[data-part="days"]').text(window.App.Utils.pad(parts.days));
      side.find('[data-part="hours"]').text(window.App.Utils.pad(parts.hrs));
      side.find('[data-part="mins"]').text(window.App.Utils.pad(parts.mins));
      side.find('[data-part="secs"]').text(window.App.Utils.pad(parts.secs));
      const label = status.mode === 'pre' ? 'Starts in' : (status.mode === 'live' ? 'Ends in' : 'Finished');
      heroMode.text(label).removeClass('pill-wait').addClass(status.mode === 'live' ? 'pill-ok' : 'pill-wait');
      // Update hub mini
      $('#hub-count').text(`${window.App.Utils.pad(parts.days)}:${window.App.Utils.pad(parts.hrs)}:${window.App.Utils.pad(parts.mins)}:${window.App.Utils.pad(parts.secs)}`);
    }

    tick();
    if (window.App.state.timers.main) clearInterval(window.App.state.timers.main);
    window.App.state.timers.main = setInterval(tick, 1000);
  }

  function renderMilestone(){
    const cfg = window.App.state.cfg;
    const s = window.App.Utils.getStatus(cfg);
    let label = 'Calculating...';
    let target = null;

    if (s.mode === 'pre') { label = 'Kickoff'; target = s.start; }
    else if (s.mode === 'live') {
      // Next week boundary or end if final week
      const now = s.now;
      const totalWeeks = cfg.weeks;
      for (let i=0; i<totalWeeks; i++){
        const w = window.App.Utils.weekWindow(cfg, i);
        if (now < w.end) { label = `End of Week ${i+1}`; target = w.end; break; }
      }
      if (!target) { label = 'Challenge End'; target = s.end; }
    } else { label = 'Challenge Completed'; target = s.end; }

    function tick(){
      const parts = window.App.Utils.msToParts(window.App.Utils.timeTo(target));
      $('#milestone-count').text(`${window.App.Utils.pad(parts.days)}d ${window.App.Utils.pad(parts.hrs)}h ${window.App.Utils.pad(parts.mins)}m ${window.App.Utils.pad(parts.secs)}s`);
      $('#milestone-label').text(label);
    }

    tick();
    if (window.App.state.timers.milestone) clearInterval(window.App.state.timers.milestone);
    window.App.state.timers.milestone = setInterval(tick, 1000);
  }

  function renderStats(){
    const list = window.App.state.reels || [];
    $('#stat-participants').text(list.length);
    const cfg = window.App.state.cfg;
    const s = window.App.Utils.getStatus(cfg);
    let weekIndex = 0;
    if (s.mode === 'pre') weekIndex = 0; else if (s.mode === 'live') {
      for (let i=0; i<cfg.weeks; i++){
        const w = window.App.Utils.weekWindow(cfg, i);
        if (s.now >= w.start && s.now < w.end){ weekIndex = i; break; }
        if (s.now >= w.end) weekIndex = Math.min(cfg.weeks-1, i+1);
      }
    } else weekIndex = cfg.weeks;
    $('#stat-week').text(`Week ${Math.min(cfg.weeks, Math.max(1, weekIndex+1))}`);
    $('#year').text(new Date().getFullYear());
  }

  function renderRewards(){
    const cfg = window.App.state.cfg;
    const s = window.App.Utils.getStatus(cfg);
    const grid = $('#reward-grid');
    grid.empty();

    let nextTarget = null;

    cfg.rewards.forEach(function(r, i){
      const w = window.App.Utils.weekWindow(cfg, i);
      const now = s.now;
      const unlocked = now >= w.end; // reward unlocks after week ends
      if (!nextTarget && now < w.end) nextTarget = w.end;
      const status = unlocked ? 'Unlocked' : 'Upcoming';
      const pillClass = unlocked ? 'pill-ok' : 'pill-wait';
      const item = $(`
        <div class="md:col-span-3 card p-5 md:p-6 fade-in" style="transition-delay:${i*60}ms">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900">${r.title}</h3>
            <span class="pill ${pillClass}">${status}</span>
          </div>
          <p class="text-sm text-slate-600 mt-2">${r.prize}</p>
          <div class="text-xs text-slate-500 mt-4">Week window</div>
          <div class="text-sm font-mono text-slate-800">${w.start.toLocaleDateString()} - ${new Date(w.end.getTime()-1).toLocaleDateString()}</div>
        </div>
      `);
      grid.append(item);
      setTimeout(function(){ item.addClass('show'); }, 60);
    });

    function tick(){
      if (!nextTarget) { $('#next-reward-count').text('00:00:00'); return; }
      const parts = window.App.Utils.msToParts(window.App.Utils.timeTo(nextTarget));
      $('#next-reward-count').text(`${window.App.Utils.pad(parts.days)}d ${window.App.Utils.pad(parts.hrs)}h ${window.App.Utils.pad(parts.mins)}m`);
    }
    tick();
    if (window.App.state.timers.reward) clearInterval(window.App.state.timers.reward);
    window.App.state.timers.reward = setInterval(tick, 1000);
  }

  function reelCardTemplate(entry, deletable){
    const img = entry.photo ? entry.photo : 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop';
    const delBtn = deletable ? `<button class="btn-ghost text-xs" data-del="${entry.id}">Remove</button>` : '';
    return $(`
      <article class="reel-card snap-start">
        <div class="h-36 md:h-40 w-full bg-slate-200 reel-img" style="background-image:url('${img}')" role="img" aria-label="${entry.name}'s progress image"></div>
        <div class="p-4 flex items-start justify-between gap-3">
          <div>
            <div class="reel-name">${$('<div>').text(entry.name).html()}</div>
            <div class="reel-note ellipsis mt-0.5">${$('<div>').text(entry.note).html()}</div>
            <div class="text-[11px] text-slate-500 mt-1">${new Date(entry.when || Date.now()).toLocaleString()}</div>
          </div>
          <div class="card-actions">${delBtn}</div>
        </div>
      </article>
    `);
  }

  function renderReels(){
    const track = $('#reel-track');
    if (!track.length) return;
    track.empty();
    const list = window.App.state.reels;
    list.forEach(function(e){ track.append(reelCardTemplate(e, false)); });

    // Auto-scroll gently unless prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced){
      let dir = 1;
      let ticker = setInterval(function(){
        const max = track[0].scrollWidth - track[0].clientWidth;
        const next = Math.min(max, Math.max(0, track.scrollLeft() + dir * 1.2));
        track.scrollLeft(next);
        if (next === 0 || next === max) dir *= -1;
      }, 20);
      track.data('ticker', ticker);
      $(window).on('beforeunload', function(){ clearInterval(ticker); });
    }

    $('#reel-left').off('click').on('click', function(){
      track.stop().animate({ scrollLeft: Math.max(0, track.scrollLeft() - 280) }, 300);
    });
    $('#reel-right').off('click').on('click', function(){
      track.stop().animate({ scrollLeft: track.scrollLeft() + 280 }, 300);
    });

    // Form submission on landing
    $('#reel-form').off('submit').on('submit', function(e){
      e.preventDefault();
      const name = String($('#name').val() || '').trim();
      const note = String($('#note').val() || '').trim();
      const photo = String($('#photo').val() || '').trim();
      if (!name || !note){
        alert('Please provide your name and a short progress note.');
        return;
      }
      const entry = { id: window.App.Utils.uid(), name, note, photo: photo || null, when: Date.now(), mine: true };
      window.App.state.reels.unshift(entry);
      saveReels(window.App.state.reels);
      $('#reel-track').prepend(reelCardTemplate(entry, false).hide().fadeIn(250));
      $('#name').val(''); $('#note').val(''); $('#photo').val('');
      renderStats();
    });
  }

  function renderHub(){
    const wrap = $('#hub-reel');
    if (!wrap.length) return;
    wrap.empty();
    const list = window.App.state.reels;
    list.forEach(function(e){
      const deletable = !!e.mine;
      const card = reelCardTemplate(e, deletable);
      if (deletable){
        card.find('[data-del]').on('click', function(){
          const id = $(this).data('del');
          const filtered = window.App.state.reels.filter(function(x){ return x.id !== id; });
          window.App.state.reels = filtered;
          saveReels(filtered);
          card.fadeOut(150, function(){ $(this).remove(); renderStats(); });
        });
      }
      wrap.append(card);
    });

    // Hub add form
    $('#hub-form').off('submit').on('submit', function(e){
      e.preventDefault();
      const name = String($('#h-name').val() || '').trim();
      const note = String($('#h-note').val() || '').trim();
      const photo = String($('#h-photo').val() || '').trim();
      if (!name || !note){ alert('Please provide your name and progress note.'); return; }
      const entry = { id: window.App.Utils.uid(), name, note, photo: photo || null, when: Date.now(), mine: true };
      window.App.state.reels.unshift(entry);
      saveReels(window.App.state.reels);
      renderHub();
      renderStats();
      $('#h-name').val(''); $('#h-note').val(''); $('#h-photo').val('');
    });

    // Clear only my posts
    $('#clear-my-posts').off('click').on('click', function(){
      if (!confirm('Remove only the posts you added on this device?')) return;
      const remaining = window.App.state.reels.filter(function(x){ return !x.mine; });
      window.App.state.reels = remaining;
      saveReels(remaining);
      renderHub();
      renderStats();
    });

    // Render compact rewards state
    const cfg = window.App.state.cfg;
    const s = window.App.Utils.getStatus(cfg);
    const listEl = $('#hub-rewards');
    listEl.empty();
    cfg.rewards.forEach(function(r, i){
      const w = window.App.Utils.weekWindow(cfg, i);
      const unlocked = s.now >= w.end;
      const li = $(`
        <li class="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
          <span class="text-slate-700">${r.title}: ${r.prize}</span>
          <span class="text-xs ${unlocked ? 'text-emerald-700' : 'text-amber-700'}">${unlocked ? 'Unlocked' : 'Pending'}</span>
        </li>
      `);
      listEl.append(li);
    });
  }

  function revealOnScroll(){
    const els = $('.fade-in');
    function onScroll(){
      const wh = window.innerHeight;
      els.each(function(){
        const rect = this.getBoundingClientRect();
        if (rect.top < wh - 40){ $(this).addClass('show'); }
      });
    }
    $(window).on('scroll', onScroll);
    onScroll();
  }

  window.App.init = function(){
    // Load config and reels
    window.App.state.cfg = window.App.Utils.ensureConfig();
    window.App.state.reels = loadReels();
  };

  window.App.render = function(){
    renderHeroCountdown();
    renderMilestone();
    renderRewards();
    renderStats();
    renderReels();
    renderHub();
    revealOnScroll();
  };

})(window, jQuery);
