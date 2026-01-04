const listEl = document.getElementById("channelList");

CONFIG.channels.forEach(channel => {
  const card = document.createElement("div");
  card.className = "card";

  /* 🔑 平台識別（給 CSS 用） */
  card.dataset.platform = channel.platform;

  card.innerHTML = `
    <div class="header">
      <img class="avatar">
      <div>
        <div class="name"></div>
        <div class="platform"></div>
      </div>
    </div>
    <div class="status">檢查中…</div>
    <a class="link" target="_blank" rel="noopener">前往頻道</a>
  `;

  listEl.appendChild(card);

  const avatarEl = card.querySelector(".avatar");
  const nameEl = card.querySelector(".name");
  const platformEl = card.querySelector(".platform");
  const statusEl = card.querySelector(".status");
  const linkEl = card.querySelector(".link");

  /* =========================
     共用顯示資料（完全自訂）
     ========================= */
  avatarEl.src = channel.avatar;
  nameEl.textContent = channel.name;

  /* =========================
     Twitch
     ========================= */
  if (channel.platform === "twitch") {
    platformEl.textContent = "Twitch";
    platformEl.className = "platform twitch";
    linkEl.href = `https://twitch.tv/${channel.twitch.channel}`;

    fetch(`https://decapi.me/twitch/uptime/${channel.twitch.channel}`)
      .then(r => r.text())
      .then(text => {
        if (text.toLowerCase().includes("offline")) {
          statusEl.textContent = "⚫ 目前未開台";
          statusEl.className = "status offline";
          card.classList.remove("live");
        } else {
          statusEl.textContent = "🟢 正在直播中";
          statusEl.className = "status live";
          card.classList.add("live");
        }
      })
      .catch(() => {
        statusEl.textContent = "狀態讀取失敗";
        statusEl.className = "status offline";
        card.classList.remove("live");
      });
  }

  /* =========================
     YouTube（Cloudflare Worker 真實偵測）
     ========================= */
  if (channel.platform === "youtube") {
    platformEl.textContent = "YouTube";
    platformEl.className = "platform youtube";

    // 預設先連頻道
    linkEl.href = `https://www.youtube.com/${channel.id}`;

    fetch(`${CONFIG.apiEndpoint}?channel=${encodeURIComponent(channel.id)}`)
      .then(r => r.json())
      .then(data => {
        if (data.live) {
          statusEl.textContent = "🟢 正在直播中";
          statusEl.className = "status live";
          card.classList.add("live");

          // Live 時導向直播頁
          linkEl.href = `https://www.youtube.com/channel/${data.channelId}/live`;
        } else {
          statusEl.textContent = "⚫ 目前未直播";
          statusEl.className = "status offline";
          card.classList.remove("live");
        }
      })
      .catch(() => {
        statusEl.textContent = "狀態讀取失敗";
        statusEl.className = "status offline";
        card.classList.remove("live");
      });
  }
});
