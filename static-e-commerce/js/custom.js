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
    let selectedMachine = null;

    const chatPage = document.querySelector('.page-ai');
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


    function startChat() {
      choice.style.display = 'none';
      showChat();
    }

    function backToChoice() {
      showChoice();
    }

    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // cegah newline
        sendMessage();
      }
      // Shift+Enter tetap jalan (buat newline)
    });

    chatInput.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });

    function toggleSidebarMobile() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.querySelector('.overlay');
      sidebar.classList.toggle('show');
      overlay.classList.toggle('hidden');
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

    function toggleSidebarHistory() {
      const list = document.getElementById('sidebar-history');
      if (list.style.display === 'none') {
        renderSidebarHistory();
        list.style.display = 'block';
      } else {
        list.style.display = 'none';
      }
    }

    function toggleSidebarExpand() {
      const sidebar = document.getElementById('sidebar');
      sidebar.classList.toggle('collapsed');
    }


    function renderSidebarHistory() {
      const list = document.getElementById('sidebar-history');
      list.innerHTML = '';

      const userMessages = history
        .filter(h => h.sender === 'user-ai')
        .map(h => h.text);

      const uniqueTexts = [...new Set(userMessages)].reverse();

      uniqueTexts.slice(0, 10).forEach(text => {
        const item = document.createElement('div');
        item.textContent = text.length > 60 ? text.slice(0, 57) + '…' : text;
        item.onclick = () => {
          showChat();
          suggest(text);
        };
        list.appendChild(item);
      });
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

      const textDiv = document.createElement('div');
      textDiv.className = 'text-ai';
      textDiv.textContent = text;

      div.appendChild(textDiv);
      chatMessages.appendChild(div);
      autoScroll();

      chatInput.focus();
    }



    function smoothAIResponse(userText) {
      const placeholderDiv = document.createElement('div');
      placeholderDiv.className = 'msg ai';

      const typingText = document.createElement('div');
      typingText.className = 'text-ai typing-loader';
      typingText.textContent = 'AI sedang mengetik';
      placeholderDiv.appendChild(typingText);
      chatMessages.appendChild(placeholderDiv);
      autoScroll();

      const response = 'Respon AI: ' + userText;
      const lower = userText.toLowerCase();

      typeWriter(typingText, response, 0, () => {
        typingText.classList.remove('typing-loader');
        typingText.textContent = response;
        autoScroll();

        const timeNow = new Date().toISOString();
        history.push({
          sender: 'ai',
          text: response,
          time: timeNow
        });
        save();

        if (lower.includes('mesin kopi') || lower.includes('rekomendasi mesin')) {
          renderProductCarousel([{
              img: 'images/product-1.jpg',
              title: 'Nuova Simonelli Appia Life V (2 Groups)',
              price: 'Rp112.000.000'
            },
            {
              img: 'images/product-2.jpg',
              title: 'Victoria Arduino VA388 Black Eagle T3 2 Group',
              price: 'Rp81.500.000'
            },
            {
              img: 'images/product-3.jpg',
              title: 'Victoria Arduino VA388 Black Eagle T3 2 Group',
              price: 'Rp61.750.000'
            },
            {
              img: 'images/product-1.jpg',
              title: 'Nuova Simonelli Appia Life V (2 Groups)',
              price: 'Rp112.000.000'
            },
            {
              img: 'images/product-2.jpg',
              title: 'Victoria Arduino VA388 Black Eagle T3 2 Group',
              price: 'Rp81.500.000'
            },
            {
              img: 'images/product-3.jpg',
              title: 'Victoria Arduino VA388 Black Eagle T3 2 Group',
              price: 'Rp61.750.000'
            }
          ]);
        } else if (lower.includes('list mesin') || lower.includes('daftar mesin')) {
          const machines = [{
              img: 'images/product-1.jpg',
              title: 'Appia Life Compact',
              serial: 'SN-A12345',
              location: 'Jakarta'
            },
            {
              img: 'images/product-1.jpg',
              title: 'Black Eagle VA388',
              serial: 'SN-B67890',
              location: 'Bandung'
            },
            {
              img: 'images/product-1.jpg',
              title: 'Linea Mini',
              serial: 'SN-C54321',
              location: 'Bali'
            },
            {
              img: 'images/product-1.jpg',
              title: 'Appia Life Compact',
              serial: 'SN-A12345',
              location: 'Jakarta'
            },
            {
              img: 'images/product-1.jpg',
              title: 'Black Eagle VA388',
              serial: 'SN-B67890',
              location: 'Bandung'
            },
            {
              img: 'images/product-1.jpg',
              title: 'Linea Mini',
              serial: 'SN-C54321',
              location: 'Bali'
            }
          ];
          renderMachineSwiper(machines);
        }

      });
    }

    function renderMachineSwiper(machines) {
      const wrapper = document.createElement('div');
      wrapper.className = 'swiper msg ai';
      wrapper.style.marginTop = '12px';
      wrapper.style.width = '100%';

      const swiperId = 'swiper-' + Math.random().toString(36).slice(2, 8);

      wrapper.innerHTML = `
    <div class="swiper-wrapper" id="${swiperId}">
      ${machines.map((m, i) => `
        <div class="swiper-slide machine-slide" data-index="${i}" style="
          display: flex;
          gap: 12px;
          background: #f9f9f9;
          border-radius: 12px;
          padding: 8px;
          flex-shrink: 0;
          width: auto;
          min-width: 260px;
          box-sizing: border-box;
          cursor: pointer;
          transition: all 0.2s ease;
        ">
          <img src="${m.img}" alt="${m.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" loading="lazy"/>
          <div style="flex: 1; overflow: hidden;">
            <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">${m.title}</div>
            <div style="font-size: 11px; color: #333;">SN: ${m.serial}</div>
            <div style="font-size: 11px; color: #777;">Label alamat: ${m.location}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

      chatMessages.appendChild(wrapper);

      const swiper = new Swiper(wrapper, {
        slidesPerView: 'auto',
        spaceBetween: 12,
        freeMode: false,
        slidesOffsetAfter: 16,
        pagination: {
          el: wrapper.querySelector('.swiper-pagination'),
          clickable: true,
          dynamicBullets: true
        }
      });

      // 🔥 SELECT FEATURE
      const slideEls = wrapper.querySelectorAll('.machine-slide');
      slideEls.forEach((el, index) => {
        el.addEventListener('click', () => {
          slideEls.forEach(e => e.classList.remove('selected-machine'));
          el.classList.add('selected-machine');

          selectedMachine = machines[index];
          console.log('📦 Mesin terpilih:', selectedMachine);

          // Munculkan tombol booking
          document.getElementById('booking-btn').style.display = 'inline-block';
        });

      });

      autoScroll();
    }

    function handleBooking() {
      if (!selectedMachine) return alert('Pilih mesin terlebih dahulu');

      // 👉 Kirim ke backend, atau tampilkan modal booking
      alert(`Booking untuk mesin: ${selectedMachine.title}\nSN: ${selectedMachine.serial}`);

      // Optional: reset selection
      document.getElementById('booking-btn').style.display = 'none';
      selectedMachine = null;
    }

    function typeWriter(el, text, i = 0, callback) {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        autoScroll(); // update tiap karakter
        setTimeout(() => typeWriter(el, text, i + 1, callback), 25);
      } else {
        callback && callback();
        autoScroll(); // pastikan scroll terakhir juga dilakukan
      }
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

    function contactCS() {
      window.open('https://wa.me/+628119983378', '_blank');
    }

    function autoScroll() {
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 50); // Delay sedikit agar update DOM selesai
    }

    function renderProductCarousel(products) {
      const wrapper = document.createElement('div');
      wrapper.className = 'swiper msg ai';
      wrapper.style.marginTop = '8px';

      wrapper.innerHTML = `
    <div class="swiper-wrapper">
      ${products.map(p => `
        <div class="swiper-slide" style="width:150px !important; background:#f9f9f9; border-radius:12px; padding:10px;">
          <img src="${p.img}" style="width:100%; border-radius:8px;" loading="lazy"/>
          <div style="margin-top:8px; font-weight:bold; font-size:10px;">${p.title}</div>
          <div style="color:#555; font-size:10px;"><span style=" text-decoration: line-through; color: #b3b3b3; font-size: 9px;">${p.price}</span></div>
          <div style="color:#555; font-size:10px;"><span class="mr-2 price-dc" style="font-size: 9px;">${p.price}</span></div>
          <button style="margin-top:8px; background:#ffa45c; border:none; color:#fff; padding: 5px 0px; width:100%; border-radius:6px; font-size:9px; cursor:pointer;">Add to cart +</button>
        </div>
      `).join('')}
    </div>
  `;

      chatMessages.appendChild(wrapper);

      const swiper = new Swiper(wrapper, {
        slidesPerView: 'auto',
        spaceBetween: 12,
        freeMode: false,
        slidesOffsetAfter: 16,
      });

      autoScroll();
    }

    function startNewChat() {
      history = [];
      save();
      chatMessages.innerHTML = '';
      chatSuggestions.style.display = 'block';
      chatInput.value = '';
      selectedMachine = null;
      document.getElementById('booking-btn').style.display = 'none';
      autoScroll();
    }

    function showSearchChat() {
      alert("Fitur pencarian chat sedang dalam pengembangan 🔍");
      // Atau nanti bisa tampilkan input dan filter historyList
    }


    document.addEventListener('DOMContentLoaded', () => {
      renderSidebarHistory();
    });
