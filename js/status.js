// 取得畫面上的元素
const statusEl = document.getElementById("status");
const linkEl = document.getElementById("link");

// 設定頻道連結
linkEl.href = `https://twitch.tv/${CONFIG.twitch.channel}`;

// 呼叫第三方 API 判斷是否開台
fetch(`https://decapi.me/twitch/uptime/${CONFIG.twitch.channel}`)
  .then(response => response.text())
  .then(text => {
    if (text.toLowerCase().includes("offline")) {
      statusEl.textContent = "⚫ 目前未開台";
      statusEl.className = "status offline";
    } else {
      statusEl.textContent = "🟢 正在直播中";
      statusEl.className = "status live";
    }
  })
  .catch(error => {
    console.error(error);
    statusEl.textContent = "狀態讀取失敗";
  });
