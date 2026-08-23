function trackAnalyticsEvent(eventName, eventParams = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  }
}

const chatHistory = [];

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
  if (dropdown.style.display === 'block') {
    trackAnalyticsEvent('project_details_opened', { project_id: dropdownId });
  }
}

function openArchitecture(trigger) {
  const modal = document.getElementById('architecture-modal');
  const image = document.getElementById('architecture-modal-image');
  const title = document.getElementById('architecture-modal-title');
  image.src = trigger.dataset.architectureSrc;
  image.alt = `${trigger.dataset.architectureTitle} architecture diagram`;
  title.textContent = trigger.dataset.architectureTitle;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('architecture-modal-open');
  modal.querySelector('.architecture-modal-close').focus();
}

function closeArchitecture() {
  const modal = document.getElementById('architecture-modal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('architecture-modal-open');
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeArchitecture();
});

function toggleChatBox() {
  const chatBox = document.getElementById('chat-box');
  const openBtn = document.getElementById('open-chat-btn');
  if (chatBox.style.display === 'none') {
    chatBox.style.display = 'flex';
    openBtn.style.display = 'none';
    trackAnalyticsEvent('chat_opened');
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
  document.querySelectorAll('#chat-messages .chat-suggestions').forEach(suggestions => suggestions.remove());
  appendMessage('You', msg, true);
  trackAnalyticsEvent('chat_message_sent');
  input.value = '';
  appendMessage('Santy', '<span style="color:#aaa;">Typing...</span>', false, true);
  const res = await fetch('/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({message: msg, history: chatHistory.slice(-3)})
  });
  const data = await res.json();
  // Remove "Typing..." placeholder
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.lastChild.remove();
  
  // Add inline styles to links in the response for better visibility
  let styledReply = renderMarkdownTables(data.answer || data.reply || '');
  styledReply = wrapHtmlTables(styledReply);
  styledReply = styledReply.replace(/<a\s+href=/g, '<a style="color: #0056cc; font-weight: 700; text-decoration: underline;" href=');
  appendMessage('Santy', styledReply, false, false, data.suggestions || []);
  chatHistory.push({question: msg, response: data.answer || data.reply || ''});
  chatHistory.splice(0, Math.max(0, chatHistory.length - 3));
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

function appendMessage(sender, text, isUser=false, isTyping=false, suggestions=[]) {
  const chatMessages = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.style.display = 'flex';
  msgDiv.style.width = '100%';
  msgDiv.style.minWidth = '0';
  msgDiv.style.alignItems = 'flex-start';
  msgDiv.style.marginBottom = '12px';
  msgDiv.style.justifyContent = isUser ? 'flex-end' : 'flex-start';
  msgDiv.style.gap = '8px';

  // Add a branded marker for Santy messages.
  if (!isUser) {
    const avatar = document.createElement('div');
    avatar.className = 'chat-message-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = 'S';
    msgDiv.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = isUser ? 'chat-bubble chat-bubble--user' : 'chat-bubble chat-bubble--bot';
  bubble.innerHTML = `<div class="chat-reply-content" style="font-size:0.95em; line-height:1.4;">${text}</div>`;
  bubble.style.width = isUser ? '70%' : '100%';
  bubble.style.maxWidth = isUser ? '70%' : '100%';
  bubble.style.minWidth = '0';
  bubble.style.boxSizing = 'border-box';
  bubble.style.padding = '12px 14px';
  bubble.style.borderRadius = isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px';
  bubble.style.background = isUser ? 'linear-gradient(90deg,#007bff 60%,#00c6ff 100%)' : 'rgba(255,255,255,0.85)';
  bubble.style.color = isUser ? '#fff' : '#222';
  bubble.style.boxShadow = isUser ? '0 2px 8px rgba(0,123,255,0.15)' : '0 2px 8px rgba(0,0,0,0.08)';
  bubble.style.wordWrap = 'break-word';
  bubble.style.fontWeight = isTyping ? '400' : '500';

  const botContent = document.createElement('div');
  botContent.style.width = isUser ? '100%' : 'calc(100% - 36px)';
  botContent.style.minWidth = '0';
  if (!isUser) {
    botContent.appendChild(bubble);
  }
  
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
    #chat-messages .chat-reply-content h1,
    #chat-messages .chat-reply-content h2,
    #chat-messages .chat-reply-content h3 { margin: 4px 0 7px; font-size: 1rem; line-height: 1.25; }
    #chat-messages .chat-table-wrap { display: block; width: 100%; max-width: 100%; min-width: 0; overflow-x: auto; overflow-y: hidden; margin: 10px 0; }
    #chat-messages table { width: max-content; min-width: 100%; border-collapse: collapse; font-size: 0.92em; }
    #chat-messages th, #chat-messages td { border: 1px solid rgba(23, 35, 61, 0.2); padding: 7px 8px; text-align: left; vertical-align: top; white-space: nowrap; }
    #chat-messages th { background: rgba(0, 123, 255, 0.12); font-weight: 700; }
  `;
  if (!document.head.querySelector('style[data-chat-styles]')) {
    styleTag.setAttribute('data-chat-styles', 'true');
    document.head.appendChild(styleTag);
  }

  if (isUser) {
    msgDiv.appendChild(bubble);
  }

  if (!isUser && !isTyping && suggestions.length === 3) {
    const suggestionList = document.createElement('div');
    suggestionList.className = 'chat-suggestions';
    suggestions.forEach(suggestion => {
      const suggestionButton = document.createElement('button');
      suggestionButton.type = 'button';
      suggestionButton.className = 'chat-suggestion';
      suggestionButton.textContent = suggestion;
      suggestionButton.addEventListener('click', () => {
        document.getElementById('chat-input').value = suggestion;
        sendMessage();
      });
      suggestionList.appendChild(suggestionButton);
    });
    botContent.appendChild(suggestionList);
  }

  if (!isUser) {
    msgDiv.appendChild(botContent);
  }

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

  document.querySelectorAll('a[download]').forEach(link => {
    link.addEventListener('click', () => trackAnalyticsEvent('resume_download'));
  });

  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', () => trackAnalyticsEvent('external_link_clicked', {
      destination: link.hostname,
    }));
  });

  let scrollTracked = false;
  window.addEventListener('scroll', function () {
    const scrollDepth = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
    if (!scrollTracked && scrollDepth >= 0.9) {
      scrollTracked = true;
      trackAnalyticsEvent('scroll_depth_90');
    }
  }, { passive: true });
});

