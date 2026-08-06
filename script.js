/**
 * SSLOS — WINDOWS XP-INSPIRED PORTFOLIO DESKTOP ENGINE
 * Seung Sik (Daniel) Lee Portfolio — B.S. Computer Engineering @ Texas A&M
 * Features: Boot Sequence, Resume Viewer & PDF Printer, VS Code App, Explorer Subfolders,
 * Draggable Icons (Align to Grid), Wallpapers, Terminal Easter Eggs (winver, sudo hire daniel, matrix)
 */

// Global Fallback Boot Dismiss
window.completeBootGlobal = function() {
  const bootScreen = document.getElementById('boot-screen');
  if (bootScreen) {
    bootScreen.style.opacity = '0';
    bootScreen.style.pointerEvents = 'none';
    bootScreen.style.display = 'none';
    bootScreen.classList.add('hidden');
  }
  sessionStorage.setItem('sslos_booted', 'true');
};

document.addEventListener('DOMContentLoaded', () => {
  let highestZIndex = 500;
  let systemVolume = 0.8;
  let isSystemMuted = false;

  // Web Audio API Synthesizer for XP Sounds (Shared AudioContext to prevent browser memory crashes)
  let sharedAudioCtx = null;
  function getAudioContext() {
    try {
      if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxClass) sharedAudioCtx = new AudioCtxClass();
      }
      if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume();
      }
      return sharedAudioCtx;
    } catch (e) {
      return null;
    }
  }

  function playSound(type = 'click') {
    if (isSystemMuted || systemVolume <= 0) return;
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const volMultiplier = systemVolume / 0.8;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04 * volMultiplier, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } else if (type === 'open') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05 * volMultiplier, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } else if (type === 'close') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(329.63, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.04 * volMultiplier, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      }
    } catch (e) {}
  }


  // ------------------------------------------------------------------------
  // 1. BOOT SEQUENCE MANAGER
  // ------------------------------------------------------------------------
  const bootScreen = document.getElementById('boot-screen');
  const bootSkipBtn = document.getElementById('boot-skip-btn');

  function completeBoot() {
    window.completeBootGlobal();
    playSound('open');
  }

  if (sessionStorage.getItem('sslos_booted') === 'true') {
    window.completeBootGlobal();
  } else {
    setTimeout(() => {
      completeBoot();
    }, 1500);
  }

  if (bootSkipBtn) {
    bootSkipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      completeBoot();
    });
  }

  if (bootScreen) {
    bootScreen.addEventListener('click', completeBoot);
  }

  document.addEventListener('keydown', () => {
    completeBoot();
  });


  // ------------------------------------------------------------------------
  // 2. WINDOW MANAGER ENGINE (PERSISTENT TASKBAR BUTTONS ON MINIMIZE)
  // ------------------------------------------------------------------------
  const windows = document.querySelectorAll('.window');

  function bringToFront(win) {
    if (!win) return;
    highestZIndex += 10;
    win.style.zIndex = highestZIndex;
    windows.forEach(w => w.classList.remove('active-window'));
    win.classList.add('active-window');
    win.classList.remove('minimized');
    win.classList.remove('closed');
    updateTaskbar();
  }

  function openWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    win.classList.remove('closed');
    win.classList.remove('minimized');
    // PowerShell terminal and Muhan Maesu trading app open maximized so all content is comfortably visible
    if (winId === 'win-terminal' || winId === 'win-muhan-maesu') {
      win.classList.add('maximized');
    }
    if (winId === 'win-my-heart') {
      setTimeout(() => {
        if (window.triggerInlineCelebration) window.triggerInlineCelebration('both');
      }, 300);
    }
    bringToFront(win);
    playSound('open');
  }

  function closeWindow(win) {
    win.classList.add('closed');
    win.classList.add('minimized');
    win.classList.remove('active-window');
    updateTaskbar();
    playSound('close');
  }

  function toggleMinimize(win) {
    if (win.classList.contains('closed')) {
      openWindow(win.id);
      return;
    }

    if (win.classList.contains('minimized')) {
      win.classList.remove('minimized');
      bringToFront(win);
    } else if (win.classList.contains('active-window')) {
      win.classList.add('minimized');
      win.classList.remove('active-window');
    } else {
      bringToFront(win);
    }
    updateTaskbar();
  }

  function toggleMaximize(win) {
    win.classList.toggle('maximized');
    bringToFront(win);
    playSound('click');
  }

  const handleDirections = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];

  windows.forEach(win => {
    // Bring window to top of layers whenever touched or clicked
    win.addEventListener('mousedown', () => bringToFront(win));
    win.addEventListener('touchstart', () => bringToFront(win), { passive: true });
    win.addEventListener('pointerdown', () => bringToFront(win), { passive: true });

    const titlebar = win.querySelector('.window-titlebar');
    const btnMin = win.querySelector('.btn-min');
    const btnMax = win.querySelector('.btn-max');
    const btnClose = win.querySelector('.btn-close');

    if (btnMin) btnMin.addEventListener('click', (e) => { e.stopPropagation(); toggleMinimize(win); });
    if (btnMax) btnMax.addEventListener('click', (e) => { e.stopPropagation(); toggleMaximize(win); });
    if (btnClose) btnClose.addEventListener('click', (e) => { e.stopPropagation(); closeWindow(win); });

    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // Move window by dragging from the top side (titlebar)
    if (titlebar) {
      const startWindowDrag = (e) => {
        if (e.target.classList.contains('win-btn') || win.classList.contains('maximized')) return;
        bringToFront(win);
        isDragging = true;

        // Freeze rendered inline left/top if relying on CSS fallback defaults
        if (!win.style.left || win.style.left === '') {
          win.style.left = `${win.offsetLeft}px`;
        }
        if (!win.style.top || win.style.top === '') {
          win.style.top = `${win.offsetTop}px`;
        }

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragOffsetX = clientX - win.offsetLeft;
        dragOffsetY = clientY - win.offsetTop;
      };

      const moveWindowDrag = (e) => {
        if (!isDragging || win.classList.contains('maximized')) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const maxLeft = Math.max(0, window.innerWidth - win.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - 34 - win.offsetHeight);
        const newLeft = Math.min(maxLeft, Math.max(0, clientX - dragOffsetX));
        const newTop = Math.min(maxTop, Math.max(0, clientY - dragOffsetY));
        win.style.left = `${newLeft}px`;
        win.style.top = `${newTop}px`;
      };

      const stopWindowDrag = () => { isDragging = false; };

      titlebar.addEventListener('mousedown', startWindowDrag);
      titlebar.addEventListener('touchstart', startWindowDrag, { passive: true });

      document.addEventListener('mousemove', moveWindowDrag);
      document.addEventListener('touchmove', moveWindowDrag, { passive: true });

      document.addEventListener('mouseup', stopWindowDrag);
      document.addEventListener('touchend', stopWindowDrag);
    }

    // Scale / Resize window by dragging handles (including bottom corners sw and se)
    handleDirections.forEach(dir => {
      let handle = win.querySelector(`.resize-handle.${dir}`);
      if (!handle) {
        handle = document.createElement('div');
        handle.className = `resize-handle ${dir}`;
        win.appendChild(handle);
      }

      let isResizing = false;
      let startX = 0, startY = 0;
      let startW = 0, startH = 0;
      let startL = 0, startT = 0;

      const startResize = (e) => {
        if (win.classList.contains('maximized')) return;
        e.stopPropagation();
        bringToFront(win);
        isResizing = true;

        // Clear max constraints during manual corner scaling
        win.style.maxWidth = 'none';
        win.style.maxHeight = 'none';

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        startX = clientX;
        startY = clientY;
        startW = win.offsetWidth;
        startH = win.offsetHeight;
        startL = win.offsetLeft;
        startT = win.offsetTop;

        const onMove = (moveEvt) => {
          if (!isResizing) return;
          const curX = moveEvt.touches ? moveEvt.touches[0].clientX : moveEvt.clientX;
          const curY = moveEvt.touches ? moveEvt.touches[0].clientY : moveEvt.clientY;
          const dx = curX - startX;
          const dy = curY - startY;

          const minW = Math.min(240, window.innerWidth - 20);
          const minH = 160;

          let newW = startW;
          let newH = startH;
          let newL = startL;
          let newT = startT;

          if (dir.includes('e')) {
            newW = Math.max(minW, startW + dx);
          }
          if (dir.includes('s')) {
            newH = Math.max(minH, startH + dy);
          }
          if (dir.includes('w')) {
            newW = Math.max(minW, startW - dx);
            if (newW > minW) newL = startL + dx;
          }
          if (dir.includes('n')) {
            newH = Math.max(minH, startH - dy);
            if (newH > minH) newT = startT + dy;
          }

          // Boundary limit against screen viewport
          newW = Math.min(window.innerWidth - newL, newW);
          newH = Math.min(window.innerHeight - 34 - newT, newH);

          win.style.width = `${newW}px`;
          win.style.height = `${newH}px`;
          win.style.left = `${Math.max(0, newL)}px`;
          win.style.top = `${Math.max(0, newT)}px`;
        };

        const stopResize = () => {
          isResizing = false;
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', stopResize);
          document.removeEventListener('touchmove', onMove);
          document.removeEventListener('touchend', stopResize);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', stopResize);
      };

      handle.addEventListener('mousedown', startResize);
      handle.addEventListener('touchstart', startResize, { passive: false });
    });
  });

  // Clamp window positions on resize & orientation change
  function clampWindowPositions() {
    windows.forEach(win => {
      if (win.classList.contains('closed') || win.classList.contains('maximized')) return;
      const maxLeft = Math.max(0, window.innerWidth - win.offsetWidth);
      const maxTop = Math.max(0, window.innerHeight - 34 - win.offsetHeight);
      if (win.style.left && win.style.left !== '') {
        const curLeft = parseFloat(win.style.left) || 0;
        if (curLeft > maxLeft) win.style.left = `${maxLeft}px`;
      }
      if (win.style.top && win.style.top !== '') {
        const curTop = parseFloat(win.style.top) || 0;
        if (curTop > maxTop) win.style.top = `${maxTop}px`;
      }
    });
  }

  window.addEventListener('resize', clampWindowPositions);
  window.addEventListener('orientationchange', () => {
    setTimeout(clampWindowPositions, 250);
  });


  // ------------------------------------------------------------------------
  // 3. DRAGGABLE & TOUCH-ENABLED DESKTOP ICONS (ALIGN TO GRID ENGINE)
  // ------------------------------------------------------------------------
  const desktopIcons = document.querySelectorAll('.desktop-icon');
  const GRID_X = 96;
  const GRID_Y = 100;
  const PADDING_X = 16;
  const PADDING_Y = 16;

  desktopIcons.forEach(icon => {
    let isDraggingIcon = false;
    let iconOffsetX = 0;
    let iconOffsetY = 0;
    let touchStartTime = 0;
    let touchMoved = false;

    const startIconDrag = (e) => {
      desktopIcons.forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
      icon.classList.add('dragging');
      isDraggingIcon = true;
      touchMoved = false;
      touchStartTime = Date.now();

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      iconOffsetX = clientX - icon.offsetLeft;
      iconOffsetY = clientY - icon.offsetTop;
      playSound('click');
    };

    const moveIconDrag = (e) => {
      if (!isDraggingIcon) return;
      touchMoved = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const maxLeft = Math.max(0, window.innerWidth - icon.offsetWidth);
      const maxTop = Math.max(0, window.innerHeight - 34 - icon.offsetHeight);
      const newLeft = Math.min(maxLeft, Math.max(0, clientX - iconOffsetX));
      const newTop = Math.min(maxTop, Math.max(0, clientY - iconOffsetY));
      icon.style.left = `${newLeft}px`;
      icon.style.top = `${newTop}px`;
    };

    const stopIconDrag = () => {
      if (!isDraggingIcon) return;
      isDraggingIcon = false;
      icon.classList.remove('dragging');

      const rawLeft = parseFloat(icon.style.left) || PADDING_X;
      const rawTop = parseFloat(icon.style.top) || PADDING_Y;

      let col = Math.round((rawLeft - PADDING_X) / GRID_X);
      let row = Math.round((rawTop - PADDING_Y) / GRID_Y);

      col = Math.max(0, col);
      row = Math.max(0, row);

      icon.style.left = `${PADDING_X + col * GRID_X}px`;
      icon.style.top = `${PADDING_Y + row * GRID_Y}px`;

      // Touch tap opening for mobile touch devices
      if (!touchMoved && (Date.now() - touchStartTime < 350)) {
        const href = icon.dataset.href;
        if (href) { window.location.href = href; return; }
        const winId = icon.dataset.window;
        if (winId) openWindow(winId);
      }
    };

    icon.addEventListener('mousedown', startIconDrag);
    icon.addEventListener('touchstart', startIconDrag, { passive: true });

    document.addEventListener('mousemove', moveIconDrag);
    document.addEventListener('touchmove', moveIconDrag, { passive: true });

    document.addEventListener('mouseup', stopIconDrag);
    document.addEventListener('touchend', stopIconDrag);

    icon.addEventListener('dblclick', () => {
      const href = icon.dataset.href;
      if (href) { window.location.href = href; return; }
      const winId = icon.dataset.window;
      if (winId) openWindow(winId);
    });
  });


  // ------------------------------------------------------------------------
  // 4. DESKTOP RIGHT-CLICK CONTEXT MENU & WALLPAPER SWITCHER
  // ------------------------------------------------------------------------
  const contextMenu = document.getElementById('desktop-context-menu');
  const desktopArea = document.getElementById('desktop-area');

  if (desktopArea && contextMenu) {
    desktopArea.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      contextMenu.style.left = `${e.clientX}px`;
      contextMenu.style.top = `${e.clientY}px`;
      contextMenu.classList.add('open');
      playSound('click');
    });

    document.addEventListener('click', (e) => {
      if (!contextMenu.contains(e.target)) {
        contextMenu.classList.remove('open');
      }
    });

    document.getElementById('ctx-refresh')?.addEventListener('click', () => {
      desktopIcons.forEach(i => i.classList.remove('selected'));
      contextMenu.classList.remove('open');
      playSound('click');
    });

    document.getElementById('ctx-sort')?.addEventListener('click', () => {
      let col = 0, row = 0;
      desktopIcons.forEach((icon) => {
        icon.style.left = `${PADDING_X + col * GRID_X}px`;
        icon.style.top = `${PADDING_Y + row * GRID_Y}px`;
        row++;
        if (row >= 4) { row = 0; col++; }
      });
      contextMenu.classList.remove('open');
      playSound('click');
    });

    document.getElementById('ctx-wp-hills')?.addEventListener('click', () => {
      if (window.stopAsciiMirrorWallpaper) window.stopAsciiMirrorWallpaper();
      document.documentElement.style.setProperty('--current-wallpaper', 'var(--wp-hills)');
      contextMenu.classList.remove('open');
      playSound('click');
    });

    document.getElementById('ctx-wp-mirror')?.addEventListener('click', () => {
      if (window.startAsciiMirrorWallpaper) window.startAsciiMirrorWallpaper();
      contextMenu.classList.remove('open');
      playSound('click');
    });

    document.getElementById('ctx-winver')?.addEventListener('click', () => {
      openWindow('win-winver');
      contextMenu.classList.remove('open');
    });

    document.getElementById('ctx-terminal')?.addEventListener('click', () => {
      openWindow('win-terminal');
      contextMenu.classList.remove('open');
    });
  }

  document.getElementById('winver-ok-btn')?.addEventListener('click', () => {
    closeWindow(document.getElementById('win-winver'));
  });


  // ------------------------------------------------------------------------
  // 5. HIERARCHICAL EXPLORER SUBFOLDERS
  // ------------------------------------------------------------------------
  document.querySelectorAll('.explorer-folder-item').forEach(folder => {
    folder.addEventListener('dblclick', () => {
      const openWinId = folder.dataset.openWin;
      if (openWinId) openWindow(openWinId);
    });
  });


  // ------------------------------------------------------------------------
  // 6. INTERACTIVE VS CODE APPLICATION (RESUME & ZOHO PIPELINE SYNCED)
  // ------------------------------------------------------------------------
  const vscCodeContent = document.getElementById('vsc-code-content');
  const vscTabLabel = document.getElementById('vsc-tab-label');

  const VSC_FILES = {
    readme: {
      title: '📄 README.md',
      content: `<span class="cpp-comment"># Seung Sik (Daniel) Lee — Portfolio &amp; Resume</span>

<span class="cpp-kw">## Education &amp; Background</span>
- **Degree:** B.S. Major in Computer Engineering, Minor in Mathematics
- **School:** Texas A&amp;M University (Graduated May 2026)
- **Current Role:** Engineering Technician (Software Systems) @ US Modules
- **Past Role:** Data Analytics Intern @ KW Internationals

<span class="cpp-kw">## Featured Automation Project: Zoho Data Pipeline</span>
- Multi-threaded REST API extractor using \`ThreadPoolExecutor(max_workers=10)\`
- SLA TAT date/time calculations with \`numpy.busday_offset\`
- Automated Excel table resizing via Win32 COM (\`win32com.client\`)
- Automatic Power BI workbook launcher (\`CUCHEN Draft.v2.pbix\`)`
    },
    zoho: {
      title: '⚙️ run_pipeline.py',
      content: `<span class="code-line"><span class="line-num">1</span><span class="cpp-comment"># Seung Sik Lee — Zoho Parallel Pipeline Orchestrator</span></span>
<span class="code-line"><span class="line-num">2</span><span class="cpp-kw">import</span> subprocess, threading, time</span>
<span class="code-line"><span class="line-num">3</span><span class="cpp-kw">from</span> pathlib <span class="cpp-kw">import</span> Path</span>
<span class="code-line"><span class="line-num">4</span></span>
<span class="code-line"><span class="line-num">5</span><span class="cpp-kw">def</span> <span class="cpp-fn">run_script</span>(script_name):</span>
<span class="code-line"><span class="line-num">6</span>    process = subprocess.<span class="cpp-fn">Popen</span>([<span class="cpp-str">"python"</span>, script_name])</span>
<span class="code-line"><span class="line-num">7</span>    process.<span class="cpp-fn">wait</span>()</span>
<span class="code-line"><span class="line-num">8</span></span>
<span class="code-line"><span class="line-num">9</span><span class="cpp-kw">if</span> __name__ == <span class="cpp-str">"__main__"</span>:</span>
<span class="code-line"><span class="line-num">10</span>   <span class="cpp-comment"># 1. Run zohofsmExport and zohodeskExport concurrently in parallel threads</span></span>
<span class="code-line"><span class="line-num">11</span>   t1 = threading.<span class="cpp-type">Thread</span>(target=run_script, args=(<span class="cpp-str">"Code/zohofsmExport.py"</span>,))</span>
<span class="code-line"><span class="line-num">12</span>   t2 = threading.<span class="cpp-type">Thread</span>(target=run_script, args=(<span class="cpp-str">"Code/zohodeskExport.py"</span>,))</span>
<span class="code-line"><span class="line-num">13</span>   t1.<span class="cpp-fn">start</span>(); t2.<span class="cpp-fn">start</span>(); t1.<span class="cpp-fn">join</span>(); t2.<span class="cpp-fn">join</span>()</span>
<span class="code-line"><span class="line-num">14</span></span>
<span class="code-line"><span class="line-num">15</span>   <span class="cpp-comment"># 2. Inject CSV data to Ticket_Template.xlsx &amp; clear gen_py cache</span></span>
<span class="code-line"><span class="line-num">16</span>   <span class="cpp-fn">run_script</span>(<span class="cpp-str">"Code/insert_to_ticket.py"</span>)</span>
<span class="code-line"><span class="line-num">17</span>   <span class="cpp-fn">run_script</span>(<span class="cpp-str">"Code/Del_Cache.py"</span>)</span>
<span class="code-line"><span class="line-num">18</span></span>
<span class="code-line"><span class="line-num">19</span>   <span class="cpp-comment"># 3. Calculate SLA formulas, apply Win32 COM table resize, &amp; launch Power BI</span></span>
<span class="code-line"><span class="line-num">20</span>   <span class="cpp-fn">run_script</span>(<span class="cpp-str">"Code/tickets_to_tickets.py"</span>)</span>
<span class="code-line"><span class="line-num">21</span>   subprocess.<span class="cpp-fn">Popen</span>([<span class="cpp-str">"CUCHEN Draft.v2.pbix"</span>], shell=<span class="cpp-type">True</span>)</span>`
    },
    resume: {
      title: '📜 resume.txt',
      content: `SEUNG SIK LEE
+1 (858) 209-8444 | seungsik.daniel.lee@gmail.com | linkedin.com/in/ssiklee

EDUCATION
Texas A&M University — College Station, TX
Bachelor of Science - Major in Computer Engineering, Minor in Mathematics (Graduated May 2026)

EXPERIENCE
US Modules — Engineering Technician (Software Systems) [June 2026 – Present]
- Maintained, containerized, and scaled a full-stack maintenance management platform using Docker Compose, FastAPI, and PostgreSQL.
- Resolved critical backend challenges by performing complex database schema migrations and troubleshooting SQL transaction failures.

KW Internationals — Data Analytics Intern [May 2025 – July 2025]
- Built centralized Excel dataset from 3 years of operational data for real-time business reporting.
- Developed Python tool (requests, pandas, openpyxl, pywin32, ThreadPoolExecutor) to automate Zoho Desk & FSM API retrieval, Win32 COM Excel table resizing, and Power BI auto-refresh.`
    },
    raytracer: {
      title: '⚙️ yolo_detector.cpp',
      content: `<span class="code-line"><span class="line-num">1</span><span class="cpp-comment">// Seung Sik Lee — YOLO Object Detection Pipeline</span></span>
<span class="code-line"><span class="line-num">2</span><span class="cpp-kw">#include</span> <span class="cpp-str">&lt;opencv2/opencv.hpp&gt;</span></span>
<span class="code-line"><span class="line-num">3</span><span class="cpp-kw">#include</span> <span class="cpp-str">&lt;vitis/ai/yolov4.hpp&gt;</span></span>
<span class="code-line"><span class="line-num">4</span></span>
<span class="code-line"><span class="line-num">5</span><span class="cpp-type">int</span> <span class="cpp-fn">main</span>(<span class="cpp-type">int</span> argc, <span class="cpp-type">char</span>** argv) {</span>
<span class="code-line"><span class="line-num">6</span>    <span class="cpp-comment">// Initialize specialized YOLOv4-Tiny model for drone/vehicle tracking</span></span>
<span class="code-line"><span class="line-num">7</span>    <span class="cpp-type">auto</span> yolo = vitis::ai::YOLOv4::<span class="cpp-fn">create</span>(<span class="cpp-str">"yolov4_tiny_tfa"</span>);</span>
<span class="code-line"><span class="line-num">8</span>    cv::<span class="cpp-type">VideoCapture</span> cap(<span class="cpp-str">"tfa_video_feed.mp4"</span>);</span>
<span class="code-line"><span class="line-num">9</span>    cv::<span class="cpp-type">Mat</span> frame;</span>
<span class="code-line"><span class="line-num">10</span>   <span class="cpp-kw">while</span> (cap.<span class="cpp-fn">read</span>(frame)) {</span>
<span class="code-line"><span class="line-num">11</span>       <span class="cpp-type">auto</span> results = yolo-&gt;<span class="cpp-fn">run</span>(frame);</span>
<span class="code-line"><span class="line-num">12</span>   }</span>
<span class="code-line"><span class="line-num">13</span>   <span class="cpp-kw">return</span> <span class="cpp-num">0</span>;</span>
<span class="code-line"><span class="line-num">14</span>}</span>`
    },
    contact: {
      title: '✉️ contact.json',
      content: `{
  "name": "Seung Sik (Daniel) Lee",
  "phone": "+1 (858) 209-8444",
  "email": "seungsik.daniel.lee@gmail.com",
  "linkedin": "https://linkedin.com/in/ssiklee",
  "github": "https://github.com/danielsslee",
  "status": "Engineering Technician (Software Systems) @ US Modules"
}`
    }
  };

  document.querySelectorAll('.tab-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      document.querySelectorAll('.tab-trigger').forEach(t => t.classList.remove('active'));
      trigger.classList.add('active');

      const fileKey = trigger.dataset.file;
      const fileData = VSC_FILES[fileKey];

      if (fileData && vscCodeContent && vscTabLabel) {
        vscTabLabel.innerHTML = `<span>${fileData.title}</span> <span class="tab-close-icon">✕</span>`;
        vscCodeContent.innerHTML = fileData.content;
      }
      playSound('click');
    });
  });

  if (VSC_FILES.readme && vscCodeContent) {
    vscCodeContent.innerHTML = VSC_FILES.readme.content;
  }


  // ------------------------------------------------------------------------
  // 7. TASKBAR & START MENU CONTROLLER (PERSISTENT OPEN APPS ON TASKBAR)
  // ------------------------------------------------------------------------
  const taskbarAppsContainer = document.getElementById('taskbar-apps');
  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');

  function updateTaskbar() {
    if (!taskbarAppsContainer) return;
    taskbarAppsContainer.innerHTML = '';

    windows.forEach(win => {
      // If the window is explicitly closed by user (click ✕ button), skip taskbar button
      if (win.classList.contains('closed')) return;

      const title = win.querySelector('.titlebar-title')?.textContent || 'App';
      const icon = win.querySelector('.titlebar-icon')?.textContent || '💻';
      const isActive = !win.classList.contains('minimized') && win.classList.contains('active-window');

      const appBtn = document.createElement('button');
      appBtn.className = `taskbar-app-btn ${isActive ? 'active' : ''}`;
      appBtn.innerHTML = `<span>${icon}</span> <span>${title.split('—')[0].trim()}</span>`;
      appBtn.addEventListener('click', () => toggleMinimize(win));
      taskbarAppsContainer.appendChild(appBtn);
    });
  }

  // Toggle Start Menu
  if (startButton && startMenu) {
    startButton.addEventListener('click', (e) => {
      e.stopPropagation();
      startMenu.classList.toggle('open');
      playSound('click');
    });

    document.addEventListener('click', (e) => {
      if (!startMenu.contains(e.target) && e.target !== startButton) {
        startMenu.classList.remove('open');
      }
    });

    document.querySelectorAll('.start-item').forEach(item => {
      item.addEventListener('click', () => {
        const href = item.dataset.href;
        if (href) { startMenu.classList.remove('open'); window.location.href = href; return; }
        const winId = item.dataset.window;
        if (winId) openWindow(winId);
        startMenu.classList.remove('open');
      });
    });
  }

  // ------------------------------------------------------------------------
  // 7b. SYSTEM TRAY ENGINE (CLOCK/CALENDAR, VOLUME SLIDER, NETWORK STATUS)
  // ------------------------------------------------------------------------
  const trayVolumeBtn = document.getElementById('tray-volume-btn');
  const trayVolumePopup = document.getElementById('tray-volume-popup');
  const trayVolSlider = document.getElementById('tray-vol-slider');
  const trayVolLabel = document.getElementById('tray-vol-label');
  const trayVolMute = document.getElementById('tray-vol-mute');

  const trayClockBtn = document.getElementById('tray-clock-btn');
  const winDatetime = document.getElementById('win-datetime');
  const datetimeOkBtn = document.getElementById('datetime-ok-btn');
  const calPrevBtn = document.getElementById('cal-prev-btn');
  const calNextBtn = document.getElementById('cal-next-btn');
  const calMonthYearLabel = document.getElementById('cal-month-year-label');
  const calendarDaysBody = document.getElementById('calendar-days-body');

  const trayNetworkBtn = document.getElementById('tray-network-btn');
  const winNetwork = document.getElementById('win-network');
  const networkCloseBtn = document.getElementById('network-close-btn');

  // Master Volume Controls
  if (trayVolumeBtn && trayVolumePopup) {
    trayVolumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      trayVolumePopup.classList.toggle('open');
      playSound('click');
    });

    if (trayVolSlider) {
      trayVolSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        systemVolume = val / 100;
        if (trayVolLabel) trayVolLabel.textContent = `${val}%`;
        if (trayVolMute && trayVolMute.checked) {
          trayVolMute.checked = false;
          isSystemMuted = false;
        }
        updateVolumeIcon();
        playSound('click');
      });
    }

    if (trayVolMute) {
      trayVolMute.addEventListener('change', (e) => {
        isSystemMuted = e.target.checked;
        updateVolumeIcon();
        playSound('click');
      });
    }

    function updateVolumeIcon() {
      if (!trayVolumeBtn) return;
      if (isSystemMuted || systemVolume === 0) {
        trayVolumeBtn.textContent = '🔇';
        trayVolumeBtn.title = 'Volume: Muted';
      } else if (systemVolume > 0.5) {
        trayVolumeBtn.textContent = '🔊';
        trayVolumeBtn.title = `Volume: ${Math.round(systemVolume * 100)}%`;
      } else {
        trayVolumeBtn.textContent = '🔉';
        trayVolumeBtn.title = `Volume: ${Math.round(systemVolume * 100)}%`;
      }
    }
  }

  // Dismiss Tray Popups on Outside Click
  document.addEventListener('click', (e) => {
    if (trayVolumePopup && !trayVolumePopup.contains(e.target) && e.target !== trayVolumeBtn) {
      trayVolumePopup.classList.remove('open');
    }
  });

  // Date and Time Dialog Engine
  let calCurrentDate = new Date();

  function renderCalendar(date) {
    if (!calMonthYearLabel || !calendarDaysBody) return;
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    calMonthYearLabel.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let html = '<tr>';
    let dayCount = 1;
    let nextMonthDay = 1;

    for (let i = 0; i < 42; i++) {
      if (i > 0 && i % 7 === 0) {
        html += '</tr><tr>';
      }

      if (i < firstDay) {
        const prevDay = daysInPrevMonth - (firstDay - 1 - i);
        html += `<td class="other-month">${prevDay}</td>`;
      } else if (dayCount <= daysInMonth) {
        const now = new Date();
        const isToday = dayCount === now.getDate() && month === now.getMonth() && year === now.getFullYear();
        html += `<td class="${isToday ? 'today' : ''}">${dayCount}</td>`;
        dayCount++;
      } else {
        html += `<td class="other-month">${nextMonthDay}</td>`;
        nextMonthDay++;
      }
    }
    html += '</tr>';
    calendarDaysBody.innerHTML = html;
  }

  if (trayClockBtn) {
    trayClockBtn.addEventListener('click', () => {
      openWindow('win-datetime');
      renderCalendar(calCurrentDate);
    });
  }

  if (calPrevBtn) {
    calPrevBtn.addEventListener('click', () => {
      calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
      renderCalendar(calCurrentDate);
      playSound('click');
    });
  }

  if (calNextBtn) {
    calNextBtn.addEventListener('click', () => {
      calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
      renderCalendar(calCurrentDate);
      playSound('click');
    });
  }

  if (datetimeOkBtn && winDatetime) {
    datetimeOkBtn.addEventListener('click', () => {
      closeWindow(winDatetime);
    });
  }

  // Network Status Window Engine
  if (trayNetworkBtn) {
    trayNetworkBtn.addEventListener('click', () => {
      openWindow('win-network');
    });
  }

  if (networkCloseBtn && winNetwork) {
    networkCloseBtn.addEventListener('click', () => {
      closeWindow(winNetwork);
    });
  }

  // Dynamic Ticker for Network & Digital/Analog Clock
  let sentPackets = 14280;
  let recvPackets = 48920;

  function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fullTimeStr = now.toLocaleTimeString();

    const clockTime = document.getElementById('clock-time');
    if (clockTime) clockTime.textContent = timeStr;

    const digitalClockDialog = document.getElementById('digital-clock-dialog');
    if (digitalClockDialog) digitalClockDialog.textContent = fullTimeStr;

    // Analog clock hands
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const handSecond = document.getElementById('hand-second');
    const handMinute = document.getElementById('hand-minute');
    const handHour = document.getElementById('hand-hour');

    if (handSecond) handSecond.style.transform = `rotate(${seconds * 6}deg)`;
    if (handMinute) handMinute.style.transform = `rotate(${minutes * 6 + seconds * 0.1}deg)`;
    if (handHour) handHour.style.transform = `rotate(${(hours % 12) * 30 + minutes * 0.5}deg)`;

    // Network Activity Simulation
    sentPackets += Math.floor(Math.random() * 45);
    recvPackets += Math.floor(Math.random() * 120);

    const netSent = document.getElementById('net-sent-pkts');
    const netRecv = document.getElementById('net-recv-pkts');

    if (netSent) netSent.textContent = sentPackets.toLocaleString();
    if (netRecv) netRecv.textContent = recvPackets.toLocaleString();
  }

  setInterval(updateClock, 1000);
  updateClock();


  // ------------------------------------------------------------------------
  // 8. CMD.EXE & EASTER EGGS ENGINE
  // ------------------------------------------------------------------------
  const cmdInput = document.getElementById('cmd-input');
  const terminalOutput = document.getElementById('terminal-output');

  if (cmdInput && terminalOutput) {
    terminalOutput.innerHTML = `SSLOS Command Prompt [Version 2.3.2600]
(C) Copyright 2026 Seung Sik (Daniel) Lee. All rights reserved.

C:\\SSLOS> Type 'help' for available commands.
`;

    cmdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const command = cmdInput.value.trim();
        cmdInput.value = '';
        if (!command) return;

        terminalOutput.innerHTML += `<div><span style="color:#ffffff;">C:\\SSLOS&gt;</span> ${command}</div>`;
        handleCommand(command.toLowerCase());
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
      }
    });

    function handleCommand(cmd) {
      let response = '';

      if (cmd === 'help') {
        response = `Available Commands:
  help              - Display command options
  dir / ls          - List files & folders
  cat resume.txt    - Read full resume text
  winver            - Display SSLOS version dialog
  sudo hire daniel  - [SECRET] Candidate hiring authorization
  matrix            - [SECRET] Launch digital code waterfall
  tree              - Render project directory tree
  cls / clear       - Clear screen`;
      } else if (cmd === 'dir' || cmd === 'ls') {
        response = ` Directory of C:\\SSLOS\n\n<DIR>          Projects\n<DIR>          VS Code\n-a---          resume.pdf\n-a---          bio.txt\n-a---          kitkatch.exe`;
      } else if (cmd === 'cat resume.txt' || cmd === 'cat resume.pdf' || cmd === 'resume') {
        openWindow('win-resume');
        response = 'Opening Resume.pdf viewer window...';
      } else if (cmd === 'winver') {
        openWindow('win-winver');
        response = 'Opening About SSLOS dialog...';
      } else if (cmd === 'sudo hire daniel') {
        response = `================================================
[ACCESS GRANTED]
Candidate Status: HIRED 🚀
Name: Seung Sik (Daniel) Lee
Phone: +1 (858) 209-8444
Email: seungsik.daniel.lee@gmail.com
LinkedIn: linkedin.com/in/ssiklee
================================================`;
      } else if (cmd === 'matrix') {
        startMatrixEffect();
        response = 'Matrix code effect activated! (Type "cls" or refresh to reset)';
      } else if (cmd === 'tree') {
        response = `C:\\SSLOS
├── 📜 Resume.pdf
├── 📁 Projects
│   ├── 📁 Zoho Data Automation Tool
│   ├── 📁 YOLO Object Detection
│   ├── 📁 UE5 Roguelite Game
│   ├── 📁 AWS Cloud Portfolio
│   └── 📁 US Modules Maintenance
├── 📝 VS Code
└── ⚡ cmd.exe`;
      } else if (cmd === 'cat bio.txt' || cmd === 'bio') {
        response = `[BIO - SEUNG SIK LEE]\nDegree: B.S. Computer Engineering @ Texas A&M (Graduated May 2026)\nRole: Software Systems Eng Tech @ US Modules | Past: Data Analytics Intern @ KW Internationals`;
      } else if (cmd === 'cls' || cmd === 'clear') {
        terminalOutput.innerHTML = '';
        return;
      } else {
        response = `'${cmd}' is not recognized. Type 'help' for options.`;
      }

      terminalOutput.innerHTML += `<div style="color: #a0c0e8; margin-bottom: 6px;">${response}</div>`;
    }
  }

  // Matrix Effect Canvas
  function startMatrixEffect() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    canvas.classList.add('active');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00FF66';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    setInterval(draw, 33);
  }

  // Initial Taskbar Setup
  updateTaskbar();

  // ------------------------------------------------------------------------
  // TURN OFF COMPUTER — SHUTDOWN SEQUENCE
  // ------------------------------------------------------------------------
  document.getElementById('start-power-btn')?.addEventListener('click', () => {
    // Close start menu if open
    document.getElementById('start-menu')?.classList.remove('open');

    const screen    = document.getElementById('shutdown-screen');
    const fill      = document.getElementById('shutdown-progress-fill');
    const statusEl  = document.getElementById('shutdown-status');

    if (!screen || !fill || !statusEl) return;

    // Play a closing sound
    playSound('close');

    // Activate overlay (fade in)
    screen.classList.add('active');

    // Status messages that cycle like a real XP shutdown
    const messages = [
      'Saving your settings...',
      'Closing all programs...',
      'Logging off...',
      'Shutting down SSLOS...',
      'Goodbye, and thanks for visiting! 👋'
    ];

    let step = 0;
    const totalSteps = messages.length;

    function nextStep() {
      if (step >= totalSteps) {
        // Attempt to close the tab
        window.close();
        // Fallback: if browser blocked close, show a message
        setTimeout(() => {
          if (!window.closed) {
            statusEl.textContent = 'You may now close this tab.';
          }
        }, 400);
        return;
      }
      statusEl.textContent = messages[step];
      fill.style.width = `${Math.round(((step + 1) / totalSteps) * 100)}%`;
      step++;
      setTimeout(nextStep, step === totalSteps ? 900 : 700);
    }

    // Small delay before starting so the fade-in completes first
    setTimeout(nextStep, 500);
  });

  // Muhan Maesu App Refresh Toolbar Handler
  const muhanRefreshBtn = document.getElementById('muhan-maesu-refresh-btn');
  const muhanIframe = document.getElementById('muhan-maesu-iframe');
  if (muhanRefreshBtn && muhanIframe) {
    muhanRefreshBtn.addEventListener('click', () => {
      muhanIframe.src = 'https://muhan-maesu.onrender.com/';
      playSound('click');
    });
  }

  // ------------------------------------------------------------------------
  // DATING DAY COUNTER ENGINE & CELEBRATION PARTICLES FOR my ❤️
  // ------------------------------------------------------------------------
  const INLINE_START_DATE = new Date('2023-11-10T00:00:00');

  function calculateDaysDatingInline() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDayStart = new Date(INLINE_START_DATE.getFullYear(), INLINE_START_DATE.getMonth(), INLINE_START_DATE.getDate());
    const diffTime = todayStart.getTime() - startDayStart.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  window.updateInlineDatingCounter = function() {
    const days = calculateDaysDatingInline();
    const display = document.getElementById('inlineDayCounter');
    if (display) display.textContent = days.toLocaleString();

    const banner = document.getElementById('inlineMilestoneBanner');
    const text = document.getElementById('inlineMilestoneText');
    if (banner && text) {
      let message = '';
      if (days % 1000 === 0) message = `🎉 Happy ${days.toLocaleString()}th Day Milestone! 🎉`;
      else if (days % 500 === 0) message = `✨ Spectacular ${days.toLocaleString()} Days Together! ✨`;
      else if (days % 100 === 0) message = `💖 Cheers to ${days.toLocaleString()} Days! 💖`;
      else if (days % 365 === 0) message = `🥂 Happy ${days / 365} Year Anniversary! 🥂`;

      if (message) {
        banner.style.display = 'inline-flex';
        text.textContent = message;
      }
    }
  };
  window.updateInlineDatingCounter();

  // Canvas Particles
  const inlineCanvas = document.getElementById('myHeartFxCanvas');
  let inlineParticles = [];

  function resizeInlineCanvas() {
    if (inlineCanvas && inlineCanvas.parentElement) {
      inlineCanvas.width = inlineCanvas.parentElement.clientWidth || 700;
      inlineCanvas.height = inlineCanvas.parentElement.clientHeight || 500;
    }
  }

  if (inlineCanvas) {
    const ctx = inlineCanvas.getContext('2d');
    window.addEventListener('resize', resizeInlineCanvas);
    setTimeout(resizeInlineCanvas, 200);

    class InlineParticle {
      constructor(x, y, color, type = 'spark') {
        this.x = x; 
        this.y = y; 
        this.color = color; 
        this.type = type;
        const angle = Math.random() * Math.PI * 2;
        
        if (type === 'spark') {
          const speed = Math.random() * 12 + 4;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed;
          this.gravity = 0.12;
          this.friction = 0.965;
          this.alpha = 1;
          this.decay = Math.random() * 0.012 + 0.006;
          this.size = Math.random() * 5 + 3;
        } else {
          const speed = Math.random() * 3 + 1.5;
          this.vx = (Math.random() - 0.5) * 3;
          this.vy = Math.random() * 2 + 1.2;
          this.gravity = 0.035;
          this.friction = 0.99;
          this.alpha = 1;
          this.decay = Math.random() * 0.003 + 0.0015;
          this.size = Math.random() * 12 + 6;
          this.rotation = Math.random() * 360;
          this.rotSpeed = (Math.random() - 0.5) * 6;
          this.wobble = Math.random() * Math.PI * 2;
          this.wobbleSpeed = Math.random() * 0.08 + 0.03;
        }
      }
      update() {
        this.vx *= this.friction; 
        this.vy *= this.friction; 
        this.vy += this.gravity;
        
        if (this.type === 'confetti' || this.type === 'heart') {
          this.wobble += this.wobbleSpeed;
          this.x += this.vx + Math.sin(this.wobble) * 1.2;
        } else {
          this.x += this.vx;
        }
        
        this.y += this.vy; 
        this.alpha -= this.decay; 
        if (this.rotation !== undefined) this.rotation += this.rotSpeed;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.translate(this.x, this.y);
        ctx.rotate(((this.rotation || 0) * Math.PI) / 180);
        
        if (this.type === 'confetti') {
          ctx.fillStyle = this.color;
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.8);
        } else if (this.type === 'heart') {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(-this.size/4, -this.size/4, this.size/4, 0, Math.PI, true);
          ctx.arc(this.size/4, -this.size/4, this.size/4, 0, Math.PI, true);
          ctx.lineTo(0, this.size/2);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = this.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = this.color;
          ctx.beginPath(); 
          ctx.arc(0, 0, this.size, 0, Math.PI * 2); 
          ctx.fill();
        }
        ctx.restore();
      }
    }

    window.triggerInlineCelebration = function(mode = 'both') {
      resizeInlineCanvas();
      const colors = ['#ff3366', '#ffd700', '#00f2fe', '#4facfe', '#ff85a2', '#ffffff', '#a855f7', '#ff6b6b', '#feca57'];
      const w = inlineCanvas.width || 700;
      const h = inlineCanvas.height || 500;
      
      if (mode === 'fireworks' || mode === 'both') {
        const cx = w / 2;
        const cy = h / 3;
        
        // Grand multi-stage fireworks barrage
        for (let i = 0; i < 110; i++) inlineParticles.push(new InlineParticle(cx, cy - 30, colors[Math.floor(Math.random() * colors.length)], 'spark'));
        
        setTimeout(() => {
          for (let i = 0; i < 90; i++) inlineParticles.push(new InlineParticle(cx - 180, cy + 40, colors[Math.floor(Math.random() * colors.length)], 'spark'));
          for (let i = 0; i < 90; i++) inlineParticles.push(new InlineParticle(cx + 180, cy + 40, colors[Math.floor(Math.random() * colors.length)], 'spark'));
        }, 180);

        setTimeout(() => {
          for (let i = 0; i < 130; i++) inlineParticles.push(new InlineParticle(cx, cy - 80, colors[Math.floor(Math.random() * colors.length)], 'spark'));
        }, 360);
      }
      
      if (mode === 'confetti' || mode === 'both') {
        // Multi-wave long-lasting fluttering confetti shower
        for (let wave = 0; wave < 3; wave++) {
          setTimeout(() => {
            for (let i = 0; i < 70; i++) {
              const x = Math.random() * w;
              const y = -10 - (Math.random() * 40);
              const color = colors[Math.floor(Math.random() * colors.length)];
              const type = Math.random() > 0.35 ? 'confetti' : 'heart';
              inlineParticles.push(new InlineParticle(x, y, color, type));
            }
          }, wave * 250);
        }
      }
      playSound('click');
    };

    function renderLoop() {
      ctx.clearRect(0, 0, inlineCanvas.width, inlineCanvas.height);
      for (let i = inlineParticles.length - 1; i >= 0; i--) {
        const p = inlineParticles[i]; p.update(); p.draw();
        if (p.alpha <= 0 || p.y > inlineCanvas.height + 20) inlineParticles.splice(i, 1);
      }
      requestAnimationFrame(renderLoop);
    }
    renderLoop();
  }

  window.addInlinePhoto = function(slot) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const boxes = document.querySelectorAll('.inline-photo-box');
          if (boxes[slot - 1]) {
            boxes[slot - 1].innerHTML = `<img src="${evt.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" alt="Photo ${slot}">`;
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // ------------------------------------------------------------------------
  // WEBCAM ASCII MIRROR LIVE WALLPAPER ENGINE (MATRIX GREEN)
  // ------------------------------------------------------------------------
  let asciiStream = null;
  let asciiAnimFrame = null;
  const asciiOverlay = document.getElementById('ascii-wallpaper-overlay');
  const asciiPre = document.getElementById('ascii-display-pre');
  const asciiVideo = document.getElementById('ascii-video-elem');
  const asciiCanvas = document.getElementById('ascii-canvas-elem');
  const ASCII_CHAR_RAMP = ' .:-=+*#%@';

  window.stopAsciiMirrorWallpaper = function() {
    if (asciiAnimFrame) {
      cancelAnimationFrame(asciiAnimFrame);
      asciiAnimFrame = null;
    }
    if (asciiStream) {
      asciiStream.getTracks().forEach(track => track.stop());
      asciiStream = null;
    }
    if (asciiOverlay) {
      asciiOverlay.classList.remove('active');
    }
  };

  window.startAsciiMirrorWallpaper = async function() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Camera access is not supported by your browser.');
      return;
    }

    try {
      window.stopAsciiMirrorWallpaper();

      asciiStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 140 }, height: { ideal: 90 }, facingMode: "user" }
      });

      if (asciiVideo) {
        asciiVideo.srcObject = asciiStream;
        await asciiVideo.play();
      }

      if (asciiOverlay) asciiOverlay.classList.add('active');

      const width = 110;
      const height = 55;
      if (asciiCanvas) {
        asciiCanvas.width = width;
        asciiCanvas.height = height;
      }
      const ctx = asciiCanvas ? asciiCanvas.getContext('2d', { willReadFrequently: true }) : null;

      function renderAsciiFrame() {
        if (!asciiStream || !ctx || !asciiVideo || !asciiOverlay.classList.contains('active')) return;

        ctx.drawImage(asciiVideo, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const pixels = imgData.data;

        let asciiStr = '';
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            const charIdx = Math.floor((brightness / 255) * (ASCII_CHAR_RAMP.length - 1));
            asciiStr += ASCII_CHAR_RAMP[charIdx];
          }
          asciiStr += '\n';
        }

        if (asciiPre) asciiPre.textContent = asciiStr;
        asciiAnimFrame = requestAnimationFrame(renderAsciiFrame);
      }

      renderAsciiFrame();
      playSound('open');
    } catch (err) {
      console.warn('Webcam permission denied or unavailable:', err);
      alert('Webcam access was denied or is unavailable. Please grant camera permission to use the Mirror wallpaper.');
      window.stopAsciiMirrorWallpaper();
    }
  };


  // ------------------------------------------------------------------------
  // 12. WINDOWS XP CLASSIC SOLITAIRE ENGINE & BOUNCING CARD VICTORY ANIMATION
  // ------------------------------------------------------------------------
  (function initSolitaire() {
    const board = document.getElementById('sol-board');
    if (!board) return;

    const stockSlot = document.getElementById('sol-stock');
    const wasteSlot = document.getElementById('sol-waste');
    const foundations = {
      H: document.getElementById('sol-f-H'),
      D: document.getElementById('sol-f-D'),
      C: document.getElementById('sol-f-C'),
      S: document.getElementById('sol-f-S')
    };
    const tableaus = Array.from({ length: 7 }, (_, i) => document.getElementById(`sol-t-${i}`));

    const scoreEl = document.getElementById('sol-score');
    const timerEl = document.getElementById('sol-timer');
    const movesEl = document.getElementById('sol-moves');

    const btnNew = document.getElementById('sol-btn-new');
    const btnUndo = document.getElementById('sol-btn-undo');
    const btnDrawMode = document.getElementById('sol-btn-draw-mode');
    const btnSolve = document.getElementById('sol-btn-solve');
    const btnVictoryDemo = document.getElementById('sol-btn-victory-demo');

    const victoryCanvas = document.getElementById('solitaire-victory-canvas');

    const SUITS = [
      { code: 'H', symbol: '♥', color: 'red' },
      { code: 'D', symbol: '♦', color: 'red' },
      { code: 'C', symbol: '♣', color: 'black' },
      { code: 'S', symbol: '♠', color: 'black' }
    ];

    const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    let drawThree = false;
    let score = 0;
    let moves = 0;
    let gameTimer = null;
    let secondsElapsed = 0;
    let isGameOver = false;

    // Piles State
    let stock = [];
    let waste = [];
    let foundationPiles = { H: [], D: [], C: [], S: [] };
    let tableauPiles = [[], [], [], [], [], [], []];
    let historyStack = [];

    // Dragging state
    let draggedCardsInfo = null;

    function createDeck() {
      const deck = [];
      SUITS.forEach(suit => {
        for (let val = 1; val <= 13; val++) {
          deck.push({
            id: `${suit.code}_${val}`,
            suit: suit.code,
            symbol: suit.symbol,
            color: suit.color,
            value: val,
            rank: RANKS[val - 1],
            faceUp: false
          });
        }
      });
      return deck;
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    function saveState() {
      const state = {
        score,
        moves,
        stock: stock.map(c => ({ ...c })),
        waste: waste.map(c => ({ ...c })),
        foundationPiles: {
          H: foundationPiles.H.map(c => ({ ...c })),
          D: foundationPiles.D.map(c => ({ ...c })),
          C: foundationPiles.C.map(c => ({ ...c })),
          S: foundationPiles.S.map(c => ({ ...c }))
        },
        tableauPiles: tableauPiles.map(pile => pile.map(c => ({ ...c })))
      };
      historyStack.push(state);
      if (historyStack.length > 20) historyStack.shift();
    }

    function undo() {
      if (historyStack.length === 0 || isGameOver) return;
      const state = historyStack.pop();
      score = state.score;
      moves = state.moves;
      stock = state.stock;
      waste = state.waste;
      foundationPiles = state.foundationPiles;
      tableauPiles = state.tableauPiles;
      updateStats();
      renderBoard();
      playSound('click');
    }

    function startTimer() {
      stopTimer();
      secondsElapsed = 0;
      updateTimerDisplay();
      gameTimer = setInterval(() => {
        secondsElapsed++;
        updateTimerDisplay();
      }, 1000);
    }

    function stopTimer() {
      if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
      }
    }

    function updateTimerDisplay() {
      if (!timerEl) return;
      const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
      const secs = (secondsElapsed % 60).toString().padStart(2, '0');
      timerEl.textContent = `${mins}:${secs}`;
    }

    function updateStats() {
      if (scoreEl) scoreEl.textContent = score;
      if (movesEl) movesEl.textContent = moves;
    }

    function startNewGame() {
      if (typeof stopVictoryAnimation === 'function') stopVictoryAnimation();
      stopTimer();
      isGameOver = false;
      score = 0;
      moves = 0;
      historyStack = [];
      updateStats();
      startTimer();

      if (victoryCanvas) {
        const ctx = victoryCanvas.getContext('2d');
        ctx.clearRect(0, 0, victoryCanvas.width, victoryCanvas.height);
        victoryCanvas.style.display = 'none';
      }

      const deck = shuffle(createDeck());

      tableauPiles = [[], [], [], [], [], [], []];
      foundationPiles = { H: [], D: [], C: [], S: [] };
      waste = [];
      stock = [];

      for (let col = 0; col < 7; col++) {
        for (let row = 0; row <= col; row++) {
          const card = deck.pop();
          if (row === col) card.faceUp = true;
          tableauPiles[col].push(card);
        }
      }

      stock = deck;

      renderBoard();
      playSound('open');
    }

    function renderBoard() {
      stockSlot.querySelectorAll('.sol-card').forEach(el => el.remove());
      wasteSlot.querySelectorAll('.sol-card').forEach(el => el.remove());
      Object.values(foundations).forEach(f => f.querySelectorAll('.sol-card').forEach(el => el.remove()));
      tableaus.forEach(t => t.querySelectorAll('.sol-card').forEach(el => el.remove()));

      if (stock.length > 0) {
        const topStockCard = stock[stock.length - 1];
        const cardEl = createCardDOM(topStockCard);
        stockSlot.appendChild(cardEl);
      }

      waste.forEach((card, idx) => {
        const cardEl = createCardDOM(card);
        if (drawThree && idx >= waste.length - 3) {
          const offset = (idx - (waste.length - 3)) * 14;
          cardEl.style.left = `${offset}px`;
        }
        wasteSlot.appendChild(cardEl);
      });

      Object.keys(foundationPiles).forEach(suit => {
        const pile = foundationPiles[suit];
        const slotEl = foundations[suit];
        pile.forEach(card => {
          const cardEl = createCardDOM(card);
          slotEl.appendChild(cardEl);
        });
      });

      tableauPiles.forEach((colCards, colIdx) => {
        const slotEl = tableaus[colIdx];
        let currentTop = 0;

        colCards.forEach((card, cardIdx) => {
          const cardEl = createCardDOM(card);
          cardEl.style.top = `${currentTop}px`;
          cardEl.dataset.col = colIdx;
          cardEl.dataset.cardIdx = cardIdx;

          slotEl.appendChild(cardEl);

          currentTop += card.faceUp ? 22 : 14;
        });
      });
    }

    function createCardDOM(card) {
      const el = document.createElement('div');
      el.className = `sol-card ${card.faceUp ? card.color : 'back'}`;
      el.dataset.id = card.id;

      if (card.faceUp) {
        el.innerHTML = `
          <div class="sol-card-corner-top">
            <span class="sol-card-rank">${card.rank}</span>
            <span class="sol-card-suit-sm">${card.symbol}</span>
          </div>
          <div class="sol-card-center-suit">${card.symbol}</div>
          <div class="sol-card-corner-bottom">
            <span class="sol-card-rank">${card.rank}</span>
            <span class="sol-card-suit-sm">${card.symbol}</span>
          </div>
        `;
        attachCardInteractions(el, card);
      } else {
        el.addEventListener('click', () => {
          if (stock.length > 0 && card.id === stock[stock.length - 1].id) {
            drawFromStock();
          }
        });
      }

      return el;
    }

    function drawFromStock() {
      if (isGameOver) return;
      saveState();
      moves++;

      if (stock.length === 0) {
        stock = waste.reverse().map(c => ({ ...c, faceUp: false }));
        waste = [];
      } else {
        const count = drawThree ? Math.min(3, stock.length) : 1;
        for (let i = 0; i < count; i++) {
          const card = stock.pop();
          card.faceUp = true;
          waste.push(card);
        }
      }
      updateStats();
      renderBoard();
      playSound('click');
    }

    function attachCardInteractions(cardEl, card) {
      cardEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        tryAutoMove(card);
      });

      let startX = 0, startY = 0;
      let isDragging = false;
      let draggedCardsDOM = [];
      let initialPositions = [];

      const onMouseDown = (e) => {
        if (e.button !== undefined && e.button !== 0 && e.touches === undefined) return;
        e.stopPropagation();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        startX = clientX;
        startY = clientY;

        const cardLocation = findCardLocation(card.id);
        if (!cardLocation) return;

        if (cardLocation.pileType === 'waste' && cardLocation.cardIdx !== waste.length - 1) return;
        if (cardLocation.pileType === 'foundation') return;

        let cardsToMove = [];
        if (cardLocation.pileType === 'tableau') {
          cardsToMove = tableauPiles[cardLocation.colIdx].slice(cardLocation.cardIdx);
        } else if (cardLocation.pileType === 'waste') {
          cardsToMove = [waste[waste.length - 1]];
        }

        draggedCardsInfo = {
          cards: cardsToMove,
          location: cardLocation
        };

        const onMouseMove = (moveEvt) => {
          const curX = moveEvt.touches ? moveEvt.touches[0].clientX : moveEvt.clientX;
          const curY = moveEvt.touches ? moveEvt.touches[0].clientY : moveEvt.clientY;

          const dx = curX - startX;
          const dy = curY - startY;

          if (!isDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
            isDragging = true;

            cardsToMove.forEach((c) => {
              const domEl = board.querySelector(`[data-id="${c.id}"]`);
              if (domEl) {
                domEl.classList.add('dragging');
                draggedCardsDOM.push(domEl);
                initialPositions.push({
                  top: domEl.offsetTop,
                  left: domEl.offsetLeft
                });
              }
            });
          }

          if (isDragging) {
            draggedCardsDOM.forEach((domEl, idx) => {
              domEl.style.left = `${initialPositions[idx].left + dx}px`;
              domEl.style.top = `${initialPositions[idx].top + dy}px`;
            });
          }
        };

        const onMouseUp = (upEvt) => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          document.removeEventListener('touchmove', onMouseMove);
          document.removeEventListener('touchend', onMouseUp);

          if (isDragging) {
            const dropClientX = upEvt.changedTouches ? upEvt.changedTouches[0].clientX : upEvt.clientX;
            const dropClientY = upEvt.changedTouches ? upEvt.changedTouches[0].clientY : upEvt.clientY;

            handleCardDrop(dropClientX, dropClientY);

            draggedCardsDOM.forEach((domEl) => domEl.classList.remove('dragging'));
            draggedCardsDOM = [];
            initialPositions = [];
            isDragging = false;
          }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onMouseMove, { passive: false });
        document.addEventListener('touchend', onMouseUp);
      };

      cardEl.addEventListener('mousedown', onMouseDown);
      cardEl.addEventListener('touchstart', onMouseDown, { passive: false });
    }

    function findCardLocation(cardId) {
      if (waste.length > 0 && waste[waste.length - 1].id === cardId) {
        return { pileType: 'waste', cardIdx: waste.length - 1 };
      }
      for (let s in foundationPiles) {
        const p = foundationPiles[s];
        if (p.length > 0 && p[p.length - 1].id === cardId) {
          return { pileType: 'foundation', suit: s, cardIdx: p.length - 1 };
        }
      }
      for (let c = 0; c < 7; c++) {
        const p = tableauPiles[c];
        const idx = p.findIndex(card => card.id === cardId);
        if (idx !== -1) {
          return { pileType: 'tableau', colIdx: c, cardIdx: idx };
        }
      }
      return null;
    }

    function tryAutoMove(card) {
      if (isGameOver) return;
      const loc = findCardLocation(card.id);
      if (!loc) return;

      if (loc.pileType === 'waste' || (loc.pileType === 'tableau' && loc.cardIdx === tableauPiles[loc.colIdx].length - 1)) {
        for (let s in foundationPiles) {
          if (canMoveToFoundation(card, s)) {
            executeMove(loc, { pileType: 'foundation', suit: s }, [card]);
            return;
          }
        }
      }

      const cardsToMove = loc.pileType === 'tableau' ? tableauPiles[loc.colIdx].slice(loc.cardIdx) : [card];
      for (let targetCol = 0; targetCol < 7; targetCol++) {
        if (loc.pileType === 'tableau' && loc.colIdx === targetCol) continue;
        if (canMoveToTableau(cardsToMove[0], targetCol)) {
          executeMove(loc, { pileType: 'tableau', colIdx: targetCol }, cardsToMove);
          return;
        }
      }
    }

    function handleCardDrop(clientX, clientY) {
      if (!draggedCardsInfo) return;
      const { cards, location } = draggedCardsInfo;
      const leadCard = cards[0];

      const elementsUnder = document.elementsFromPoint(clientX, clientY);

      if (cards.length === 1) {
        for (let el of elementsUnder) {
          const fSlot = el.closest('.foundation-slot');
          if (fSlot) {
            const suit = fSlot.dataset.suit;
            if (canMoveToFoundation(leadCard, suit)) {
              executeMove(location, { pileType: 'foundation', suit }, cards);
              return;
            }
          }
        }
      }

      for (let el of elementsUnder) {
        const tSlot = el.closest('.tableau-slot');
        if (tSlot) {
          const colIdx = parseInt(tSlot.dataset.col, 10);
          if (location.pileType === 'tableau' && location.colIdx === colIdx) continue;
          if (canMoveToTableau(leadCard, colIdx)) {
            executeMove(location, { pileType: 'tableau', colIdx }, cards);
            return;
          }
        }
      }

      renderBoard();
    }

    function canMoveToFoundation(card, suit) {
      if (card.suit !== suit) return false;
      const targetPile = foundationPiles[suit];
      if (targetPile.length === 0) return card.value === 1;
      const topCard = targetPile[targetPile.length - 1];
      return card.value === topCard.value + 1;
    }

    function canMoveToTableau(card, targetColIdx) {
      const targetPile = tableauPiles[targetColIdx];
      if (targetPile.length === 0) return card.value === 13;
      const topCard = targetPile[targetPile.length - 1];
      return topCard.faceUp && card.color !== topCard.color && card.value === topCard.value - 1;
    }

    function executeMove(sourceLoc, destLoc, cards) {
      saveState();
      moves++;

      if (sourceLoc.pileType === 'waste') {
        waste.pop();
      } else if (sourceLoc.pileType === 'foundation') {
        foundationPiles[sourceLoc.suit].pop();
      } else if (sourceLoc.pileType === 'tableau') {
        tableauPiles[sourceLoc.colIdx].splice(sourceLoc.cardIdx, cards.length);
        const sourceCol = tableauPiles[sourceLoc.colIdx];
        if (sourceCol.length > 0 && !sourceCol[sourceCol.length - 1].faceUp) {
          sourceCol[sourceCol.length - 1].faceUp = true;
          score += 5;
        }
      }

      if (destLoc.pileType === 'foundation') {
        foundationPiles[destLoc.suit].push(cards[0]);
        score += 10;
      } else if (destLoc.pileType === 'tableau') {
        tableauPiles[destLoc.colIdx].push(...cards);
        if (sourceLoc.pileType === 'waste') score += 5;
      }

      updateStats();
      renderBoard();
      playSound('open');

      checkWinCondition();
    }

    function checkWinCondition() {
      let totalFoundationCards = 0;
      Object.values(foundationPiles).forEach(p => totalFoundationCards += p.length);

      if (totalFoundationCards === 52) {
        triggerVictoryAnimation();
      }
    }

    function autoSolveGame() {
      if (isGameOver) return;
      let unrevealed = 0;
      tableauPiles.forEach(col => col.forEach(c => { if (!c.faceUp) unrevealed++; }));
      if (unrevealed > 0) {
        alert('Flip all face-down cards first before auto-playing!');
        return;
      }

      let stepCount = 0;
      const solveInterval = setInterval(() => {
        let movedAny = false;
        if (waste.length > 0) {
          const wCard = waste[waste.length - 1];
          for (let s in foundationPiles) {
            if (canMoveToFoundation(wCard, s)) {
              executeMove({ pileType: 'waste' }, { pileType: 'foundation', suit: s }, [wCard]);
              movedAny = true;
              break;
            }
          }
        }

        if (!movedAny) {
          for (let col = 0; col < 7; col++) {
            const p = tableauPiles[col];
            if (p.length > 0) {
              const topCard = p[p.length - 1];
              for (let s in foundationPiles) {
                if (canMoveToFoundation(topCard, s)) {
                  executeMove({ pileType: 'tableau', colIdx: col, cardIdx: p.length - 1 }, { pileType: 'foundation', suit: s }, [topCard]);
                  movedAny = true;
                  break;
                }
              }
            }
            if (movedAny) break;
          }
        }

        let currentTotal = 0;
        Object.values(foundationPiles).forEach(p => currentTotal += p.length);

        if (!movedAny || currentTotal === 52 || stepCount > 60) {
          clearInterval(solveInterval);
          if (currentTotal === 52) triggerVictoryAnimation();
        }
        stepCount++;
      }, 100);
    }

    // ------------------------------------------------------------------------
    // CLASSIC WINDOWS SOLITAIRE VICTORY CARD CASCADE ANIMATION ENGINE (LIGHTWEIGHT)
    // ------------------------------------------------------------------------
    let currentAnimFrameId = null;

    function stopVictoryAnimation() {
      if (currentAnimFrameId) {
        cancelAnimationFrame(currentAnimFrameId);
        currentAnimFrameId = null;
      }
      if (victoryCanvas) {
        const ctx = victoryCanvas.getContext('2d');
        ctx.clearRect(0, 0, victoryCanvas.width, victoryCanvas.height);
        victoryCanvas.style.display = 'none';
      }
    }

    function triggerVictoryAnimation() {
      stopVictoryAnimation();
      isGameOver = true;
      stopTimer();
      playSound('open');

      if (!victoryCanvas) return;
      victoryCanvas.style.display = 'block';
      victoryCanvas.width = board.offsetWidth;
      victoryCanvas.height = board.offsetHeight;

      const ctx = victoryCanvas.getContext('2d');
      ctx.clearRect(0, 0, victoryCanvas.width, victoryCanvas.height);

      const CARD_W = Math.min(78, victoryCanvas.width / 8);
      const CARD_H = Math.min(110, victoryCanvas.height / 4);

      // Lightweight cascade deck: 16 cards (4 per suit) for fast, smooth, lag-free performance
      const cascadeCards = [];
      const suitsOrder = ['H', 'D', 'C', 'S'];

      for (let val = 13; val >= 1; val -= 3) {
        suitsOrder.forEach(suitCode => {
          const sObj = SUITS.find(s => s.code === suitCode);
          const fSlot = foundations[suitCode];
          const rect = fSlot ? fSlot.getBoundingClientRect() : null;
          const boardRect = board.getBoundingClientRect();

          let startX = rect ? (rect.left - boardRect.left) : (victoryCanvas.width / 2);
          let startY = rect ? (rect.top - boardRect.top) : 20;

          cascadeCards.push({
            suit: sObj.symbol,
            color: sObj.color,
            rank: RANKS[val - 1],
            x: startX,
            y: startY,
            vx: (Math.random() - 0.5) * 12,
            vy: -(Math.random() * 5 + 3),
            bounces: 0
          });
        });
      }

      let currentCardIndex = 0;
      let activeBouncingCards = [];
      let framesSinceLastLaunch = 0;

      function drawCardOnCanvas(c) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#777777';
        ctx.lineWidth = 1;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(c.x, c.y, CARD_W, CARD_H, 5);
        } else {
          ctx.rect(c.x, c.y, CARD_W, CARD_H);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = c.color === 'red' ? '#e81123' : '#111111';
        ctx.font = 'bold 12px "Segoe UI", Tahoma, sans-serif';
        ctx.fillText(c.rank, c.x + 5, c.y + 15);
        ctx.font = '10px sans-serif';
        ctx.fillText(c.suit, c.x + 5, c.y + 26);

        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.suit, c.x + CARD_W / 2, c.y + CARD_H / 2);

        ctx.restore();
      }

      function renderCascade() {
        // Auto-kill animation if window is minimized or closed
        const solWin = document.getElementById('win-solitaire');
        if (solWin && (solWin.classList.contains('closed') || solWin.classList.contains('minimized'))) {
          stopVictoryAnimation();
          return;
        }

        framesSinceLastLaunch++;

        if (currentCardIndex < cascadeCards.length && (framesSinceLastLaunch > 8 || activeBouncingCards.length === 0)) {
          activeBouncingCards.push(cascadeCards[currentCardIndex]);
          currentCardIndex++;
          framesSinceLastLaunch = 0;
        }

        for (let i = activeBouncingCards.length - 1; i >= 0; i--) {
          const c = activeBouncingCards[i];

          drawCardOnCanvas(c);

          c.x += c.vx;
          c.y += c.vy;
          c.vy += 0.8; // Gravity

          if (c.y + CARD_H >= victoryCanvas.height) {
            c.y = victoryCanvas.height - CARD_H;
            c.vy = -Math.abs(c.vy) * 0.75; // Elastic bounce
            c.bounces++;
          }

          if (c.bounces > 4 || c.x < -CARD_W * 2 || c.x > victoryCanvas.width + CARD_W * 2) {
            activeBouncingCards.splice(i, 1);
          }
        }

        if (currentCardIndex < cascadeCards.length || activeBouncingCards.length > 0) {
          currentAnimFrameId = requestAnimationFrame(renderCascade);
        } else {
          currentAnimFrameId = null;
          setTimeout(() => {
            alert(`🎉 CONGRATULATIONS! YOU WON SOLITAIRE!\n\nFinal Score: ${score}\nTime: ${timerEl ? timerEl.textContent : '00:00'}\nMoves: ${moves}`);
          }, 300);
        }
      }

      currentAnimFrameId = requestAnimationFrame(renderCascade);
    }

    if (btnNew) btnNew.addEventListener('click', startNewGame);
    if (btnUndo) btnUndo.addEventListener('click', undo);
    if (btnDrawMode) btnDrawMode.addEventListener('click', () => {
      drawThree = !drawThree;
      btnDrawMode.textContent = drawThree ? '🎴 Draw 3' : '🎴 Draw 1';
      startNewGame();
    });
    if (btnSolve) btnSolve.addEventListener('click', autoSolveGame);
    if (btnVictoryDemo) btnVictoryDemo.addEventListener('click', () => {
      SUITS.forEach(suit => {
        foundationPiles[suit.code] = [];
        for (let v = 1; v <= 13; v++) {
          foundationPiles[suit.code].push({
            id: `${suit.code}_${v}`,
            suit: suit.code,
            symbol: suit.symbol,
            color: suit.color,
            value: v,
            rank: RANKS[v - 1],
            faceUp: true
          });
        }
      });
      renderBoard();
      triggerVictoryAnimation();
    });
    if (stockSlot) stockSlot.addEventListener('click', drawFromStock);

    startNewGame();
  })();
});

