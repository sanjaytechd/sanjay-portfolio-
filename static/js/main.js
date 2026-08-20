 function toggleMode() {
        // Toggle dark mode
        document.body.classList.toggle("dark-mode");

        // Change icon between sun and moon
        const modeIcon = document.getElementById("mode-icon");
        if (document.body.classList.contains("dark-mode")) {
          modeIcon.classList.remove("fa-sun");
          modeIcon.classList.add("fa-moon");
        } else {
          modeIcon.classList.remove("fa-moon");
          modeIcon.classList.add("fa-sun");
        }
      }

function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function toggleChatBox() {
  const chatBox = document.getElementById('chat-box');
  const openBtn = document.getElementById('open-chat-btn');
  if (chatBox.style.display === 'none') {
    chatBox.style.display = 'flex';
    openBtn.style.display = 'none';
    setTimeout(() => {
      document.getElementById('chat-input').focus();
    }, 200);
  } else {
    chatBox.style.display = 'none';
    openBtn.style.display = 'flex';
  }
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  appendMessage('You', msg, true);
  input.value = '';
  appendMessage('Santy', '<span style="color:#aaa;">Typing...</span>', false, true);
  const res = await fetch('https://sanjay-portfolio-jl91.onrender.com/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({message: msg})
  });
  const data = await res.json();
  // Remove "Typing..." placeholder
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.lastChild.remove();
  
  // Add inline styles to links in the response for better visibility
  let styledReply = renderMarkdownTables(data.reply);
  styledReply = wrapHtmlTables(styledReply);
  styledReply = styledReply.replace(/<a\s+href=/g, '<a style="color: #0056cc; font-weight: 700; text-decoration: underline;" href=');
  appendMessage('Santy', styledReply, false);
}

function wrapHtmlTables(reply) {
  const container = document.createElement('div');
  container.innerHTML = reply;

  container.querySelectorAll('table').forEach(table => {
    if (table.parentElement.classList.contains('chat-table-wrap')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'chat-table-wrap';
    table.parentElement.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  return container.innerHTML;
}

function renderMarkdownTables(reply) {
  const lines = reply.split('\n');
  const rendered = [];

  for (let index = 0; index < lines.length; index += 1) {
    const header = lines[index].trim();
    const separator = lines[index + 1] ? lines[index + 1].trim() : '';
    const isTable = header.includes('|') && /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(separator);

    if (!isTable) {
      rendered.push(lines[index]);
      continue;
    }

    const parseRow = row => row.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
    const escapeCell = cell => cell.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const headers = parseRow(header).map(escapeCell);
    const rows = [];
    index += 2;

    while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
      rows.push(parseRow(lines[index]).map(escapeCell));
      index += 1;
    }
    index -= 1;

    rendered.push(`<div class="chat-table-wrap"><table><thead><tr>${headers.map(cell => `<th>${cell}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
  }

  return rendered.join('\n');
}

function appendMessage(sender, text, isUser=false, isTyping=false) {
  const chatMessages = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.style.display = 'flex';
  msgDiv.style.width = '100%';
  msgDiv.style.minWidth = '0';
  msgDiv.style.alignItems = 'flex-start';
  msgDiv.style.marginBottom = '12px';
  msgDiv.style.justifyContent = isUser ? 'flex-end' : 'flex-start';
  msgDiv.style.gap = '8px';

  // Add avatar for bot (before the bubble)
  if (!isUser) {
    const avatar = document.createElement('img');
    avatar.src = '/static/images/bot.png';
    avatar.alt = 'Santy';
    avatar.style.width = '28px';
    avatar.style.height = '28px';
    avatar.style.borderRadius = '50%';
    avatar.style.background = '#fff';
    avatar.style.border = '1.5px solid #007bff';
    avatar.style.flexShrink = '0';
    msgDiv.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = isUser ? 'chat-bubble chat-bubble--user' : 'chat-bubble chat-bubble--bot';
  bubble.innerHTML = `<div class="chat-reply-content" style="font-size:0.95em; line-height:1.4;">${text}</div>`;
  bubble.style.width = '70%';
  bubble.style.maxWidth = '70%';
  bubble.style.minWidth = '0';
  bubble.style.boxSizing = 'border-box';
  bubble.style.padding = '12px 14px';
  bubble.style.borderRadius = isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px';
  bubble.style.background = isUser ? 'linear-gradient(90deg,#007bff 60%,#00c6ff 100%)' : 'rgba(255,255,255,0.85)';
  bubble.style.color = isUser ? '#fff' : '#222';
  bubble.style.boxShadow = isUser ? '0 2px 8px rgba(0,123,255,0.15)' : '0 2px 8px rgba(0,0,0,0.08)';
  bubble.style.wordWrap = 'break-word';
  bubble.style.fontWeight = isTyping ? '400' : '500';
  
  // Style HTML elements within the bubble
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    #chat-messages a { text-decoration: underline; cursor: pointer; }
    #chat-messages strong { font-weight: 700; }
    #chat-messages em { font-style: italic; }
    #chat-messages ul, #chat-messages ol { margin: 8px 0; padding-left: 20px; }
    #chat-messages li { margin: 4px 0; }
    #chat-messages br { display: block; content: ''; }
    #chat-messages { min-width: 0; overflow-x: hidden; }
    #chat-messages .chat-reply-content { width: 100%; min-width: 0; overflow: visible; }
    #chat-messages .chat-table-wrap { display: block; width: 100%; max-width: 100%; min-width: 0; overflow-x: auto; overflow-y: hidden; margin: 10px 0; }
    #chat-messages table { width: max-content; min-width: 100%; border-collapse: collapse; font-size: 0.92em; }
    #chat-messages th, #chat-messages td { border: 1px solid rgba(23, 35, 61, 0.2); padding: 7px 8px; text-align: left; vertical-align: top; white-space: nowrap; }
    #chat-messages th { background: rgba(0, 123, 255, 0.12); font-weight: 700; }
  `;
  if (!document.head.querySelector('style[data-chat-styles]')) {
    styleTag.setAttribute('data-chat-styles', 'true');
    document.head.appendChild(styleTag);
  }

  msgDiv.appendChild(bubble);
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.addEventListener('DOMContentLoaded', function () {
  const chatInput = document.getElementById('chat-input');
  if (!chatInput) return;

  chatInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });
});

window.addEventListener('load', function () {
  const modalElement = document.getElementById('userInfoModal');
  const nameInput = document.getElementById('name');
  const contactInput = document.getElementById('contactInfo');
  const form = document.getElementById('user-info-form');

  if (!modalElement || !form || !nameInput || !contactInput) return;

  const shown = localStorage.getItem('userInfoShown');
  if (!shown) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    localStorage.setItem('userInfoShown', 'true');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = nameInput.value.trim();
    const contact = contactInput.value.trim();

    // Close modal immediately
    bootstrap.Modal.getInstance(modalElement).hide();

    // If nothing is filled, skip sending
    if (!name && !contact) return;

    // Send data in background
    fetch('/submit-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contact }),
    }).catch(err => {
      console.error('Error sending visitor info:', err);
    });
  });
});

