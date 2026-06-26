"use strict";

const state = { queue: [], idx: 0, photo: null, authUrl: "" };

const $ = (id) => document.getElementById(id);

function rect64Decode(hex) {
  const v = (i) => parseInt(hex.slice(i, i + 4), 16) / 65535;
  return [v(0), v(4), v(8), v(12)]; // x1,y1,x2,y2 fractions
}

function tierOf(cos) {
  if (cos == null) return "unknown";
  if (cos >= 0.55) return "high";
  if (cos >= 0.45) return "medium";
  return "borderline";
}

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 1800);
}

async function api(path, opts) {
  const r = await fetch(path, opts);
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

async function loadStats() {
  const { data } = await api("/api/stats");
  const total = data.total || 0;
  const reviewed = data.reviewed || 0;
  const pct = total ? Math.round((reviewed / total) * 100) : 0;
  $("progressFill").style.width = pct + "%";
  const bs = data.by_status || {};
  $("progressText").textContent =
    `${reviewed}/${total} reviewed (${pct}%) · pending ${bs.pending || 0} · posted ${bs.posted || 0} · ` +
    `rejected ${bs.rejected || 0} · skipped ${bs.skipped || 0} · possible dup ${bs.duplicate || 0}`;
  const auth = data.auth || {};
  if (auth.mock) { $("mockBadge").style.display = ""; }
  const ab = $("authBadge");
  ab.textContent = auth.mock ? "auth: mock" : (auth.authorized ? "auth: ok" : "auth: not connected");
  ab.className = "badge " + (auth.authorized ? "ok" : "warn");
}

async function loadQueue() {
  const tier = $("tierFilter").value;
  const event = $("eventFilter").value.trim();
  const qs = new URLSearchParams();
  if (tier) qs.set("tier", tier);
  if (event) qs.set("event", event);
  const { data } = await api("/api/queue?" + qs.toString());
  state.queue = data.photo_ids || [];
  state.idx = 0;
  if (state.queue.length === 0) {
    $("stageInner").innerHTML = `<div class="empty">No photos with open suggestions for this filter. 🎉</div>`;
    $("suggList").innerHTML = `<div class="meta">—</div>`;
    $("existingList").textContent = "—";
    $("photoMeta").textContent = "—";
    $("posText").textContent = "";
    return;
  }
  showPhoto(0);
}

async function showPhoto(i) {
  if (i < 0 || i >= state.queue.length) return;
  state.idx = i;
  const pid = state.queue[i];
  $("posText").textContent = `photo ${i + 1} / ${state.queue.length}`;
  $("stageInner").innerHTML = `<div class="empty">Loading photo ${pid}…</div>`;
  const { data } = await api("/api/photo/" + pid);
  state.photo = data;
  renderPhoto();
  loadStats();  // dedup is flagged lazily on load, so refresh the counters
}

function renderPhoto() {
  const p = state.photo;
  if (!p || !p.photo_id) { $("stageInner").innerHTML = `<div class="empty">Photo not found.</div>`; return; }

  // image + overlays
  const wrap = document.createElement("div");
  wrap.className = "imgwrap";
  const img = document.createElement("img");
  img.src = p.image_url || "/static/sample.jpg";
  img.alt = p.photo_id;
  wrap.appendChild(img);

  // existing tag rectangles (only those carrying a rect64 hex)
  (p.existing_tags || []).forEach((t) => {
    const m = /\(([0-9a-fA-F]{16})\)\s*$/.exec(t.raw || "");
    if (!m) return;
    wrap.appendChild(makeRect(rect64Decode(m[1]), "existing", nameOf(t.raw), false));
  });
  p.suggestions.forEach((s) => {
    if (!isOpen(s)) return;
    const tier = tierOf(s.cos);
    wrap.appendChild(makeRect(rect64Decode(s.rect_hex), tier, `${s.person_name} ${fmtCos(s.cos)}`, false, s.id));
  });

  $("stageInner").innerHTML = "";
  $("stageInner").appendChild(wrap);
  if (p.error) {
    const e = document.createElement("div");
    e.className = "meta"; e.style.color = "var(--danger)"; e.style.marginTop = "8px";
    e.textContent = "Flickr fetch issue (showing what we have): " + p.error;
    $("stageInner").appendChild(e);
  }

  // meta
  const yr = p.year || "?", ev = p.events || "?";
  $("photoMeta").innerHTML =
    `ID <b>${p.photo_id}</b><br>${yr} / ${ev}<br>` +
    (p.flickr_url ? `<a href="${p.flickr_url}" target="_blank" rel="noopener">open on Flickr ↗</a>` : "") +
    (p.mock ? ` <span class="badge mock">mock image</span>` : "");

  // suggestions list
  const list = $("suggList");
  list.innerHTML = "";
  if (p.suggestions.length === 0) list.innerHTML = `<div class="meta">none</div>`;
  p.suggestions.forEach((s) => list.appendChild(makeSuggCard(s)));

  // existing tags
  const ex = $("existingList");
  if (!p.existing_tags || p.existing_tags.length === 0) ex.textContent = "none / not fetched";
  else ex.innerHTML = p.existing_tags.map((t) => `<span class="tag-chip">${escapeHtml(t.raw || t.clean)}</span>`).join("");

  highlightActive();
}

// "duplicate" is only a hint: it behaves exactly like "pending" for every
// action (default target, auto-advance, quick actions) — see isOpen().
function isOpen(s) { return s.status === "pending" || s.status === "duplicate"; }
function statusLabel(status) { return status === "duplicate" ? "possible duplicate" : status; }
function fmtCos(c) { return c == null ? "" : "cos=" + Number(c).toFixed(3); }
function nameOf(raw) { const i = raw.lastIndexOf("("); return i > 0 ? raw.slice(0, i).trim() : raw; }
function escapeHtml(s) { return (s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function makeRect([x1, y1, x2, y2], cls, label, active, suggId) {
  const d = document.createElement("div");
  d.className = "rect " + cls + (active ? " active" : "");
  d.style.left = (x1 * 100) + "%";
  d.style.top = (y1 * 100) + "%";
  d.style.width = ((x2 - x1) * 100) + "%";
  d.style.height = ((y2 - y1) * 100) + "%";
  if (suggId != null) d.dataset.sugg = suggId;
  const lab = document.createElement("div");
  lab.className = "lab";
  lab.textContent = label;
  d.appendChild(lab);
  return d;
}

function firstOpen() {
  if (!state.photo) return null;
  return state.photo.suggestions.find(isOpen);
}

function makeSuggCard(s) {
  const tier = tierOf(s.cos);
  const div = document.createElement("div");
  div.className = "sugg";
  div.dataset.sugg = s.id;
  const reviewed = !isOpen(s);
  const pill = `<span class="statuspill ${s.status}">${statusLabel(s.status)}</span>`;
  div.innerHTML =
    `<div class="name"><span class="dot ${tier}"></span>${escapeHtml(s.person_name)} ${pill}</div>` +
    `<div class="sub">${fmtCos(s.cos)} · ${s.res || "?"}${s.conf_note ? " · " + s.conf_note : ""} · ${tier}</div>`;
  if (s.status === "duplicate") {
    div.innerHTML += `<div class="sub" style="color:var(--existing)">possible duplicate — a similar name may already be tagged on this photo</div>`;
  }
  const actions = document.createElement("div");
  actions.className = "actions";
  if (!reviewed) {
    actions.innerHTML =
      `<button class="primary" data-act="approve">Approve</button>` +
      `<button class="reject" data-act="reject">Reject</button>` +
      `<button class="skip" data-act="skip">Skip</button>`;
    actions.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => doAction(s.id, b.dataset.act)));
  } else {
    actions.innerHTML = `<span class="meta">${s.status}${s.note ? " — " + escapeHtml(s.note) : ""}</span>`;
  }
  div.appendChild(actions);
  div.addEventListener("mouseenter", () => setActive(s.id));
  return div;
}

function setActive(suggId) {
  state.activeSugg = suggId;
  highlightActive();
}

function highlightActive() {
  const open = firstOpen();
  const active = state.activeSugg || (open && open.id);
  document.querySelectorAll(".sugg").forEach((el) =>
    el.classList.toggle("active", Number(el.dataset.sugg) === active));
  document.querySelectorAll(".rect[data-sugg]").forEach((el) =>
    el.classList.toggle("active", Number(el.dataset.sugg) === active));
}

async function doAction(suggId, act) {
  const { ok, data } = await api(`/api/suggestion/${suggId}/${act}`, { method: "POST" });
  if (!ok) {
    toast((data && data.error) ? `Failed: ${data.error}` : "Action failed");
  } else if (act === "approve") {
    toast(data.posted ? (data.mock ? "Approved (mock post)" : "Posted to Flickr ✓") : "Approved (post pending)");
  } else {
    toast(act === "reject" ? "Rejected" : "Skipped");
  }
  // update local state
  const s = state.photo.suggestions.find((x) => x.id === suggId);
  if (s && data.status) s.status = data.status;
  state.activeSugg = null;
  await loadStats();
  const remaining = state.photo.suggestions.filter(isOpen);
  renderPhoto();
  if (remaining.length === 0) {
    // auto-advance when photo fully handled
    setTimeout(() => nextPhoto(), 250);
  }
}

function nextPhoto() {
  if (state.idx + 1 < state.queue.length) showPhoto(state.idx + 1);
  else toast("End of queue");
}
function prevPhoto() { if (state.idx > 0) showPhoto(state.idx - 1); }

function jumpTo(raw) {
  const q = (raw || "").trim();
  if (!q) return;
  // photo id (matches an entry in the queue) takes precedence over position number
  let i = state.queue.indexOf(q);
  if (i < 0 && /^\d+$/.test(q)) {
    const n = parseInt(q, 10);
    if (n >= 1 && n <= state.queue.length) i = n - 1;
  }
  if (i < 0) { toast("Not in current queue"); return; }
  showPhoto(i);
}

function actOnActive(act) {
  const open = state.photo && state.photo.suggestions.filter(isOpen);
  if (!open || open.length === 0) { nextPhoto(); return; }
  const id = state.activeSugg && open.find((s) => s.id === state.activeSugg) ? state.activeSugg : open[0].id;
  doAction(id, act);
}

// ---- auth modal ----
async function openAuth() {
  const { data } = await api("/api/auth/start", { method: "POST" });
  if (data.mock) { toast("Mock mode — no real auth needed"); return; }
  state.authUrl = data.auth_url || "";
  $("authMsg").textContent = "";
  $("authModal").classList.add("show");
}
$("authBtn").addEventListener("click", openAuth);
$("openAuthUrl").addEventListener("click", () => { if (state.authUrl) window.open(state.authUrl, "_blank"); });
$("closeAuth").addEventListener("click", () => $("authModal").classList.remove("show"));
$("completeAuth").addEventListener("click", async () => {
  const verifier = $("verifierInput").value.trim();
  const { ok, data } = await api("/api/auth/complete", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verifier }),
  });
  if (ok && data.authorized) { $("authModal").classList.remove("show"); toast("Authorized ✓"); loadStats(); }
  else $("authMsg").textContent = data.error || "Authorization failed";
});

// ---- events ----
$("prevBtn").addEventListener("click", prevPhoto);
$("nextBtn").addEventListener("click", nextPhoto);
$("jumpInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") { jumpTo(e.target.value); e.target.blur(); }
});
$("tierFilter").addEventListener("change", loadQueue);
$("eventFilter").addEventListener("change", loadQueue);
document.addEventListener("keydown", (e) => {
  if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
  // Don't hijack browser/OS shortcuts like Ctrl+R (reload), Cmd+L, Alt+Left (back), etc.
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  // Prev/next navigation is always on (safe, non-destructive).
  if (e.key === "ArrowRight") { nextPhoto(); return; }
  if (e.key === "ArrowLeft") { prevPhoto(); return; }
  // Action hotkeys (a/r/s) stay off unless enabled in app.py (REVIEWER_HOTKEYS=1),
  // so an accidental bare "r" can't reject.
  if (!window.ENABLE_HOTKEYS) return;
  if (e.key === "a") actOnActive("approve");
  else if (e.key === "r") actOnActive("reject");
  else if (e.key === "s") actOnActive("skip");
});

(async function init() {
  await loadStats();
  await loadQueue();
})();
