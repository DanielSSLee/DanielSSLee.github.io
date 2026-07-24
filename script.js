/**
 * Windows PowerShell Interactive CLI Terminal Engine
 * For Daniel Lee (Seung Sik Lee) Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const terminalWindow = document.getElementById('terminal-window');
  const terminalBody = document.getElementById('terminal-body');
  const terminalOutput = document.getElementById('terminal-output');
  const cmdInput = document.getElementById('cmd-input');
  const promptString = document.getElementById('prompt-string');
  const statusPwd = document.getElementById('status-pwd');
  const statusItems = document.getElementById('status-items');
  const themeSelect = document.getElementById('theme-select');
  const crtToggle = document.getElementById('crt-toggle');
  const windowTitle = document.getElementById('window-title');

  // Titlebar controls
  const btnMin = document.getElementById('btn-min');
  const btnMax = document.getElementById('btn-max');
  const btnClose = document.getElementById('btn-close');

  // Terminal State
  let currentPath = ['C:', 'Users', 'DanielLee'];
  let commandHistory = [];
  let historyIndex = -1;

  // ASCII Art Resources
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

  // Virtual File System (VFS)
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
                  type: 'file',
                  size: '1.4 KB',
                  content: `[BIO - DANIEL LEE]
Name: Seung Sik (Daniel) Lee
Degree: B.S. Computer Engineering, Minor in Mathematics @ Texas A&M University (Graduated)
Current Role: Engineering Technician Intern @ US Modules
Location: College Station, TX / US Modules

About Me:
Graduated from Texas A&M University in Computer Engineering with a Mathematics Minor. Currently interning at US Modules as an Engineering Technician, where I am improving and optimizing a custom self-made Computerized Maintenance Management System (CMMS) built by the Engineering Team Lead and collaborating on upcoming technical projects.

Passionate about full-stack web applications, low-level C++ rendering engines, mathematical problem solving, and industrial software systems.`
                },
                'skills.json': {
                  type: 'file',
                  size: '520 B',
                  content: `{
  "languages": ["C++", "C", "Python", "TypeScript", "JavaScript", "SQL", "HTML/CSS"],
  "math_engineering": ["Discrete Math", "Linear Algebra", "Numerical Analysis", "Probability"],
  "cmms_web": ["CMMS System Maintenance", "Node.js", "Express", "PostgreSQL", "React", "REST APIs"],
  "graphics_embedded": ["OpenGL", "Raytracing", "OBJ Mesh Pipelines", "LiDAR ToF", "SPI/UART"],
  "tools": ["Git", "Linux", "VS Code", "Unreal Engine 5", "PowerShell"]
}`
                },
                'avatar.asc': {
                  type: 'file',
                  size: '920 B',
                  content: ASCII_ART.avatar
                },
                'readme.txt': {
                  type: 'file',
                  size: '640 B',
                  content: `WELCOME TO DANIEL LEE'S POWERSHELL PORTFOLIO!
------------------------------------------------
Navigation Quick Reference:
  - Type 'help' to view all commands.
  - Type 'ls' or 'dir' to list directory contents.
  - Type 'cd pages' to enter the pages directory.
  - Type 'cd pages/projects.html' or 'open pages/projects.html' to access Projects.
  - Type 'cat bio.txt' to view file contents.
  - Click on any [ command ] button at top or any file link!`
                },
                'pages': {
                  type: 'dir',
                  children: {
                    'home.html': {
                      type: 'file',
                      isHtmlPage: true,
                      url: 'pages/home.html',
                      size: '2.5 KB',
                      description: 'Terminal Portfolio Home Page'
                    },
                    'about.html': {
                      type: 'file',
                      isHtmlPage: true,
                      url: 'pages/about.html',
                      size: '3.3 KB',
                      description: 'About Daniel Lee - TAMU Engineering Graduate & US Modules Intern'
                    },
                    'projects.html': {
                      type: 'file',
                      isHtmlPage: true,
                      url: 'pages/projects.html',
                      size: '4.8 KB',
                      description: 'Projects - US Modules CMMS, C++ Raytracer, LiDAR Scanner'
                    },
                    'contact.html': {
                      type: 'file',
                      isHtmlPage: true,
                      url: 'pages/contact.html',
                      size: '2.1 KB',
                      description: 'Contact Details, Email, & Social Profiles'
                    }
                  }
                },
                'projects': {
                  type: 'dir',
                  children: {
                    'cmms-system.txt': {
                      type: 'file',
                      size: '1.6 KB',
                      content: `PROJECT: US Modules CMMS System Enhancements
------------------------------------------------
Role: Engineering Technician Intern @ US Modules
Description: Improving and optimizing a custom Computerized Maintenance Management System (CMMS) created by the Engineering Team Lead. Streamlining equipment tracking, maintenance scheduling, and collaborating on upcoming industrial engineering projects.`
                    },
                    'raytracer.txt': {
                      type: 'file',
                      size: '1.8 KB',
                      content: `PROJECT: C++ Raytracer & 3D Engine
------------------------------------------------
Stack: C++17, GLSL, Linear Algebra
Description: Software raytracer built from scratch. Features ray-sphere and ray-triangle intersection routines, OBJ mesh loading, Phong lighting model, reflections, and BVH acceleration tree.
Repository: https://github.com/danielsslee`
                    },
                    'lidar-scan.txt': {
                      type: 'file',
                      size: '1.4 KB',
                      content: `PROJECT: LiDAR 3D Spatial Scanner
------------------------------------------------
Stack: C/C++, Microcontroller, ToF LiDAR, Serial UART
Description: Hardware-software system that acquires distance point clouds via ToF LiDAR sensor and streams spatial coordinates over UART to generate 3D point cloud maps.`
                    },
                    'kitkatch-game.txt': {
                      type: 'file',
                      size: '1.5 KB',
                      content: `PROJECT: KitKatch (Indie Game on itch.io)
------------------------------------------------
Playable Link: https://kitkatch.itch.io/kitkatch
Tags: Game Development, Game Design, Itch.io
Description: Interactive indie game published on itch.io featuring custom gameplay mechanics, fluid movement systems, and engaging level design.`
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

  // Helper Functions
  function getPathString() {
    return currentPath.join('\\');
  }

  function getDirectoryNode(pathArray = currentPath) {
    let curr = vfs;
    for (const part of pathArray) {
      if (curr && curr[part]) {
        curr = curr[part];
      } else if (curr && curr.type === 'dir' && curr.children && curr.children[part]) {
        curr = curr.children[part];
      } else {
        return null;
      }
    }
    return curr;
  }

  function updateStatus() {
    const pwdStr = getPathString();
    promptString.textContent = `PS ${pwdStr}>`;
    statusPwd.textContent = pwdStr;
    windowTitle.textContent = `Windows PowerShell - Daniel Lee [${pwdStr}]`;

    const currNode = getDirectoryNode();
    if (currNode && currNode.type === 'dir' && currNode.children) {
      const count = Object.keys(currNode.children).length;
      statusItems.textContent = `${count} item${count === 1 ? '' : 's'}`;
    } else {
      statusItems.textContent = '0 items';
    }
  }

  function appendOutput(content, isHtml = false) {
    const block = document.createElement('div');
    block.className = 'output-block';
    if (isHtml) {
      block.innerHTML = content;
    } else {
      block.textContent = content;
    }
    terminalOutput.appendChild(block);
    scrollToBottom();
  }

  function appendPromptCommand(cmdText) {
    const row = document.createElement('div');
    row.className = 'prompt-row';
    row.innerHTML = `<span class="prompt-string">PS ${getPathString()}&gt;</span> <span class="cmd-text">${escapeHtml(cmdText)}</span>`;
    terminalOutput.appendChild(row);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function scrollToBottom() {
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  // Navigation Logic
  function navigateToDirectory(targetPath) {
    targetPath = targetPath.trim();
    targetPath = targetPath.replace(/\//g, '\\');

    if (targetPath === '~' || targetPath === '\\') {
      currentPath = ['C:', 'Users', 'DanielLee'];
      updateStatus();
      return true;
    }

    let segments = targetPath.split('\\').filter(Boolean);
    let newPath = [];

    if (targetPath.startsWith('C:')) {
      newPath = ['C:'];
      segments = segments.slice(1);
    } else {
      newPath = [...currentPath];
    }

    for (const seg of segments) {
      if (seg === '.') continue;
      if (seg === '..') {
        if (newPath.length > 1) {
          newPath.pop();
        }
      } else {
        const currDir = getDirectoryNode(newPath);
        if (currDir && currDir.type === 'dir' && currDir.children && currDir.children[seg]) {
          const targetNode = currDir.children[seg];
          if (targetNode.type === 'dir') {
            newPath.push(seg);
          } else if (targetNode.type === 'file') {
            if (targetNode.isHtmlPage) {
              appendOutput(`[Navigating to page file: <strong class="exe-color">${seg}</strong>]...`, true);
              window.location.href = targetNode.url;
              return true;
            } else {
              appendOutput(`Cannot cd into file '${seg}'. Use 'cat ${seg}' to read file.`, false);
              return false;
            }
          }
        } else {
          appendOutput(`cd : Cannot find path '${targetPath}' because it does not exist.`, false);
          return false;
        }
      }
    }

    currentPath = newPath;
    updateStatus();
    return true;
  }

  // Execution Engine
  function processCommand(rawInput) {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    commandHistory.push(trimmed);
    historyIndex = commandHistory.length;

    appendPromptCommand(trimmed);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        showHelp();
        break;

      case 'ls':
      case 'dir':
      case 'get-childitem':
        listDirectory(args[0]);
        break;

      case 'cd':
      case 'chdir':
      case 'set-location':
        if (!args[0]) {
          currentPath = ['C:', 'Users', 'DanielLee'];
          updateStatus();
        } else {
          navigateToDirectory(args[0]);
        }
        break;

      case 'cat':
      case 'type':
      case 'view':
      case 'get-content':
        viewFile(args[0]);
        break;

      case 'open':
      case 'launch':
      case 'start':
        openPage(args[0]);
        break;

      case 'pwd':
      case 'gl':
      case 'get-location':
        appendOutput(getPathString());
        break;

      case 'clear':
      case 'cls':
        terminalOutput.innerHTML = '';
        break;

      case 'ascii':
        showAscii(args[0]);
        break;

      case 'theme':
        changeTheme(args[0]);
        break;

      case 'matrix':
        toggleMatrix();
        break;

      case 'tree':
        showTree();
        break;

      case 'history':
        showHistory();
        break;

      case 'echo':
        appendOutput(args.join(' '));
        break;

      case 'whoami':
        appendOutput('daniel_lee\\computer_engineering_graduate_tamu');
        break;

      default:
        if (trimmed.endsWith('.html') || trimmed.endsWith('.txt')) {
          const res = navigateToDirectory(trimmed);
          if (!res) {
            appendOutput(`'${cmd}' is not recognized as an internal or external command. Type 'help' for assistance.`, false);
          }
        } else {
          appendOutput(`'${cmd}' is not recognized as an internal or external command. Type 'help' for assistance.`, false);
        }
        break;
    }

    scrollToBottom();
  }

  // Help Guide
  function showHelp() {
    const helpHtml = `
<div class="output-block">
  <strong class="prompt-path">=== DANIEL LEE TERMINAL HELP &amp; COMMAND GUIDE ===</strong>
  <p style="margin: 4px 0 8px 0;">Use PowerShell commands to navigate pages, view projects, and customize the shell.</p>

  <table class="help-table">
    <thead>
      <tr>
        <th>Command</th>
        <th>Syntax Example</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong class="exe-color">cd</strong></td>
        <td><code>cd pages/projects.html</code></td>
        <td>Navigate into a directory or load a page file directly.</td>
      </tr>
      <tr>
        <td><strong class="exe-color">ls / dir</strong></td>
        <td><code>ls</code> or <code>dir pages</code></td>
        <td>List all files and subdirectories in current location.</td>
      </tr>
      <tr>
        <td><strong class="exe-color">cat / view</strong></td>
        <td><code>cat bio.txt</code> or <code>cat avatar.asc</code></td>
        <td>Display file text content or ASCII image in terminal.</td>
      </tr>
      <tr>
        <td><strong class="exe-color">open / start</strong></td>
        <td><code>open pages/contact.html</code></td>
        <td>Open full standalone page view.</td>
      </tr>
      <tr>
        <td><strong class="exe-color">ascii</strong></td>
        <td><code>ascii avatar</code> or <code>ascii tamu</code></td>
        <td>Render custom retro ASCII art.</td>
      </tr>
      <tr>
        <td><strong class="exe-color">theme</strong></td>
        <td><code>theme matrix</code> (powershell|matrix|amber|cyberpunk|dark)</td>
        <td>Switch shell color palette.</td>
      </tr>
      <tr>
        <td><strong class="exe-color">matrix</strong></td>
        <td><code>matrix</code></td>
        <td>Toggle Matrix green rain canvas effect.</td>
      </tr>
      <tr>
        <td><strong class="exe-color">tree</strong></td>
        <td><code>tree</code></td>
        <td>Display virtual directory structure.</td>
      </tr>
      <tr>
        <td><strong class="exe-color">clear / cls</strong></td>
        <td><code>clear</code></td>
        <td>Clear screen buffer.</td>
      </tr>
    </tbody>
  </table>

  <p style="margin-top: 6px;" class="muted">
    💡 <strong>Pro Tip:</strong> Click any <strong>[ command ]</strong> button above or click file links in the output log! Press <kbd>Tab</kbd> for auto-completion.
  </p>
</div>`;
    appendOutput(helpHtml, true);
  }

  function listDirectory(targetArg) {
    let node = getDirectoryNode();
    let displayPath = getPathString();

    if (targetArg) {
      let tempPath = [...currentPath];
      if (targetArg === 'pages') tempPath.push('pages');
      else if (targetArg === 'projects') tempPath.push('projects');
      const found = getDirectoryNode(tempPath);
      if (found && found.type === 'dir') {
        node = found;
        displayPath = tempPath.join('\\');
      }
    }

    if (!node || node.type !== 'dir' || !node.children) {
      appendOutput(`Directory not found.`, false);
      return;
    }

    let rowsHtml = `
<div class="output-block font-mono">
  <p class="muted">    Directory: <strong>${escapeHtml(displayPath)}</strong></p>
  <br>
  <table class="dir-table">
    <thead>
      <tr>
        <th>Mode</th>
        <th>LastWriteTime</th>
        <th>Length</th>
        <th>Name</th>
      </tr>
    </thead>
    <tbody>`;

    for (const [name, item] of Object.entries(node.children)) {
      const isDir = item.type === 'dir';
      const mode = isDir ? 'd-----' : '-a----';
      const time = '2026-07-23 11:45';
      const length = isDir ? '' : (item.size || '1.0 KB');

      let nameClass = 'file-item';
      let actionCmd = `cat ${name}`;

      if (isDir) {
        nameClass = 'dir-item';
        actionCmd = `cd ${name}`;
      } else if (item.isHtmlPage) {
        nameClass = 'file-item html-file';
        actionCmd = `cd ${displayPath.endsWith('pages') ? name : 'pages/' + name}`;
      }

      rowsHtml += `
      <tr>
        <td class="muted">${mode}</td>
        <td class="muted">${time}</td>
        <td class="muted">${length}</td>
        <td><span class="${nameClass}" data-action="${escapeHtml(actionCmd)}">${escapeHtml(name)}</span></td>
      </tr>`;
    }

    rowsHtml += `
    </tbody>
  </table>
</div>`;

    appendOutput(rowsHtml, true);
    attachClickHandlers();
  }

  function viewFile(fileName) {
    if (!fileName) {
      appendOutput("cat : Missing file argument. Usage: cat <filename>", false);
      return;
    }

    const currNode = getDirectoryNode();
    if (currNode && currNode.type === 'dir' && currNode.children && currNode.children[fileName]) {
      const fileObj = currNode.children[fileName];
      if (fileObj.type === 'file') {
        if (fileObj.content) {
          if (fileName.endsWith('.asc')) {
            appendOutput(`<pre class="ascii-art">${escapeHtml(fileObj.content)}</pre>`, true);
          } else {
            appendOutput(fileObj.content, false);
          }
        } else if (fileObj.isHtmlPage) {
          appendOutput(`[Page file detected: <strong>${fileName}</strong>] Navigating to page view...`, true);
          window.location.href = fileObj.url;
        }
      } else {
        appendOutput(`cat : '${fileName}' is a directory. Use 'cd ${fileName}' to open it.`, false);
      }
    } else {
      appendOutput(`cat : Cannot find file '${fileName}'. Type 'ls' to list available files.`, false);
    }
  }

  function openPage(pageArg) {
    if (!pageArg) {
      window.location.href = 'pages/about.html';
      return;
    }

    if (pageArg.startsWith('pages/')) {
      window.location.href = pageArg;
    } else if (pageArg.endsWith('.html')) {
      window.location.href = `pages/${pageArg}`;
    } else {
      window.location.href = `pages/${pageArg}.html`;
    }
  }

  function showAscii(artName) {
    if (!artName || artName === 'avatar') {
      appendOutput(`<pre class="ascii-art">${ASCII_ART.avatar}</pre>`, true);
    } else if (artName === 'tamu' || artName === 'texas') {
      appendOutput(`<pre class="ascii-art">${ASCII_ART.tamu}</pre>`, true);
    } else if (artName === 'header' || artName === 'logo') {
      appendOutput(`<pre class="ascii-art">${ASCII_ART.header}</pre>`, true);
    } else {
      appendOutput(`Unknown ASCII art name '${artName}'. Available: avatar, tamu, header`, false);
    }
  }

  function changeTheme(themeName) {
    if (!themeName) {
      appendOutput("Usage: theme <powershell | matrix | amber | cyberpunk | dark>", false);
      return;
    }

    const validThemes = ['powershell', 'matrix', 'amber', 'cyberpunk', 'dark'];
    const selected = themeName.toLowerCase();

    if (validThemes.includes(selected)) {
      document.body.className = `theme-${selected}`;
      themeSelect.value = selected;
      appendOutput(`Switched terminal theme to: <strong>${selected.toUpperCase()}</strong>`, true);
    } else {
      appendOutput(`Invalid theme '${themeName}'. Options: powershell, matrix, amber, cyberpunk, dark`, false);
    }
  }

  function toggleMatrix() {
    if (document.body.classList.contains('theme-matrix')) {
      document.body.className = 'theme-powershell';
      themeSelect.value = 'powershell';
      appendOutput('Matrix effect disabled. Theme set to PowerShell.', false);
    } else {
      document.body.className = 'theme-matrix';
      themeSelect.value = 'matrix';
      appendOutput('Matrix green rain mode activated!', false);
    }
  }

  function showTree() {
    const treeText = `
C:\\Users\\DanielLee
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
    └── lidar-scan.txt`;
    appendOutput(`<pre class="ascii-art">${treeText}</pre>`, true);
  }

  function showHistory() {
    if (commandHistory.length === 0) {
      appendOutput("Command history is empty.", false);
      return;
    }
    let text = "Command History:\n";
    commandHistory.forEach((cmd, idx) => {
      text += `  ${idx + 1}  ${cmd}\n`;
    });
    appendOutput(text, false);
  }

  function attachClickHandlers() {
    const items = terminalOutput.querySelectorAll('[data-action]');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        if (action) {
          cmdInput.value = action;
          processCommand(action);
          cmdInput.value = '';
        }
      });
    });
  }

  // Auto-completion Handler (Tab Key)
  function handleTabComplete() {
    const val = cmdInput.value;
    if (!val) return;

    const parts = val.split(/\s+/);
    const lastWord = parts[parts.length - 1];

    const commands = ['help', 'ls', 'dir', 'cd', 'cat', 'open', 'ascii', 'theme', 'matrix', 'tree', 'clear', 'pwd', 'whoami'];
    const currNode = getDirectoryNode();
    let options = [...commands];

    if (currNode && currNode.type === 'dir' && currNode.children) {
      options = options.concat(Object.keys(currNode.children));
    }

    const matches = options.filter(opt => opt.startsWith(lastWord));
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      cmdInput.value = parts.join(' ');
    } else if (matches.length > 1) {
      appendOutput(`Matches: ${matches.join('  ')}`, false);
    }
  }

  // Keyboard Event Listeners
  cmdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = cmdInput.value;
      cmdInput.value = '';
      processCommand(val);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        cmdInput.value = commandHistory[historyIndex] || '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        cmdInput.value = commandHistory[historyIndex] || '';
      } else {
        historyIndex = commandHistory.length;
        cmdInput.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabComplete();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      terminalOutput.innerHTML = '';
    }
  });

  // Focus input when clicking anywhere inside terminal body
  if (terminalBody && cmdInput) {
    terminalBody.addEventListener('click', () => {
      cmdInput.focus();
    });
  }

  // Quick Command Bar Buttons
  document.querySelectorAll('.quick-cmd-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cmd = e.target.getAttribute('data-cmd');
      if (cmd) {
        processCommand(cmd);
      }
    });
  });

  // Theme Select Dropdown
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      changeTheme(e.target.value);
    });
  }

  // CRT Scanline Toggle
  if (crtToggle) {
    crtToggle.addEventListener('click', () => {
      document.body.classList.toggle('crt-disabled');
      const isDisabled = document.body.classList.contains('crt-disabled');
      crtToggle.textContent = `CRT: ${isDisabled ? 'OFF' : 'ON'}`;
    });
  }

  // ==========================================================================
  // REAL INTERACTIVE WINDOW CONTROLS (MINIMIZE, MAXIMIZE, CLOSE)
  // ==========================================================================

  // 1. MINIMIZE HANDLER
  function minimizeTerminal() {
    if (document.getElementById('minimized-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'minimized-overlay';
    overlay.className = 'minimized-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'PowerShell Minimized State');
    overlay.innerHTML = `
      <div class="minimized-box">
        <div class="minimized-icon">🗕</div>
        <h2>Windows PowerShell is Minimized</h2>
        <span class="minimized-hint">[ Click anywhere on screen to restore shell ]</span>
      </div>
    `;

    document.body.appendChild(overlay);

    const restoreHandler = (e) => {
      e.stopPropagation();
      if (document.body.contains(overlay)) {
        overlay.remove();
      }
      document.removeEventListener('click', restoreHandler, true);
      if (cmdInput) cmdInput.focus();
    };

    setTimeout(() => {
      document.addEventListener('click', restoreHandler, true);
    }, 10);
  }

  // 2. MAXIMIZE / FULLSCREEN HANDLER
  function toggleMaximize() {
    const isFullscreen = !!document.fullscreenElement || !!document.webkitFullscreenElement;

    if (!isFullscreen) {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {
          document.body.classList.toggle('maximized-mode');
        });
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else {
        document.body.classList.toggle('maximized-mode');
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      document.body.classList.remove('maximized-mode');
    }
  }

  // Update button visual state on fullscreenchange
  document.addEventListener('fullscreenchange', () => {
    const isFS = !!document.fullscreenElement;
    const maxBtns = document.querySelectorAll('#btn-max, .btn.maximize');
    maxBtns.forEach(btn => {
      btn.setAttribute('title', isFS ? 'Restore Down' : 'Maximize');
      btn.textContent = isFS ? '❐' : '□';
    });
  });

  // 3. CLOSE HANDLER
  function closeTerminalTab() {
    // Attempt standard browser tab close
    window.close();

    // Fallback UI if browser restricts window.close()
    setTimeout(() => {
      if (document.getElementById('closed-overlay')) return;

      const closedOverlay = document.createElement('div');
      closedOverlay.id = 'closed-overlay';
      closedOverlay.className = 'closed-overlay';
      closedOverlay.setAttribute('role', 'dialog');
      closedOverlay.setAttribute('aria-label', 'Terminal Session Closed');
      closedOverlay.innerHTML = `
        <div class="closed-box">
          <div class="closed-header">
            <span>✕</span> Windows PowerShell — Session Closed
          </div>
          <p class="closed-msg">Process exited with code 0. Tab session terminated.</p>
          <p class="closed-subtext">(Press <kbd>Ctrl+W</kbd> / <kbd>Cmd+W</kbd> to close tab, or click below to restart)</p>
          <button id="btn-restart-session" class="btn-restart-session">⚡ Restart PowerShell Session</button>
        </div>
      `;

      document.body.appendChild(closedOverlay);

      const restartBtn = closedOverlay.querySelector('#btn-restart-session');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          closedOverlay.remove();
          if (cmdInput) cmdInput.focus();
        });
      }
    }, 100);
  }

  // Attach Listeners to IDs and Class Selectors
  document.querySelectorAll('#btn-min, .btn.minimize').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      minimizeTerminal();
    });
  });

  document.querySelectorAll('#btn-max, .btn.maximize').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMaximize();
    });
  });

  document.querySelectorAll('#btn-close, .btn.close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeTerminalTab();
    });
  });


  // Initial Welcome Load Sequence with PROMINENT RECRUITER DASHBOARD
  function initTerminal() {
    updateStatus();

    // 1. ASCII Art Header
    appendOutput(`<pre class="ascii-art logo-art">${ASCII_ART.header}</pre>`, true);

    // 2. PROMINENT HERO IDENTIFICATION BANNER WITH GRADUATION & US MODULES INTERNSHIP
    const heroHtml = `
<div class="hero-header-box">
  <h1>DANIEL LEE</h1>
  <div class="hero-subtitle">B.S. Computer Engineering (Math Minor) @ Texas A&M University</div>
  <div class="hero-tags">Engineering Technician Intern @ US Modules • Software Engineer • Full Stack • Embedded</div>
</div>

<div class="dashboard-grid">
  <div class="dash-card">
    <h3>🎯 Current Status</h3>
    <div class="status-badge">✓ INTERNING @ US MODULES</div>
    <ul class="dash-list">
      <li>• <strong>Role:</strong> Engineering Technician Intern @ <em>US Modules</em></li>
      <li>• <strong>Focus:</strong> Improving custom CMMS system &amp; project collab</li>
      <li>• <strong>Education:</strong> TAMU Computer Engineering Grad (Math Minor)</li>
      <li>• <strong>Seeking:</strong> Full-Time Software Engineering &amp; Systems Roles</li>
    </ul>
  </div>

  <div class="dash-card">
    <h3>🚀 Featured Work</h3>
    <ul class="dash-list font-mono">
      <li>• <span class="file-item html-file" data-action="cd pages/projects.html">CMMS System (US Modules)</span></li>
      <li>• <a href="https://kitkatch.itch.io/kitkatch" target="_blank" rel="noreferrer" style="color: var(--accent-color); text-decoration: none;">🎮 KitKatch (Itch.io Game)</a></li>
      <li>• <span class="file-item html-file" data-action="cd pages/projects.html">C++ Raytracer &amp; 3D Engine</span></li>
      <li>• <span class="file-item html-file" data-action="cd pages/projects.html">LiDAR 3D Spatial Scanner</span></li>
    </ul>
  </div>

  <div class="dash-card">
    <h3>🛠️ Core Stack</h3>
    <ul class="dash-list">
      <li>• <strong>Languages:</strong> C++, Python, TypeScript, SQL</li>
      <li>• <strong>Math &amp; Web:</strong> Discrete Math, Linear Alg, React, Node.js</li>
      <li>• <strong>Systems:</strong> CMMS Tooling, LiDAR, UART/SPI, OpenGL, UE5</li>
    </ul>
  </div>
</div>

<div class="highlight-box">
  💡 <strong>QUICK START:</strong> Click any <strong>[ command ]</strong> button above (e.g. <strong class="exe-color">[ projects ]</strong> or <strong class="exe-color">[ about ]</strong>), or type commands below in the bright prompt line!
</div>`;

    appendOutput(heroHtml, true);
    attachClickHandlers();
    cmdInput.focus();
  }

  initTerminal();
});
