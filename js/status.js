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

    // 🔑 快取破壞（iframe / Safari / Google Sites 必須）
    const ts = Date.now();

    fetch(
      `https://decapi.me/twitch/uptime/${encodeURIComponent(
        channel.twitch.channel
      )}?_=${ts}`,
      {
        cache: "no-store"
      }
    )
      .then(r => {
        if (!r.ok) throw new Error("Network error");
        return r.text();
      })
      .then(text => {
        const t = text.toLowerCase();

        // decapi 常見 offline 回傳字樣
        const isOffline =
          t.includes("offline") ||
          t.includes("not live") ||
          t.includes("is not live");

        if (isOffline) {
          statusEl.textContent = "⚫ 目前未直播";
          statusEl.className = "status offline";
          card.classList.remove("live");
        } else {
          statusEl.textContent = "🟢 正在直播中";
          statusEl.className = "status live";
          card.classList.add("live");
        }
      })
      .catch(err => {
        console.error("Twitch status error:", err);
        statusEl.textContent = "狀態讀取失敗";
        statusEl.className = "status offline";
        card.classList.remove("live");
      });
  }

  /* =========================
     YouTube
     ========================= */
  if (channel.platform === "youtube") {
    platformEl.textContent = "YouTube";
    platformEl.className = "platform youtube";

    // 預設連到頻道首頁
    linkEl.href = `https://www.youtube.com/channel/${channel.id}`;

    const previewEl = card.querySelector(".preview");

    // 🔑 快取破壞（避免瀏覽器 / CF 快取）
    const ts = Date.now();

    fetch(`${CONFIG.apiEndpoint}?channel=${channel.id}&_=${ts}`, {
      cache: "no-store"
    })
      .then(r => {
        if (!r.ok) throw new Error("Worker error");
        return r.json();
      })
      .then(data => {
        if (data.live === true) {
          // 🟢 正在直播
          statusEl.textContent = "🟢 正在直播中";
          statusEl.className = "status live";
          card.classList.add("live");

          // 直播連結
          linkEl.href = data.url;

          // 🎥 顯示直播預覽
          previewEl.innerHTML = `
            <iframe
              src="https://www.youtube.com/embed/${data.videoId}?autoplay=0&mute=1"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          `;
          previewEl.classList.remove("hidden");

       } else {
          // ⚫ 未直播
          statusEl.textContent = "⚫ 目前未直播";
         statusEl.className = "status offline";
          card.classList.remove("live");

          // 隱藏預覽
          previewEl.innerHTML = "";
          previewEl.classList.add("hidden");
        }
      })
      .catch(err => {
        console.error("YouTube RSS error:", err);
        statusEl.textContent = "狀態讀取失敗";
        statusEl.className = "status offline";
        card.classList.remove("live");

        // 保險：錯誤時也不顯示預覽
        previewEl.innerHTML = "";
        previewEl.classList.add("hidden");
      });
  }
});
