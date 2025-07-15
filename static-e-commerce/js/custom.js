// Countdown Timer Upselling
(function () {
  const second = 1000,
    minute = second * 60,
    hour = minute * 60,
    day = hour * 24;

  let countDownDate = new Date();
  countDownDate.setTime(countDownDate.getTime() + (2 * 60 * 60 * 1000));

  const countDown = countDownDate.getTime(),
    x = setInterval(function () {

      const now = new Date().getTime(),
        distance = countDown - now;

      document.getElementById("hours").innerText = Math.floor((distance % (day)) / (hour)),
        document.getElementById("minutes").innerText = Math.floor((distance % (hour)) / (minute)),
        document.getElementById("seconds").innerText = Math.floor((distance % (minute)) / second);

      if (distance < 0) {
        document.getElementById("countdown").style.display = "none";
        document.getElementById("content").style.display = "block";
        clearInterval(x);
      }
    }, 0)
}());


// Chat Widget AI & WA
const chatToggle = document.getElementById('chat-toggle'),
  widget = document.getElementById('chat-widget'),
  choice = document.getElementById('choice-page'),
  chatPage = document.getElementById('chat-page'),
  historyPage = document.getElementById('history-page'),
  chatMessages = document.getElementById('chat-messages'),
  chatInput = document.getElementById('chat-input-field'),
  historyList = document.getElementById('history-list'),
  chatSuggestions = document.getElementById('chat-suggestions');

let history = JSON.parse(localStorage.getItem('chatHistory') || '[]');

function save() {
  localStorage.setItem('chatHistory', JSON.stringify(history));
}

function formatTime(t) {
  const d = new Date(t);
  return d.toLocaleDateString('id') + ' ' + d.toLocaleTimeString('id', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

chatToggle.onclick = () => {
  widget.style.display = 'flex';
  showChoice();
};

function toggleChat() {
  widget.style.display = 'none';
}

function showChoice() {
  choice.style.display = 'flex';
  chatPage.style.display = 'none';
  historyPage.style.display = 'none';
}

function startChat() {
  choice.style.display = 'none';
  showChat();
}

function backToChoice() {
  showChoice();
}

function showChat() {
  chatPage.style.display = 'flex';
  choice.style.display = 'none';
  historyPage.style.display = 'none';
  chatMessages.innerHTML = '';
  chatSuggestions.style.display = 'block';
}

function showHistory() {
  historyPage.style.display = 'flex';
  chatPage.style.display = 'none';
  renderHistory();
}

function sendMessage() {
  const txt = chatInput.value.trim();
  if (!txt) return;
  chatSuggestions.style.display = 'none';
  addMessage('user-ai', txt);
  chatInput.value = '';
  setTimeout(() => smoothAIResponse(txt), 300);
}

function addMessage(sender, text, time = null) {
  const timestamp = time || new Date().toISOString();
  if (!time) {
    history.push({
      sender,
      text,
      time: timestamp
    });
    save();
  }
  const div = document.createElement('div');
  div.className = 'msg ' + sender;
  let inner = `<div class="text-ai">${text}</div>`;
  // if(sender !== 'ai') inner += `<span class="time">${formatTime(timestamp)}</span>`;
  div.innerHTML = inner;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function smoothAIResponse(userText) {
  const placeholderDiv = document.createElement('div');
  placeholderDiv.className = 'msg ai';
  placeholderDiv.innerHTML = `<div class="text-ai">AI sedang mengetik...</div>`;
  chatMessages.appendChild(placeholderDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const response = 'Respon AI: ' + userText;
  typeWriter(placeholderDiv, response, 0, () => {
    // replace placeholder
    const timeNow = new Date().toISOString();
    placeholderDiv.className = 'msg ai';
    placeholderDiv.innerHTML = `<div class="text-ai">${response}</div>`;
    history.push({
      sender: 'ai',
      text: response,
      time: timeNow
    });
    save();
  });
}

function typeWriter(el, text, i, callback) {
  if (i <= text.length) {
    el.querySelector('.text-ai').textContent = text.slice(0, i);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    setTimeout(() => typeWriter(el, text, i + 1, callback), 30);
  } else {
    callback();
  }
}

function renderHistory() {
  historyList.innerHTML = '';
  const todayKey = new Date().toISOString().slice(0, 10);
  const users = history.filter(h => h.sender === 'user-ai');
  const todayList = users.filter(h => h.time.startsWith(todayKey)).slice(-10).reverse();
  const allList = users.filter(h => !h.time.startsWith(todayKey)).slice(-10).reverse();
  if (todayList.length) {
    const span = document.createElement('span');
    span.textContent = 'Hari Ini';
    span.style.fontWeight = '700';
    historyList.appendChild(span);
    todayList.forEach(h => appendHist(h));
  }
  if (allList.length) {
    const span = document.createElement('span');
    span.textContent = 'Semua';
    span.style.fontWeight = '700';
    historyList.appendChild(span);
    todayList.forEach(h => appendHist(h));
  }
}

function appendHist(h) {
  const p = document.createElement('p');
  p.textContent = h.text;
  p.onclick = () => {
    showChat();
    suggest(h.text);
  };
  historyList.appendChild(p);
}

function suggest(txt) {
  chatSuggestions.style.display = 'none';
  addMessage('user-ai', txt);
  setTimeout(() => smoothAIResponse(txt), 300);
}

function clearHistory() {
  history = [];
  save();
  historyList.innerHTML = '';
}
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

function contactCS() {
  window.open('https://wa.me/+628119983378', '_blank');
}