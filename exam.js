/* صفحة الاختبار: الأسئلة والتصحيح على الخادم، وهذه الصفحة تعرض وتسجّل الصوت وتراقب الخروج من الصفحة فقط */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var app = $("app");
  var mode = QT.getParam("mode") === "official" ? "official" : "practice";
  var dateParam = QT.isYmd(QT.getParam("d") || "") ? QT.getParam("d") : QT.todayStr();
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent || "");
  var sid = "", cur = null, viol = 0, maxViol = 3, voiceOK = false, timerId = null, qStart = 0, busy = false, active = false, finished = false;
  var selected = -1, pendingViol = false, blurAt = 0, recActiveUntil = 0, recObj = null, recording = false, heard = [], recAttempt = 0, banner = "";
  var esc = QT.esc;

  try { QT.applyTheme(); QT.bindThemeButton("themeButton"); } catch (e) {}
  if (!QT.session()) { window.location.replace("account.html"); return; }
  if (mode === "official") { $("hSmall").innerHTML = "📝 اختبار الجمعة"; $("hTitle").innerHTML = "اختبار الأسبوع"; $("backLink").setAttribute("href", "report.html?d=" + dateParam); }
  else { $("hSmall").innerHTML = "🧪 تدريبي"; $("hTitle").innerHTML = "اختبار تدريبي"; }

  /* ---------- منع النسخ والتحديد ---------- */
  var block = function (ev) { if (active) { ev.preventDefault(); } };
  ["contextmenu", "copy", "cut", "paste", "dragstart", "selectstart"].forEach(function (n) { document.addEventListener(n, block); });

  function norm(s) { return String(s || "").replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, "").replace(/[أإآٱ]/g, "ا"); }

  /* ---------- الشاشة الأولى + فحص الميكروفون ---------- */
  function showIntro() {
    var micHtml;
    if (!SR) micHtml = '<div class="ex-msg">المتصفح ده مش بيدعم التسجيل الصوتي، فهتكون كل الأسئلة اختيارات. ' + (isIOS ? 'على الآيفون افتح الموقع من متصفح <b>Safari</b> مباشرة (مش من أيقونة الشاشة الرئيسية).' : 'جرّب Chrome.') + '</div>';
    else micHtml = '<div id="micTest"><p class="muted">أسئلة التسميع بالصوت: اضغط الزر وقل «بسم الله الرحمن الرحيم» عشان نتأكد إن الميكروفون شغال. لو ما اشتغلش هتكون الأسئلة اختيارات بس ومش هتتحسب عليك.</p><div class="ex-acts"><button class="btn" id="micBtn" type="button">🎤 جرّب الميكروفون</button></div><div id="micOut"></div></div>';
    app.innerHTML = '<div class="ex-card"><h2>' + (mode === "official" ? "📝 اختبار الأسبوع" : "🧪 اختبار تدريبي") + '</h2>' +
      '<ul class="ex-list"><li>20 سؤالًا: من الكنز، ومن الثابت (الجديد)، ومختلط، وأسئلة تسميع بالصوت.</li>' +
      '<li>لكل سؤال وقت محدد، والوقت اللي بتاخده بيتسجّل.</li>' +
      '<li><b>ما تخرجش من الصفحة ولا تغيّر التطبيق</b>: لو خرجت يتغيّر السؤال وتتسجّل مخالفة، وعند ' + maxViol + ' مخالفات ينتهي الاختبار.</li>' +
      (mode === "official" ? '<li>محاولة واحدة فقط، وتصل النتيجة لولي الأمر.</li>' : '<li>ده تدريبي: مش بيتبعت لولي الأمر وتقدر تعيده.</li>') + '</ul>' + micHtml +
      '<div class="ex-acts"><button class="btn" id="goBtn" type="button">▶ ابدأ الاختبار</button></div></div>';
    if (SR) $("micBtn").onclick = micTest;
    $("goBtn").onclick = startExam;
  }
  function micTest() {
    var out = $("micOut"); out.innerHTML = '<div class="ex-msg">🎤 اتكلم دلوقتي...</div>';
    listen(function (alts, err) {
      var t = alts.join(" "), good = /بسم/.test(norm(t)) || /الله/.test(norm(t));
      if (good) { voiceOK = true; out.innerHTML = '<div class="ex-msg ok">✅ الميكروفون شغال. سمعتك: ' + esc(alts[0] || t) + '</div>'; }
      else { voiceOK = false; out.innerHTML = '<div class="ex-msg err">ما اتعرفش على كلامك' + (err === "not-allowed" || err === "service-not-allowed" ? " (اسمح للموقع باستخدام الميكروفون من إعدادات المتصفح)" : "") + '. جرّب تاني، أو ابدأ بدون صوت.</div>'; }
    });
  }

  /* ---------- بدء الاختبار ---------- */
  function startExam() {
    $("goBtn").className = "btn off"; app.insertAdjacentHTML("beforeend", '<div class="ex-card" id="loadingBox">⏳ جاري تجهيز الأسئلة (ممكن ياخد لحظات)...</div>');
    QT.api({ action: "exam", op: "start", mode: mode, voice: voiceOK }, function (ok, data) {
      var lb = $("loadingBox"); if (lb) lb.parentNode.removeChild(lb);
      $("goBtn").className = "btn";
      if (!ok || !data) { app.insertAdjacentHTML("beforeend", '<div class="ex-msg err">تعذّر الاتصال بالخادم. تأكد من النت وجرّب تاني.</div>'); return; }
      if (data.ok === false) { app.insertAdjacentHTML("beforeend", '<div class="ex-msg err">' + esc(data.error || "حدث خطأ") + '</div>' + (mode === "official" ? '<div class="ex-acts"><a class="btn alt" href="exam.html?mode=practice">🧪 جرّب اختبارًا تدريبيًا</a></div>' : "")); return; }
      if (data.done) { showResult(data.result); return; }
      sid = data.sid; viol = data.viol || 0; maxViol = data.maxViol || 3; active = true; finished = false; voiceOK = !!data.voice;
      banner = data.resumed ? "⚠️ رجعت للاختبار بعد خروج: اتغيّر السؤال وتسجّلت مخالفة (" + viol + "/" + maxViol + ")." : "";
      window.onbeforeunload = function () { return "الاختبار شغّال — لو خرجت هتتسجّل مخالفة."; };
      renderQ(data.q);
    }, 40000);
  }

  /* ---------- عرض السؤال ---------- */
  function renderQ(q) {
    cur = q; selected = -1; heard = []; recAttempt = 0; busy = false; stopRec();
    var h = '<div class="ex-card">' + (banner ? '<div class="ex-msg">' + esc(banner) + '</div>' : "") +
      '<div class="ex-top"><span>سؤال ' + q.n + ' / ' + q.total + '</span><span class="warn">⚠️ ' + viol + '/' + maxViol + '</span><span class="ex-timer" id="exTimer">' + q.lim + '</span></div>' +
      '<div class="ex-bar"><i id="exFill"></i></div>' +
      '<p class="ex-prompt">' + esc(q.prompt) + '</p>' + '<div class="ex-ayah">' + esc(q.show) + '</div>';
    banner = "";
    if (q.rec) {
      h += '<div class="ex-mic"><button type="button" class="big" id="micGo">🎤</button><div class="muted" id="micHint">اضغط الميكروفون وابدأ القراءة</div></div>' +
        '<div class="ex-heard" id="heard"></div>' +
        '<div class="ex-acts"><button class="btn off" id="sendRec" type="button">✅ أرسل القراءة</button><button class="btn alt" id="noMic" type="button">🔇 الميكروفون مش شغال</button></div>';
    } else {
      h += '<div id="opts">';
      for (var i = 0; i < q.opts.length; i++) h += '<button type="button" class="ex-opt' + (q.t === "SURAH" ? " name" : "") + '" data-i="' + i + '">' + esc(q.opts[i]) + '</button>';
      h += '</div><div class="ex-acts"><button class="btn off" id="okBtn" type="button">✅ تأكيد الإجابة</button><button class="btn alt" id="skipBtn" type="button">تخطّي</button></div>';
    }
    app.innerHTML = h + '</div>';
    bindQ(q); startTimer(q.lim);
    try { window.scrollTo(0, 0); } catch (e) {}
  }
  function bindQ(q) {
    if (q.rec) {
      $("micGo").onclick = function () { if (busy) return; if (recording) { stopRec(); } else { beginRec(); } };
      $("sendRec").onclick = function () { if (heard.length && !busy) submit({ alts: heard }); };
      $("noMic").onclick = function () { if (!busy) submit({ fail: true }); };
    } else {
      var bs = $("opts").getElementsByClassName("ex-opt"), i;
      for (i = 0; i < bs.length; i++) bs[i].onclick = function () {
        if (busy) return; selected = parseInt(this.getAttribute("data-i"), 10);
        var all = $("opts").getElementsByClassName("ex-opt"), j; for (j = 0; j < all.length; j++) all[j].className = all[j].className.replace(/ ?sel/g, "");
        this.className += " sel"; $("okBtn").className = "btn";
      };
      $("okBtn").onclick = function () { if (selected > -1 && !busy) submit({ ans: selected }); };
      $("skipBtn").onclick = function () { if (!busy) submit({ skip: true }); };
    }
  }
  function startTimer(lim) {
    clearInterval(timerId); qStart = new Date().getTime();
    timerId = setInterval(function () {
      var left = lim - (new Date().getTime() - qStart) / 1000, t = $("exTimer"), f = $("exFill");
      if (!t) { clearInterval(timerId); return; }
      t.innerHTML = Math.max(0, Math.ceil(left)); t.className = "ex-timer" + (left <= 10 ? " low" : "");
      if (f) f.style.width = Math.max(0, left / lim * 100) + "%";
      if (left <= 0) { clearInterval(timerId); onTimeUp(); }
    }, 250);
  }
  function onTimeUp() {
    if (busy || !cur) return;
    if (cur.rec) { if (recording) stopRec(); submit({ alts: heard, final: true }); } else submit({ skip: true });
  }

  /* ---------- إرسال الإجابة ---------- */
  function submit(o) {
    if (busy || !active) return; busy = true; stopRec();
    var p = { action: "exam", op: "answer", sid: sid, n: cur.n }, k; for (k in o) if (o.hasOwnProperty(k)) p[k] = o[k];
    var box = app.querySelector(".ex-acts"); if (box) box.style.opacity = ".5";
    QT.api(p, function (ok, data) {
      if (!ok || !data) { busy = false; if (box) box.style.opacity = "1"; toastMsg("تعذّر الاتصال — اضغط تاني (الوقت ما زال شغّال)"); return; }
      if (data.ok === false) { active = false; clearInterval(timerId); window.onbeforeunload = null; app.innerHTML = '<div class="ex-card"><div class="ex-msg err">' + esc(data.error || "حدث خطأ") + '</div><div class="ex-acts"><a class="btn" href="exam.html?mode=' + mode + '">إعادة</a></div></div>'; return; }
      if (data.retry) {
        busy = false; if (box) box.style.opacity = "1"; recAttempt = data.attempt || 1; heard = [];
        var hd = $("heard"); if (hd) hd.innerHTML = "";
        var s = $("sendRec"); if (s) s.className = "btn off";
        toastMsg(data.why === "nospeech" ? "ما سمعتش حاجة — اتأكد من الميكروفون وجرّب تاني" : "مش واضح كفاية — اقرأ تاني بصوت أوضح (محاولة أخيرة)");
        return;
      }
      if (data.done) { finish(data.result); return; }
      viol = data.viol !== undefined ? data.viol : viol; renderQ(data.q);
    }, 25000);
  }
  function toastMsg(t) { try { QT.toast(t, "err2"); } catch (e) {} }
  function finish(res) { active = false; finished = true; clearInterval(timerId); stopRec(); window.onbeforeunload = null; showResult(res); }

  /* ---------- مراقبة الخروج من الصفحة ---------- */
  function leftPage() {
    if (!active || finished || busy || !sid) return;
    if (new Date().getTime() < recActiveUntil) return;       // لا نحسب نافذة صلاحيات/تسجيل الصوت خروجًا
    pendingViol = true;
  }
  function backToPage() {
    if (!pendingViol || !active || finished) return; pendingViol = false;
    busy = true; clearInterval(timerId);
    QT.api({ action: "exam", op: "viol", sid: sid }, function (ok, data) {
      if (!ok || !data || data.ok === false) { busy = false; startTimer(cur ? Math.max(5, cur.lim - Math.round((new Date().getTime() - qStart) / 1000)) : 10); return; }
      if (data.done) { finish(data.result); return; }
      viol = data.viol; banner = "⚠️ خرجت من الصفحة فاتغيّر السؤال (مخالفة " + viol + "/" + maxViol + "). ركّز واستمر.";
      renderQ(data.q);
    }, 20000);
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) leftPage(); else backToPage(); });
  window.addEventListener("blur", function () { blurAt = new Date().getTime(); if (!document.hidden) { setTimeout(function () { if (blurAt && !document.hasFocus() && new Date().getTime() - blurAt >= 1500) leftPage(); }, 1600); } });
  window.addEventListener("focus", function () { if (blurAt) { blurAt = 0; backToPage(); } });

  /* ---------- التسجيل الصوتي ---------- */
  function listen(done) {                                  // done(alts[], err)
    stopRec();
    var rec, finals = [], interim = "", err = "", idle = null;
    try { rec = new SR(); } catch (e) { done([], "unsupported"); return; }
    rec.lang = "ar-SA"; rec.interimResults = true; rec.maxAlternatives = 3; rec.continuous = !isIOS;
    function resetIdle() { clearTimeout(idle); idle = setTimeout(function () { try { rec.stop(); } catch (e) {} }, 3500); }
    rec.onresult = function (e) {
      finals = []; interim = "";
      for (var i = 0; i < e.results.length; i++) {
        var r = e.results[i];
        if (r.isFinal) { var a = [], j; for (j = 0; j < r.length; j++) a.push(r[j].transcript); finals.push(a); } else interim += r[0].transcript + " ";
      }
      var shown = finals.map(function (a) { return a[0]; }).join(" ") + " " + interim; var hd = $("heard"); if (hd) hd.innerHTML = esc(shown);
      resetIdle();
    };
    rec.onerror = function (e) { err = (e && e.error) || "error"; };
    rec.onend = function () {
      clearTimeout(idle); recording = false; recObj = null; recActiveUntil = new Date().getTime() + 2500;
      var alts = [], k, a;
      for (k = 0; k < 3; k++) { a = finals.map(function (f) { return f[k] || f[0]; }).join(" ").replace(/\s+/g, " ").trim(); if (!a && k === 0) a = interim.trim(); if (a && alts.indexOf(a) < 0) alts.push(a); }
      done(alts, err);
    };
    recObj = rec; recording = true; recActiveUntil = new Date().getTime() + 600000;
    try { rec.start(); resetIdle(); } catch (e2) { recording = false; recActiveUntil = 0; done([], "start-failed"); }
  }
  function stopRec() { if (recObj) { try { recObj.stop(); } catch (e) {} } }
  function beginRec() {
    var mg = $("micGo"), hint = $("micHint"), hd = $("heard"); if (!mg) return;
    mg.className = "big rec"; mg.innerHTML = "⏹"; hint.innerHTML = "بنسمعك... اقرأ الآية (اضغط للإيقاف)"; hd.innerHTML = "";
    listen(function (alts, err) {
      var mg2 = $("micGo"), h2 = $("micHint"), hd2 = $("heard"), sb = $("sendRec"); if (!mg2) return;
      mg2.className = "big"; mg2.innerHTML = "🎤";
      heard = alts;
      if (alts.length) { hd2.innerHTML = esc(alts[0]); h2.innerHTML = "راجع اللي اتسمع، ولو تمام اضغط «أرسل القراءة» أو أعد التسجيل"; sb.className = "btn"; }
      else { h2.innerHTML = (err === "not-allowed" || err === "service-not-allowed") ? "الميكروفون مش مسموح — فعّله من إعدادات المتصفح" : "ما سمعتش حاجة — اضغط الميكروفون وجرّب تاني"; sb.className = "btn off"; }
    });
  }

  /* ---------- النتيجة ---------- */
  function secText(s) { var m = Math.floor(s / 60); return m ? m + "د " + (s % 60) + "ث" : s + "ث"; }
  function showResult(r) {
    if (!r) { app.innerHTML = '<div class="ex-card"><div class="ex-msg err">لا توجد نتيجة.</div></div>'; return; }
    var by = r.by || {}, rows = "";
    function row(a, b) { rows += '<div class="ex-row"><span>' + a + '</span><b>' + b + '</b></div>'; }
    function pts(x) { return String(Math.round(x * 2) / 2).replace(".5", "٫5"); }
    if (by.T && by.T[1]) row("الكنز", pts(by.T[0]) + " / " + by.T[1]);
    if (by.N && by.N[1]) row("الثابت (الجديد)", pts(by.N[0]) + " / " + by.N[1]);
    if (by.X && by.X[1]) row("مختلط", pts(by.X[0]) + " / " + by.X[1]);
    if (r.rec && (r.rec[1] || r.rec[2])) row("التسميع", pts(r.rec[0]) + " / " + r.rec[1] + (r.rec[2] ? " (تعذّر الصوت: " + r.rec[2] + ")" : ""));
    row("الوقت الكلي", secText(r.sumSec || 0)); row("متوسط السؤال", secText(r.avg || 0)); row("مرات الخروج من الصفحة", String(r.viol || 0));
    var rev = "", i, x;
    for (i = 0; i < (r.review || []).length; i++) {
      x = r.review[i]; if (x.st === "ok" || x.st === "void" && !x.cor) continue;
      if (x.pts >= 1) continue;
      rev += '<div class="ex-rev"><b>سؤال ' + x.n + '</b> ' + (x.st === "timeout" ? "⏱ انتهى الوقت" : (x.st === "half" ? "🟡 نصف درجة" : (x.st === "void" ? "🔇 تعذّر الصوت" : (x.st === "unanswered" ? "— لم يُجَب" : "❌")))) + (x.cor ? '<div class="muted">الصحيح:</div><div class="ay">' + esc(x.cor) + '</div>' : "") + '</div>';
    }
    app.innerHTML = '<div class="ex-card"><h2 style="text-align:center">' + (r.ended === "violations" ? "⛔ انتهى الاختبار بسبب الخروج المتكرر" : "✅ انتهى الاختبار") + '</h2>' +
      '<div class="ex-score">' + pts(r.score) + ' من ' + r.total + '</div><div style="text-align:center;font-weight:700">' + r.pct + '%</div>' + rows + '</div>' +
      (rev ? '<div class="ex-card"><h3>مراجعة الأسئلة اللي فيها نقص</h3>' + rev + '</div>' : "") +
      '<div class="ex-card">' + (r.mode === "official" ? '<div class="ex-msg ok">عشان النتيجة توصل لولي الأمر: ارجع لصفحة الجمعة واضغط «📤 تسجيل تقرير اليوم».</div><div class="ex-acts"><a class="btn" href="report.html?d=' + esc(r.date || dateParam) + '">📋 رجوع لتقرير الجمعة</a></div>' : '<div class="ex-acts"><a class="btn" href="exam.html?mode=practice">🔁 اختبار تدريبي جديد</a><a class="btn alt" href="index.html">الرئيسية</a></div>') + '</div>';
    try { window.scrollTo(0, 0); } catch (e) {}
  }

  showIntro();
})();
