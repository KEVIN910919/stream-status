const listEl = document.getElementById("channelList");

CONFIG.channels.forEach(channel => {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="header">
      <img class="avatar">
      <div>
        <div class="name"></div>
        <div class="platform"></div>
      </div>
    </div>
    <div class="status">檢查中…</div>
    <a class="link" target="_blank">前往頻道</a>
  `;

  listEl.appendChild(card);

  const avatarEl = card.querySelector(".avatar");
  const nameEl = card.querySelector(".name");
  const platformEl = card.querySelector(".platform");
  const statusEl = card.querySelector(".status");
  const linkEl = card.querySelector(".link");

  /* ======================
     Twitch only
  ====================== */
  if (channel.platform === "twitch") {

    platformEl.textContent = "Twitch";
    linkEl.href = `https://twitch.tv/${channel.twitch.channel}`;

    /* ===== 顯示名稱 / 頭像 ===== */
    if (channel.twitch.customProfile) {
      // 🔹 使用自訂資料
      avatarEl.src = channel.twitch.avatar;
      nameEl.textContent = channel.twitch.name;
    } else {
      // 🔹 使用 Twitch 官方資料
      fetch(`https://decapi.me/twitch/user/${channel.twitch.channel}`)
        .then(r => r.json())
        .then(user => {
          avatarEl.src = user.profile_image_url;
          nameEl.textContent = user.display_name;
        });
    }

    /* ===== 直播狀態 ===== */
    fetch(`https://decapi.me/twitch/uptime/${channel.twitch.channel}`)
      .then(r => r.text())
      .then(text => {
        if (text.toLowerCase().includes("offline")) {
          statusEl.textContent = "⚫ 目前未開台";
          statusEl.className = "status offline";
        } else {
          statusEl.textContent = "🟢 正在直播中";
          statusEl.className = "status live";
        }
      })
      .catch(() => {
        statusEl.textContent = "狀態讀取失敗";
      });
  }

  /* ======================
     YouTube only（展示型）
  ====================== */
  if (channel.platform === "youtube") {

    platformEl.textContent = "YouTube";
    avatarEl.src = channel.youtube.avatar;
    nameEl.textContent = channel.youtube.name;
    linkEl.href = `https://www.youtube.com/channel/${channel.youtube.channelId}`;

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/live_stream?channel=${channel.youtube.channelId}`;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    setTimeout(() => {
      statusEl.textContent = "⚫ 未偵測到直播";
      statusEl.className = "status offline";
      iframe.remove();
    }, 2000);
  }

});
