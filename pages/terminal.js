/**
 * Windows PowerShell Interactive CLI Terminal Engine
 * For Daniel Lee (Seung Sik Lee) Portfolio — pages/terminal.js
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const terminalWindow  = document.getElementById('terminal-window');
  const terminalBody    = document.getElementById('terminal-body');
  const terminalOutput  = document.getElementById('terminal-output');
  const cmdInput        = document.getElementById('cmd-input');
  const promptString    = document.getElementById('prompt-string');
  const statusPwd       = document.getElementById('status-pwd');
  const statusItems     = document.getElementById('status-items');
  const themeSelect     = document.getElementById('theme-select');
  const crtToggle       = document.getElementById('crt-toggle');
  const windowTitle     = document.getElementById('window-title');

  const btnMin   = document.getElementById('btn-min');
  const btnMax   = document.getElementById('btn-max');
  const btnClose = document.getElementById('btn-close');

  // Terminal State
  let currentPath    = ['C:', 'Users', 'DanielLee'];
  let commandHistory = [];
  let historyIndex   = -1;

  // ASCII Art
  const ASCII_ART = {
    header: `
 ___  ___  _ _  _  ___  _       _    ___  ___ 
| . \\| . || \\ || || __>| |     | |  | __>| __>
| | ||   ||   || || _> | |_    | |_ | _> | _> 
|___/|_|_||_\\_||_||___>|___|   |___||___>|___>

 Windows PowerShell - Interactive Portfolio Shell [v10.0.19045]
 (c) Daniel Lee. B.S. Computer Engineering (Math Minor) @ Texas A&M University.
 Engineering Technician Intern @ US Modules.
`,
    avatar: `
        .----------------------------.
        |   DANIEL LEE - AVATAR      |
        '----------------------------'
                   ______
                .-"      "-.
               /            \\
              |              |
              |,  .-.  .-.  ,|
              | )(__/  \\__)( |
             /|     /\\     |\\
            (_|    /  \\    |_)
              |   \\____/   |
              |            |
              '\\          /'
                '-.____.-'
         B.S. Computer Engineering
             Math Minor @ TAMU
          Engineering Tech @ US Modules
`,
    tamu: `
  _______   _   __  ____  _   _ 
 |__   __| / \\ |  \\/  | || | | |
    | |   / _ \\| |\\/| | || | | |
    | |  / ___ \\ |  | | || |_| |
    |_| /_/   \\_\\_|  |_|\\_\\___/ 
      ATM - TEXAS A&M UNIVERSITY
`
  };

  // Virtual File System
  const vfs = {
    'C:': {
      type: 'dir',
      children: {
        'Users': {
          type: 'dir',
          children: {
            'DanielLee': {
              type: 'dir',
              children: {
                'bio.txt': {
                  type: 'file', size: '1.4 KB',
                  content: `[BIO - DANIEL LEE]
Name: Seung Sik (Daniel) Lee
Degree: B.S. Computer Engineering, Minor in Mathematics @ Texas A&M University (Graduated)
Current Role: Engineering Technician Intern @ US Modules
Location: College Station, TX / US Modules

About Me:
Graduated from Texas A&M University in Computer Engineering with a Mathematics Minor.
Currently interning at US Modules as an Engineering Technician, improving and optimizing
a custom Computerized Maintenance Management System (CMMS).

Passionate about full-stack web applications, low-level C++ rendering engines,
mathematical problem solving, and industrial software systems.`
                },
                'skills.json': {
                  type: 'file', size: '520 B',
                  content: `{
  "languages":        ["C++", "C", "Python", "TypeScript", "JavaScript", "SQL", "HTML/CSS"],
  "math_engineering": ["Discrete Math", "Linear Algebra", "Numerical Analysis", "Probability"],
  "cmms_web":         ["CMMS System Maintenance", "Node.js", "Express", "PostgreSQL", "React", "REST APIs"],
  "graphics_embedded":["OpenGL", "Raytracing", "OBJ Mesh Pipelines", "LiDAR ToF", "SPI/UART"],
  "tools":            ["Git", "Linux", "VS Code", "Unreal Engine 5", "PowerShell"]
}`
                },
                'avatar.asc': { type: 'file', size: '920 B', content: ASCII_ART.avatar },
                'readme.txt': {
                  type: 'file', size: '640 B',
                  content: `WELCOME TO DANIEL LEE'S POWERSHELL PORTFOLIO!
------------------------------------------------
Navigation Quick Reference:
  - Type 'help'             — View all commands
  - Type 'ls' or 'dir'     — List directory contents
  - Type 'cd pages'        — Enter the pages directory
  - Type 'open pages/projects.html' — Open Projects page
  - Type 'cat bio.txt'     — View bio file
  - Click any [ command ] button above or any file link!`
                },
                'pages': {
                  type: 'dir',
                  children: {
                    'home.html':     { type: 'file', isHtmlPage: true, url: 'home.html',     size: '2.5 KB', description: 'Terminal Portfolio Home Page' },
                    'about.html':    { type: 'file', isHtmlPage: true, url: 'about.html',    size: '3.3 KB', description: 'About Daniel Lee — TAMU Engineering Graduate' },
                    'projects.html': { type: 'file', isHtmlPage: true, url: 'projects.html', size: '4.8 KB', description: 'Projects — CMMS, C++ Raytracer, LiDAR Scanner' },
                    'contact.html':  { type: 'file', isHtmlPage: true, url: 'contact.html',  size: '2.1 KB', description: 'Contact Details, Email & Social Profiles' }
                  }
                },
                'projects': {
                  type: 'dir',
                  children: {
                    'cmms-system.txt': {
                      type: 'file', size: '1.6 KB',
                      content: `PROJECT: US Modules CMMS System Enhancements
------------------------------------------------
Role: Engineering Technician Intern @ US Modules
Description: Improving and optimizing a custom Computerized Maintenance Management System
(CMMS) created by the Engineering Team Lead. Streamlining equipment tracking, maintenance
scheduling, and collaborating on upcoming industrial engineering projects.`
                    },
                    'raytracer.txt': {
                      type: 'file', size: '1.8 KB',
                      content: `PROJECT: C++ Raytracer & 3D Engine
------------------------------------------------
Stack: C++17, GLSL, Linear Algebra
Description: Software raytracer built from scratch. Features ray-sphere and ray-triangle
intersection routines, OBJ mesh loading, Phong lighting model, reflections,
and BVH acceleration tree.
Repository: https://github.com/danielsslee`
                    },
                    'lidar-scan.txt': {
                      type: 'file', size: '1.4 KB',
                      content: `PROJECT: LiDAR 3D Spatial Scanner
------------------------------------------------
Stack: C/C++, Microcontroller, ToF LiDAR, Serial UART
Description: Hardware-software system that acquires distance point clouds via ToF LiDAR
sensor and streams spatial coordinates over UART to generate 3D point cloud maps.`
                    },
                    'kitkatch-game.txt': {
                      type: 'file', size: '1.5 KB',
                      content: `PROJECT: KitKatch (Indie Game on itch.io)
------------------------------------------------
Playable Link: https://kitkatch.itch.io/kitkatch
Tags: Game Development, Game Design, Itch.io
Description: Interactive indie game published on itch.io featuring custom gameplay
mechanics, fluid movement systems, and engaging level design.`
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  // Helpers
  function getPathString() { return currentPath.join('\\'); }

  function getDirectoryNode(pathArray = currentPath) {
    let curr = vfs;
    for (const part of pathArray) {
      if (curr && curr[part]) curr = curr[part];
      else if (curr && curr.type === 'dir' && curr.children && curr.children[part]) curr = curr.children[part];
      else return null;
    }
    return curr;
  }

  function updateStatus() {
    const pwdStr = getPathString();
    if (promptString)  promptString.textContent = `PS ${pwdStr}>`;
    if (statusPwd)     statusPwd.textContent = pwdStr;
    if (windowTitle)   windowTitle.textContent = `Windows PowerShell — Daniel Lee [${pwdStr}]`;

    const currNode = getDirectoryNode();
    if (currNode && currNode.type === 'dir' && currNode.children) {
      const count = Object.keys(currNode.children).length;
      if (statusItems) statusItems.textContent = `${count} item${count === 1 ? '' : 's'}`;
    } else {
      if (statusItems) statusItems.textContent = '0 items';
    }
  }

  function appendOutput(content, isHtml = false) {
    if (!terminalOutput) return;
    const block = document.createElement('div');
    block.className = 'output-block';
    if (isHtml) block.innerHTML = content;
    else        block.textContent = content;
    terminalOutput.appendChild(block);
    scrollToBottom();
  }

  function appendPromptCommand(cmdText) {
    if (!terminalOutput) return;
    const row = document.createElement('div');
    row.className = 'prompt-row';
    row.innerHTML = `<span class="prompt-string">PS ${getPathString()}&gt;</span> <span class="cmd-text">${escapeHtml(cmdText)}</span>`;
    terminalOutput.appendChild(row);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function scrollToBottom() {
    if (terminalBody) terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  // Navigation
  function navigateToDirectory(targetPath) {
    targetPath = targetPath.trim().replace(/\//g, '\\');

    if (targetPath === '~' || targetPath === '\\') {
      currentPath = ['C:', 'Users', 'DanielLee'];
      updateStatus();
      return true;
    }

    let segments = targetPath.split('\\').filter(Boolean);
    let newPath = [];

    if (targetPath.startsWith('C:')) { newPath = ['C:']; segments = segments.slice(1); }
    else newPath = [...currentPath];

    for (const seg of segments) {
      if (seg === '.') continue;
      if (seg === '..') { if (newPath.length > 1) newPath.pop(); continue; }
      const currDir = getDirectoryNode(newPath);
      if (currDir && currDir.type === 'dir' && currDir.children && currDir.children[seg]) {
        const targetNode = currDir.children[seg];
        if (targetNode.type === 'dir') {
          newPath.push(seg);
        } else if (targetNode.type === 'file') {
          if (targetNode.isHtmlPage) {
            appendOutput(`[Navigating to: <strong class="exe-color">${seg}</strong>]`, true);
            window.location.href = targetNode.url;
            return true;
          } else {
            appendOutput(`Cannot cd into file '${seg}'. Use 'cat ${seg}' to read it.`);
            return false;
          }
        }
      } else {
        appendOutput(`cd : Cannot find path '${targetPath}' because it does not exist.`);
        return false;
      }
    }

    currentPath = newPath;
    updateStatus();
    return true;
  }

  // Command Processor
  function processCommand(rawInput) {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    commandHistory.push(trimmed);
    historyIndex = commandHistory.length;
    appendPromptCommand(trimmed);

    const parts = trimmed.split(/\s+/);
    const cmd   = parts[0].toLowerCase();
    const args  = parts.slice(1);

    switch (cmd) {
      case 'help':                                          showHelp();                    break;
      case 'ls': case 'dir': case 'get-childitem':         listDirectory(args[0]);        break;
      case 'cd': case 'chdir': case 'set-location':
        if (!args[0]) { currentPath = ['C:', 'Users', 'DanielLee']; updateStatus(); }
        else navigateToDirectory(args[0]);
        break;
      case 'cat': case 'type': case 'view': case 'get-content': viewFile(args[0]);        break;
      case 'open': case 'launch': case 'start':            openPage(args[0]);             break;
      case 'pwd': case 'gl': case 'get-location':          appendOutput(getPathString()); break;
      case 'clear': case 'cls':                            terminalOutput.innerHTML = ''; break;
      case 'ascii':                                         showAscii(args[0]);            break;
      case 'theme':                                         changeTheme(args[0]);          break;
      case 'matrix':                                        toggleMatrix();                break;
      case 'tree':                                          showTree();                    break;
      case 'history':                                       showHistory();                 break;
      case 'echo':                                          appendOutput(args.join(' '));  break;
      case 'whoami':                                        appendOutput('daniel_lee\\computer_engineering_graduate_tamu'); break;
      default:
        if (trimmed.endsWith('.html') || trimmed.endsWith('.txt')) {
          if (!navigateToDirectory(trimmed)) {
            appendOutput(`'${cmd}' is not recognized. Type 'help' for assistance.`);
          }
        } else {
          appendOutput(`'${cmd}' is not recognized as an internal or external command. Type 'help'.`);
        }
    }

    scrollToBottom();
  }

  // Help
  function showHelp() {
    appendOutput(`
<div class="output-block">
  <strong class="prompt-path">=== DANIEL LEE TERMINAL — COMMAND GUIDE ===</strong>
  <p style="margin:4px 0 8px 0">Use PowerShell commands to navigate pages, view projects, and customize the shell.</p>
  <table class="help-table">
    <thead><tr><th>Command</th><th>Example</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><strong class="exe-color">cd</strong></td>       <td><code>cd pages/projects.html</code></td><td>Navigate into a directory or open a page file.</td></tr>
      <tr><td><strong class="exe-color">ls / dir</strong></td> <td><code>ls</code> or <code>dir pages</code></td><td>List files and subdirectories.</td></tr>
      <tr><td><strong class="exe-color">cat</strong></td>      <td><code>cat bio.txt</code></td><td>Display text file or ASCII art contents.</td></tr>
      <tr><td><strong class="exe-color">open</strong></td>     <td><code>open pages/contact.html</code></td><td>Open a portfolio page directly.</td></tr>
      <tr><td><strong class="exe-color">ascii</strong></td>    <td><code>ascii avatar</code></td><td>Render ASCII art (avatar / tamu / header).</td></tr>
      <tr><td><strong class="exe-color">theme</strong></td>    <td><code>theme matrix</code></td><td>Switch shell palette (powershell|matrix|amber|cyberpunk|dark).</td></tr>
      <tr><td><strong class="exe-color">matrix</strong></td>   <td><code>matrix</code></td><td>Toggle Matrix green rain theme.</td></tr>
      <tr><td><strong class="exe-color">tree</strong></td>     <td><code>tree</code></td><td>Show virtual directory structure.</td></tr>
      <tr><td><strong class="exe-color">clear</strong></td>    <td><code>clear</code></td><td>Clear the terminal screen.</td></tr>
      <tr><td><strong class="exe-color">whoami</strong></td>   <td><code>whoami</code></td><td>Display current user.</td></tr>
    </tbody>
  </table>
  <p style="margin-top:6px" class="muted">💡 Press <kbd>↑</kbd>/<kbd>↓</kbd> for history, <kbd>Tab</kbd> to autocomplete, <kbd>Ctrl+L</kbd> to clear.</p>
</div>`, true);
  }

  // Directory listing
  function listDirectory(targetArg) {
    let node = getDirectoryNode();
    let displayPath = getPathString();

    if (targetArg) {
      let tempPath = [...currentPath];
      if (targetArg === 'pages')    tempPath.push('pages');
      else if (targetArg === 'projects') tempPath.push('projects');
      const found = getDirectoryNode(tempPath);
      if (found && found.type === 'dir') { node = found; displayPath = tempPath.join('\\'); }
    }

    if (!node || node.type !== 'dir' || !node.children) { appendOutput('Directory not found.'); return; }

    let html = `<div class="output-block font-mono">
  <p class="muted">    Directory: <strong>${escapeHtml(displayPath)}</strong></p><br>
  <table class="dir-table"><thead><tr><th>Mode</th><th>LastWriteTime</th><th>Length</th><th>Name</th></tr></thead><tbody>`;

    for (const [name, item] of Object.entries(node.children)) {
      const isDir    = item.type === 'dir';
      const mode     = isDir ? 'd-----' : '-a----';
      const length   = isDir ? '' : (item.size || '1.0 KB');
      let nameClass  = 'file-item';
      let actionCmd  = `cat ${name}`;

      if (isDir) { nameClass = 'dir-item'; actionCmd = `cd ${name}`; }
      else if (item.isHtmlPage) { nameClass = 'file-item html-file'; actionCmd = `open ${name}`; }

      html += `<tr>
        <td class="muted">${mode}</td>
        <td class="muted">2026-07-23 11:45</td>
        <td class="muted">${length}</td>
        <td><span class="${nameClass}" data-action="${escapeHtml(actionCmd)}">${escapeHtml(name)}</span></td>
      </tr>`;
    }

    html += '</tbody></table></div>';
    appendOutput(html, true);
    attachClickHandlers();
  }

  // Cat / view file
  function viewFile(fileName) {
    if (!fileName) { appendOutput('cat : Missing file argument. Usage: cat <filename>'); return; }
    const currNode = getDirectoryNode();
    if (currNode && currNode.type === 'dir' && currNode.children && currNode.children[fileName]) {
      const f = currNode.children[fileName];
      if (f.type === 'file') {
        if (f.content) {
          appendOutput(fileName.endsWith('.asc')
            ? `<pre class="ascii-art">${escapeHtml(f.content)}</pre>`
            : f.content, fileName.endsWith('.asc'));
        } else if (f.isHtmlPage) {
          appendOutput(`[Page file detected: <strong>${fileName}</strong>] Navigating...`, true);
          window.location.href = f.url;
        }
      } else {
        appendOutput(`cat : '${fileName}' is a directory. Use 'cd ${fileName}' to open it.`);
      }
    } else {
      appendOutput(`cat : Cannot find file '${fileName}'. Type 'ls' to list files.`);
    }
  }

  // Open page
  function openPage(pageArg) {
    if (!pageArg) { window.location.href = 'about.html'; return; }
    if (pageArg.includes('/'))  window.location.href = pageArg.replace('pages/', '');
    else if (pageArg.endsWith('.html')) window.location.href = pageArg;
    else window.location.href = `${pageArg}.html`;
  }

  // ASCII art
  function showAscii(artName) {
    const key = (!artName || artName === 'avatar') ? 'avatar'
              : (artName === 'tamu' || artName === 'texas') ? 'tamu'
              : (artName === 'header' || artName === 'logo') ? 'header' : null;
    if (key) appendOutput(`<pre class="ascii-art">${escapeHtml(ASCII_ART[key])}</pre>`, true);
    else appendOutput(`Unknown art name '${artName}'. Options: avatar, tamu, header`);
  }

  // Theme changer
  function changeTheme(themeName) {
    if (!themeName) { appendOutput('Usage: theme <powershell | matrix | amber | cyberpunk | dark>'); return; }
    const validThemes = ['powershell', 'matrix', 'amber', 'cyberpunk', 'dark'];
    const selected = themeName.toLowerCase();
    if (validThemes.includes(selected)) {
      document.body.className = selected === 'powershell' ? '' : `theme-${selected}`;
      if (themeSelect) themeSelect.value = selected;
      appendOutput(`Theme switched to: <strong>${selected.toUpperCase()}</strong>`, true);
    } else {
      appendOutput(`Invalid theme. Options: powershell, matrix, amber, cyberpunk, dark`);
    }
  }

  function toggleMatrix() {
    if (document.body.classList.contains('theme-matrix')) {
      document.body.className = '';
      if (themeSelect) themeSelect.value = 'powershell';
      appendOutput('Matrix mode disabled.');
    } else {
      document.body.className = 'theme-matrix';
      if (themeSelect) themeSelect.value = 'matrix';
      appendOutput('Matrix green rain mode activated!');
    }
  }

  function showTree() {
    appendOutput(`<pre class="ascii-art">C:\\Users\\DanielLee
├── bio.txt
├── skills.json
├── avatar.asc
├── readme.txt
├── pages/
│   ├── home.html
│   ├── about.html
│   ├── projects.html
│   └── contact.html
└── projects/
    ├── cmms-system.txt
    ├── raytracer.txt
    ├── lidar-scan.txt
    └── kitkatch-game.txt</pre>`, true);
  }

  function showHistory() {
    if (commandHistory.length === 0) { appendOutput('Command history is empty.'); return; }
    let text = 'Command History:\n';
    commandHistory.forEach((c, i) => { text += `  ${i + 1}  ${c}\n`; });
    appendOutput(text);
  }

  function attachClickHandlers() {
    if (!terminalOutput) return;
    terminalOutput.querySelectorAll('[data-action]').forEach(item => {
      item.addEventListener('click', e => {
        const action = e.target.getAttribute('data-action');
        if (action && cmdInput) {
          cmdInput.value = action;
          processCommand(action);
          cmdInput.value = '';
        }
      });
    });
  }

  // Tab autocomplete
  function handleTabComplete() {
    if (!cmdInput) return;
    const val = cmdInput.value;
    if (!val) return;
    const parts    = val.split(/\s+/);
    const lastWord = parts[parts.length - 1];
    const commands = ['help','ls','dir','cd','cat','open','ascii','theme','matrix','tree','clear','pwd','whoami','history','echo'];
    const currNode = getDirectoryNode();
    let options    = [...commands];
    if (currNode && currNode.type === 'dir' && currNode.children) {
      options = options.concat(Object.keys(currNode.children));
    }
    const matches = options.filter(o => o.startsWith(lastWord));
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      cmdInput.value = parts.join(' ');
    } else if (matches.length > 1) {
      appendOutput(`Matches: ${matches.join('  ')}`);
    }
  }

  // Keyboard events
  if (cmdInput) {
    cmdInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const val = cmdInput.value;
        cmdInput.value = '';
        processCommand(val);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) { historyIndex--; cmdInput.value = commandHistory[historyIndex] || ''; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          cmdInput.value = commandHistory[historyIndex] || '';
        } else { historyIndex = commandHistory.length; cmdInput.value = ''; }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        handleTabComplete();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        if (terminalOutput) terminalOutput.innerHTML = '';
      }
    });
  }

  // Click body to focus input
  if (terminalBody && cmdInput) {
    terminalBody.addEventListener('click', () => cmdInput.focus());
  }

  // Quick Command Buttons
  document.querySelectorAll('.quick-cmd-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const cmd = e.currentTarget.getAttribute('data-cmd');
      if (cmd) processCommand(cmd);
    });
  });

  // Theme select dropdown
  if (themeSelect) {
    themeSelect.addEventListener('change', e => changeTheme(e.target.value));
  }

  // CRT Toggle
  if (crtToggle) {
    crtToggle.addEventListener('click', () => {
      document.body.classList.toggle('crt-disabled');
      crtToggle.textContent = `CRT: ${document.body.classList.contains('crt-disabled') ? 'OFF' : 'ON'}`;
    });
  }

  // ============================================================
  // WINDOW CONTROLS
  // ============================================================

  function minimizeTerminal() {
    if (document.getElementById('minimized-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'minimized-overlay';
    overlay.className = 'minimized-overlay';
    overlay.innerHTML = `
      <div class="minimized-box">
        <div class="minimized-icon">🗕</div>
        <h2>Windows PowerShell is Minimized</h2>
        <span class="minimized-hint">[ Click anywhere to restore ]</span>
      </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => {
      const handler = e => {
        e.stopPropagation();
        overlay.remove();
        document.removeEventListener('click', handler, true);
        if (cmdInput) cmdInput.focus();
      };
      document.addEventListener('click', handler, true);
    }, 10);
  }

  function toggleMaximize() {
    const isFS = !!document.fullscreenElement || !!document.webkitFullscreenElement;
    if (!isFS) {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen().catch(() => document.body.classList.toggle('maximized-mode'));
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else document.body.classList.toggle('maximized-mode');
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      document.body.classList.remove('maximized-mode');
    }
  }

  document.addEventListener('fullscreenchange', () => {
    const isFS = !!document.fullscreenElement;
    if (btnMax) { btnMax.setAttribute('title', isFS ? 'Restore Down' : 'Maximize'); btnMax.textContent = isFS ? '❐' : '□'; }
  });

  function closeTerminalTab() {
    window.close();
    setTimeout(() => {
      if (document.getElementById('closed-overlay')) return;
      const el = document.createElement('div');
      el.id = 'closed-overlay';
      el.className = 'closed-overlay';
      el.innerHTML = `
        <div class="closed-box">
          <div class="closed-header"><span>✕</span> Windows PowerShell — Session Closed</div>
          <p class="closed-msg">Process exited with code 0.</p>
          <p class="closed-subtext">Press <kbd>Ctrl+W</kbd> to close tab, or click below to restart.</p>
          <button id="btn-restart-session" class="btn-restart-session">⚡ Restart PowerShell Session</button>
        </div>`;
      document.body.appendChild(el);
      el.querySelector('#btn-restart-session')?.addEventListener('click', () => {
        el.remove();
        if (cmdInput) cmdInput.focus();
      });
    }, 100);
  }

  if (btnMin)   btnMin.addEventListener('click',   e => { e.preventDefault(); minimizeTerminal(); });
  if (btnMax)   btnMax.addEventListener('click',   e => { e.preventDefault(); toggleMaximize(); });
  if (btnClose) btnClose.addEventListener('click', e => { e.preventDefault(); closeTerminalTab(); });

  // ============================================================
  // BOOT — show startup header
  // ============================================================
  updateStatus();
  appendOutput(`<div class="output-block" style="color:var(--text-main);line-height:1.8">
Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

<span style="color:var(--text-muted)">Install the latest PowerShell for new features and improvements!</span>
<span style="color:var(--text-muted)">  https://aka.ms/PSWindows</span>
</div>`, true);
  if (cmdInput) cmdInput.focus();
});
