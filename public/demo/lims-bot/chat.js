(function () {
  "use strict";

  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const log = document.getElementById("chat-log");
  const accessDate = "2026-05-03";

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderMarkdown(markdown) {
    return String(markdown)
      .split(/\n{2,}/)
      .map(block => {
        const trimmed = block.trim();
        if (!trimmed) return "";
        if (trimmed.startsWith("# ")) return `<h2>${escapeHtml(trimmed.slice(2))}</h2>`;
        if (trimmed.startsWith("## ")) return `<h3>${escapeHtml(trimmed.slice(3))}</h3>`;
        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").map(line => `<li>${escapeHtml(line.replace(/^- /, ""))}</li>`).join("");
          return `<ul>${items}</ul>`;
        }
        return `<p>${escapeHtml(trimmed)}</p>`;
      })
      .join("");
  }

  function appendMessage(role, html) {
    const article = document.createElement("article");
    article.className = `message ${role}`;
    article.innerHTML = `
      <div class="avatar">${role === "user" ? "YOU" : "LB"}</div>
      <div class="bubble">${html}</div>
    `;
    log.appendChild(article);
    log.scrollTop = log.scrollHeight;
  }

  function responseShell(answerHtml, sourcePath) {
    return `
      ${answerHtml}
      <p class="source">Source: ${escapeHtml(sourcePath)} · Access date: ${accessDate}</p>
      <p class="badge">⚠ Human verification required</p>
    `;
  }

  async function answer(query) {
    const rule = window.LimsBotRouter.route(query);
    if (!rule) {
      return responseShell(renderMarkdown(window.LimsBotRouter.unknown), "canned-router.js");
    }

    try {
      const response = await fetch(rule.file, { cache: "no-store" });
      if (!response.ok) throw new Error(`Missing canned file: ${rule.file}`);
      const markdown = await response.text();
      return responseShell(renderMarkdown(markdown), rule.file);
    } catch (error) {
      return responseShell(renderMarkdown(window.LimsBotRouter.unknown), rule.file);
    }
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    appendMessage("user", `<p>${escapeHtml(query)}</p>`);
    input.value = "";
    appendMessage("bot", "<p>Loading local reference...</p>");
    const pending = log.lastElementChild;
    const html = await answer(query);
    pending.querySelector(".bubble").innerHTML = html;
  });
}());
