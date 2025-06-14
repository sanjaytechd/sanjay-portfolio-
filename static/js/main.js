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
    openBtn.style.display = 'block';
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
  appendMessage('Santy', data.reply, false);
}

function appendMessage(sender, text, isUser=false, isTyping=false) {
  const chatMessages = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.style.display = 'flex';
  msgDiv.style.alignItems = 'flex-end';
  msgDiv.style.marginBottom = '10px';
  msgDiv.style.justifyContent = isUser ? 'flex-end' : 'flex-start';

  const bubble = document.createElement('div');
  bubble.innerHTML = `<span style="font-size:0.95em;">${text}</span>`;
  bubble.style.maxWidth = '75%';
  bubble.style.padding = '10px 16px';
  bubble.style.borderRadius = isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px';
  bubble.style.background = isUser ? 'linear-gradient(90deg,#007bff 60%,#00c6ff 100%)' : 'rgba(255,255,255,0.8)';
  bubble.style.color = isUser ? '#fff' : '#222';
  bubble.style.boxShadow = isUser ? '0 2px 8px rgba(0,123,255,0.10)' : '0 2px 8px rgba(0,0,0,0.07)';
  bubble.style.marginLeft = isUser ? '0' : '8px';
  bubble.style.marginRight = isUser ? '8px' : '0';
  bubble.style.fontWeight = isTyping ? '400' : '500';

  if (!isUser) {
    // Add avatar for bot
    const avatar = document.createElement('img');
    avatar.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=Santy';
    avatar.alt = 'Santy';
    avatar.style.width = '28px';
    avatar.style.height = '28px';
    avatar.style.borderRadius = '50%';
    avatar.style.background = '#fff';
    avatar.style.border = '1.5px solid #007bff';
    avatar.style.marginRight = '6px';
    msgDiv.appendChild(avatar);
  }
  msgDiv.appendChild(bubble);
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

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

// Close blog dropdown if user clicks outside
document.addEventListener('click', function (event) {
  const dropdown = document.getElementById('blogDropdown');
  const button = document.querySelector('.dropdown-btn');

  // If click is outside the dropdown and button, close it
  if (dropdown.style.display === 'block' &&
      !dropdown.contains(event.target) &&
      !button.contains(event.target)) {
    dropdown.style.display = 'none';
  }
});
