/**
 * DANIELOS — WINDOWS XP-INSPIRED PORTFOLIO DESKTOP ENGINE
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
  sessionStorage.setItem('danielos_booted', 'true');
};

document.addEventListener('DOMContentLoaded', () => {
  let highestZIndex = 500;
  let systemVolume = 0.8;
  let isSystemMuted = false;

  // Web Audio API Synthesizer for XP Sounds
  function playSound(type = 'click') {
    if (isSystemMuted || systemVolume <= 0) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

  if (sessionStorage.getItem('danielos_booted') === 'true') {
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
    highestZIndex += 1;
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
    // PowerShell terminal always opens maximised so all content is comfortably visible
    if (winId === 'win-terminal') {
      win.classList.add('maximized');
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
    win.addEventListener('mousedown', () => bringToFront(win));
    win.addEventListener('touchstart', () => bringToFront(win), { passive: true });

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

    if (titlebar) {
      titlebar.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('win-btn')) return;
        isDragging = true;
        dragOffsetX = e.clientX - win.offsetLeft;
        dragOffsetY = e.clientY - win.offsetTop;
        bringToFront(win);
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging || win.classList.contains('maximized')) return;
        win.style.left = `${Math.max(0, e.clientX - dragOffsetX)}px`;
        win.style.top = `${Math.max(0, e.clientY - dragOffsetY)}px`;
      });

      document.addEventListener('mouseup', () => { isDragging = false; });
    }

    // 8-Direction Window Resizer
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
        e.preventDefault();
        isResizing = true;
        bringToFront(win);

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

          const minW = 320;
          const minH = 200;

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


  // ------------------------------------------------------------------------
  // 3. DRAGGABLE DESKTOP ICONS (ALIGN TO GRID ENGINE)
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

    icon.addEventListener('mousedown', (e) => {
      desktopIcons.forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
      icon.classList.add('dragging');
      isDraggingIcon = true;
      iconOffsetX = e.clientX - icon.offsetLeft;
      iconOffsetY = e.clientY - icon.offsetTop;
      playSound('click');
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDraggingIcon) return;
      icon.style.left = `${Math.max(0, e.clientX - iconOffsetX)}px`;
      icon.style.top = `${Math.max(0, e.clientY - iconOffsetY)}px`;
    });

    document.addEventListener('mouseup', () => {
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
    });

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
      document.documentElement.style.setProperty('--current-wallpaper', 'var(--wp-hills)');
      contextMenu.classList.remove('open');
    });

    document.getElementById('ctx-wp-bliss')?.addEventListener('click', () => {
      document.documentElement.style.setProperty('--current-wallpaper', 'var(--wp-bliss)');
      contextMenu.classList.remove('open');
    });

    document.getElementById('ctx-wp-cyber')?.addEventListener('click', () => {
      document.documentElement.style.setProperty('--current-wallpaper', 'var(--wp-cyber)');
      contextMenu.classList.remove('open');
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
    terminalOutput.innerHTML = `DanielOS Command Prompt [Version 2.3.2600]
(C) Copyright 2026 Seung Sik (Daniel) Lee. All rights reserved.

C:\\DanielOS> Type 'help' for available commands.
`;

    cmdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const command = cmdInput.value.trim();
        cmdInput.value = '';
        if (!command) return;

        terminalOutput.innerHTML += `<div><span style="color:#ffffff;">C:\\DanielOS&gt;</span> ${command}</div>`;
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
  winver            - Display DanielOS version dialog
  sudo hire daniel  - [SECRET] Candidate hiring authorization
  matrix            - [SECRET] Launch digital code waterfall
  tree              - Render project directory tree
  cls / clear       - Clear screen`;
      } else if (cmd === 'dir' || cmd === 'ls') {
        response = ` Directory of C:\\DanielOS\n\n<DIR>          Projects\n<DIR>          VS Code\n-a---          resume.pdf\n-a---          bio.txt\n-a---          kitkatch.exe`;
      } else if (cmd === 'cat resume.txt' || cmd === 'cat resume.pdf' || cmd === 'resume') {
        openWindow('win-resume');
        response = 'Opening Resume.pdf viewer window...';
      } else if (cmd === 'winver') {
        openWindow('win-winver');
        response = 'Opening About DanielOS dialog...';
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
        response = `C:\\DanielOS
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
      'Shutting down DanielOS...',
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
});
