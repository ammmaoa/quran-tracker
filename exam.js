/* صفحة الاختبار: الأسئلة والتصحيح على الخادم، وهذه الصفحة تعرض وتسجّل الصوت وتراقب الخروج من الصفحة فقط */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var app = $("app");
  var mode = QT.getParam("mode") === "official" ? "official" : "practice";
  var dateParam = QT.isYmd(QT.getParam("d") || "") ? QT.getParam("d") : QT.todayStr();
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent || "");
  var SILENCE_MS = 60000;                                  // لا يتوقف التسجيل من نفسه إلا بعد دقيقة صمت كاملة (أو بضغطك على إنهاء)
  var sid = "", cur = null, viol = 0, maxViol = 3, voiceOK = false, timerId = null, qStart = 0, busy = false, active = false, finished = false;
  var selected = -1, pendingViol = false, blurAt = 0, recActiveUntil = 0, banner = "";
  var R = null;                                            // حالة التسجيل الحالية
  var words = [], rawAlts = [];                            // كلمات ما سُمع (للحذف فقط) + بدائل التعرّف الأصلية
  var esc = QT.esc;

  try { QT.applyTheme(); QT.bindThemeButton("themeButton"); } catch (e) {}
  if (!QT.session()) { window.location.replace("account.html"); return; }
  if (mode === "official") { $("hSmall").innerHTML = "📝 اختبار الجمعة"; $("hTitle").innerHTML = "اختبار الأسبوع"; $("backLink").setAttribute("href", "report.html?d=" + dateParam); }
  else { $("hSmall").innerHTML = "🧪 تدريبي"; $("hTitle").innerHTML = "اختبار تدريبي"; }

  var block = function (ev) { if (active) { ev.preventDefault(); } };
  ["contextmenu", "copy", "cut", "paste", "dragstart", "selectstart"].forEach(function (n) { document.addEventListener(n, block); });
  function norm(s) { return String(s || "").replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, "").replace(/[أإآٱ]/g, "ا"); }

  /* ---------- الشاشة الأولى + فحص الميكروفون ---------- */
  function showIntro() {
    var micHtml;
    if (!SR) micHtml = '<div class="ex-msg">المتصفح ده مش بيدعم التسجيل الصوتي، فهتكون كل الأسئلة اختيارات. ' + (isIOS ? 'على الآيفون افتح الموقع من متصفح <b>Safari</b> مباشرة (مش من أيقونة الشاشة الرئيسية).' : 'جرّب Chrome.') + '</div>';
    else micHtml = '<div id="micTest"><p class="muted">أسئلة التسميع بالصوت: اضغط الزر وقل «بسم الله الرحمن الرحيم» عشان نتأكد إن الميكروفون شغال. لو ما اشتغلش هتكون الأسئلة اختيارات بس ومش هتتحسب عليك.</p><div class="ex-acts"><button class="btn" id="micBtn" type="button">🎤 جرّب الميكروفون</button></div><div id="micOut"></div></div>';
    app.innerHTML = '<div class="ex-card"><h2>' + (mode === "official" ? "📝 اختبار الأسبوع" : "🧪 اختبار تدريبي") + '</h2>' +
      '<ul class="ex-list"><li>حتى 20 سؤالًا صعبًا (حسب اللي حفظته): إكمال آيات، وآية بعد/قبل آية، وسورة، وتسميع بالصوت. الخيارات متشابهة عن قصد.</li>' +
      '<li>لكل سؤال وقت محدد، والوقت اللي بتاخده بيتسجّل.</li>' +
      '<li>في التسميع: اضغط ⏹ لما تخلّص. التسجيل ما بيقفش وإنت بتاخد نفس. وتقدر تحذف أي كلمة زايدة اتسمعت بالغلط (مش تضيف).</li>' +
      '<li><b>ما تخرجش من الصفحة ولا تغيّر التطبيق</b>: لو خرجت يتغيّر السؤال وتتسجّل مخالفة، وعند ' + maxViol + ' مخالفات ينتهي الاختبار.</li>' +
      (mode === "official" ? '<li>محاولة واحدة فقط، وتصل النتيجة لولي الأمر.</li>' : '<li>ده تدريبي: مش بيتبعت لولي الأمر وتقدر تعيده.</li>') +
      '<li>في الآخر بتشوف كل الأسئلة وإجاباتك والصح.</li></ul>' + micHtml +
      '<div class="ex-acts"><button class="btn" id="goBtn" type="button">▶ ابدأ الاختبار</button></div></div>';
    if (SR) $("micBtn").onclick = micTest;
    $("goBtn").onclick = startExam;
  }
  function micTest() {
    var out = $("micOut"); out.innerHTML = '<div class="ex-msg">🎤 اتكلم دلوقتي...</div>';
    var rr = newRec(function (alts, err) {
      var t = alts.join(" "), good = /بسم/.test(norm(t)) || /الله/.test(norm(t));
      if (good) { voiceOK = true; out.innerHTML = '<div class="ex-msg ok">✅ الميكروفون شغال. سمعتك: ' + esc(alts[0] || t) + '</div>'; }
      else { voiceOK = false; out.innerHTML = '<div class="ex-msg err">ما اتعرفش على كلامك' + (err === "not-allowed" || err === "service-not-allowed" ? " (اسمح للموقع باستخدام الميكروفون من إعدادات المتصفح)" : "") + '. جرّب تاني، أو ابدأ بدون صوت.</div>'; }
    }, { silenceMs: 7000, quick: true });
    rr.start();
  }

  /* ---------- محرّك التسجيل: يعيد التشغيل لو توقّف وحده، ويجمع الكلام، ولا يقف إلا بالضغط أو بعد صمت طويل ---------- */
  function newRec(onDone, opt) {
    opt = opt || {};
    var o = { wanted: false, segs: [], here: [], interim: "", engine: null, lastSpeech: 0, err: "", fatal: false, netFails: 0, watch: null, onLive: opt.onLive || null };
    function build() {
      var alts = [], k, a;
      for (k = 0; k < 3; k++) { a = o.segs.map(function (f) { return f[k] || f[0]; }).join(" ").replace(/\s+/g, " ").replace(/^\s|\s$/g, ""); if (!a && k === 0) a = o.interim.replace(/^\s|\s$/g, ""); if (a && alts.indexOf(a) < 0) alts.push(a); }
      return alts;
    }
    function live() { if (o.onLive) o.onLive(o.segs.map(function (f) { return f[0]; }).join(" ") + " " + o.here.map(function (f) { return f[0]; }).join(" ") + " " + o.interim); }
    function engineStart() {
      var rec; try { rec = new SR(); } catch (e) { o.fatal = true; o.err = "unsupported"; finish(); return; }
      o.engine = rec; o.here = []; o.interim = "";
      rec.lang = "ar-SA"; rec.interimResults = true; rec.maxAlternatives = 3; rec.continuous = !isIOS;
      rec.onresult = function (e) {
        o.here = []; o.interim = ""; o.lastSpeech = new Date().getTime(); o.netFails = 0;
        for (var i = 0; i < e.results.length; i++) { var r = e.results[i]; if (r.isFinal) { var a = [], j; for (j = 0; j < r.length; j++) a.push(r[j].transcript); o.here.push(a); } else o.interim += r[0].transcript + " "; }
        live();
      };
      rec.onerror = function (e) {
        var er = (e && e.error) || "error"; o.err = er;
        if (er === "not-allowed" || er === "service-not-allowed" || er === "audio-capture") o.fatal = true;
        if (er === "network") { o.netFails++; if (o.netFails >= 4) o.fatal = true; }
      };
      rec.onend = function () {
        if (o.here.length) o.segs = o.segs.concat(o.here); else if (o.interim.replace(/\s/g, "")) o.segs.push([o.interim.replace(/^\s|\s$/g, "")]);
        o.here = []; o.interim = ""; o.engine = null; live();
        if (o.wanted && !o.fatal && new Date().getTime() - o.lastSpeech < (opt.silenceMs || SILENCE_MS)) setTimeout(function () { if (o.wanted) engineStart(); }, 220);
        else finish();
      };
      try { rec.start(); } catch (e2) { o.engine = null; if (o.wanted) { o.fatal = true; o.err = "start-failed"; finish(); } }
    }
    function finish() {
      var was = o.wanted; o.wanted = false; clearInterval(o.watch); recActiveUntil = new Date().getTime() + 2500;
      if (R === o) R = null;
      if (o.done) return; o.done = true;
      onDone(build(), o.err, was);
    }
    o.start = function () {
      o.wanted = true; o.lastSpeech = new Date().getTime(); o.done = false; recActiveUntil = new Date().getTime() + 900000;
      o.watch = setInterval(function () {                      // صمت طويل جدًا: نوقف (وفي فحص الميكروفون نوقف بعد ثانيتين ونصف من آخر كلام)
        var limit = (opt.quick && (o.segs.length || o.here.length)) ? 2500 : (opt.silenceMs || SILENCE_MS);
        if (o.wanted && new Date().getTime() - o.lastSpeech >= limit) o.stop();
      }, 500);
      engineStart();
    };
    o.stop = function () { o.wanted = false; if (o.engine) { try { o.engine.stop(); } catch (e) {} } else finish(); };
    o.abort = function () { o.wanted = false; o.done = true; clearInterval(o.watch); if (o.engine) { try { o.engine.abort(); } catch (e) {} } recActiveUntil = new Date().getTime() + 2500; };
    return o;
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
    cur = q; selected = -1; words = []; rawAlts = []; busy = false; if (R) { R.abort(); R = null; }
    var h = '<div class="ex-card">' + (banner ? '<div class="ex-msg">' + esc(banner) + '</div>' : "") +
      '<div class="ex-top"><span>سؤال ' + q.n + ' / ' + q.total + '</span><span class="warn">⚠️ ' + viol + '/' + maxViol + '</span><span class="ex-timer" id="exTimer">' + q.lim + '</span></div>' +
      '<div class="ex-bar"><i id="exFill"></i></div>' +
      '<p class="ex-prompt">' + esc(q.prompt) + '</p>' + '<div class="ex-ayah">' + esc(q.show) + '</div>';
    banner = "";
    if (q.rec) {
      h += '<div class="ex-mic"><button type="button" class="big" id="micGo">🎤</button><div class="muted" id="micHint">اضغط الميكروفون وابدأ القراءة. خد وقتك، وإنت بتاخد نفس ما بيقفش. اضغط ⏹ لما تخلّص.</div></div>' +
        '<div class="ex-heard" id="heard"></div><div id="chipTools"></div>' +
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
      $("micGo").onclick = function () { if (busy) return; if (R && R.wanted) { R.stop(); } else { beginRec(); } };
      $("sendRec").onclick = function () { if (!busy && words.length) sendRecitation(); };
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
    if (cur.rec) {
      if (R && R.wanted) { var rr = R; rr.stop(); setTimeout(function () { sendRecitation(true); }, 700); }
      else sendRecitation(true);
    } else submit({ skip: true });
  }

  /* ---------- التسميع ---------- */
  function beginRec() {
    var mg = $("micGo"), hint = $("micHint"), hd = $("heard"); if (!mg) return;
    mg.className = "big rec"; mg.innerHTML = "⏹"; hint.innerHTML = "بنسمعك... اقرأ براحتك واضغط ⏹ لما تخلّص"; hd.innerHTML = ""; $("chipTools").innerHTML = ""; words = [];
    var sb = $("sendRec"); if (sb) sb.className = "btn off";
    R = newRec(function (alts, err) {
      var mg2 = $("micGo"), h2 = $("micHint"); if (!mg2) return;
      mg2.className = "big"; mg2.innerHTML = "🎤"; rawAlts = alts;
      if (alts.length) {
        words = alts[0].split(/\s+/).filter(function (w) { return w; }).map(function (w) { return { w: w, off: false }; });
        h2.innerHTML = "راجع اللي اتسمع. لو فيه كلمة زايدة اضغط عليها لحذفها، ولو تمام اضغط «أرسل». أو اضغط 🎤 وسجّل من جديد.";
        renderChips();
      } else {
        h2.innerHTML = (err === "not-allowed" || err === "service-not-allowed") ? "الميكروفون مش مسموح — فعّله من إعدادات المتصفح" : "ما سمعتش حاجة — اضغط الميكروفون وجرّب تاني";
        $("heard").innerHTML = ""; var sb2 = $("sendRec"); if (sb2) sb2.className = "btn off";
      }
    }, { onLive: function (t) { var hd2 = $("heard"); if (hd2) hd2.innerHTML = esc(t); } });
    R.start();
  }
  function renderChips() {
    var hd = $("heard"), tools = $("chipTools"), h = "", i, any = false;
    if (!hd) return;
    for (i = 0; i < words.length; i++) { h += '<span class="chip' + (words[i].off ? " off" : "") + '" data-i="' + i + '">' + esc(words[i].w) + '</span> '; if (words[i].off) any = true; }
    hd.innerHTML = h;
    tools.innerHTML = '<div class="muted" style="text-align:center;margin-bottom:6px">اضغط على كلمة لحذفها (واضغط تاني لاسترجاعها). مش بتقدر تضيف أو تغيّر كلمات.</div>' + (any ? '<div class="ex-acts"><button class="btn alt" id="restoreAll" type="button">↩ استرجع الكل</button></div>' : "");
    var cs = hd.getElementsByClassName("chip");
    for (i = 0; i < cs.length; i++) cs[i].onclick = function () { var k = parseInt(this.getAttribute("data-i"), 10); words[k].off = !words[k].off; renderChips(); };
    var ra = $("restoreAll"); if (ra) ra.onclick = function () { for (var j = 0; j < words.length; j++) words[j].off = false; renderChips(); };
    var left = words.filter(function (x) { return !x.off; }).length, sb = $("sendRec"); if (sb) sb.className = left ? "btn" : "btn off";
  }
  function sendRecitation(final) {
    var kept = words.filter(function (x) { return !x.off; }).map(function (x) { return x.w; }).join(" "), alts = [];
    if (kept) alts.push(kept);
    rawAlts.forEach(function (a) { if (alts.indexOf(a) < 0) alts.push(a); });
    var p = { alts: alts }; if (final) p.final = true; submit(p);
  }

  /* ---------- إرسال الإجابة ---------- */
  function submit(o) {
    if (busy || !active) return; busy = true; if (R) { R.abort(); R = null; }
    var p = { action: "exam", op: "answer", sid: sid, n: cur.n }, k; for (k in o) if (o.hasOwnProperty(k)) p[k] = o[k];
    var box = app.querySelector(".ex-acts"); if (box) box.style.opacity = ".5";
    QT.api(p, function (ok, data) {
      if (!ok || !data) { busy = false; if (box) box.style.opacity = "1"; toastMsg("تعذّر الاتصال — اضغط تاني (الوقت ما زال شغّال)"); return; }
      if (data.ok === false) { active = false; clearInterval(timerId); window.onbeforeunload = null; app.innerHTML = '<div class="ex-card"><div class="ex-msg err">' + esc(data.error || "حدث خطأ") + '</div><div class="ex-acts"><a class="btn" href="exam.html?mode=' + mode + '">إعادة</a></div></div>'; return; }
      if (data.retry) {
        busy = false; if (box) box.style.opacity = "1";
        var h = $("micHint");
        if (data.why === "nospeech") { toastMsg("ما سمعتش حاجة — اتأكد من الميكروفون وجرّب تاني"); if (h) h.innerHTML = "ما اتسمعش كلام. اضغط 🎤 وجرّب تاني (محاولة " + (data.attempt + 1) + " من " + (data.max || 3) + ")"; words = []; var hd = $("heard"); if (hd) hd.innerHTML = ""; var ct = $("chipTools"); if (ct) ct.innerHTML = ""; var sb = $("sendRec"); if (sb) sb.className = "btn off"; }
        else { toastMsg("لسه مش مطابق للآية المطلوبة — محاولة " + (data.attempt + 1) + " من " + (data.max || 3)); if (h) h.innerHTML = "النص اللي اتسمع مش مطابق كفاية للآية. احذف الكلمات الزايدة أو الغلط من فوق، أو اضغط 🎤 وأعد القراءة (محاولة " + (data.attempt + 1) + " من " + (data.max || 3) + ")."; }
        return;
      }
      if (data.done) { finish(data.result); return; }
      viol = data.viol !== undefined ? data.viol : viol; renderQ(data.q);
    }, 25000);
  }
  function toastMsg(t) { try { QT.toast(t, "err2"); } catch (e) {} }
  function finish(res) { active = false; finished = true; clearInterval(timerId); if (R) { R.abort(); R = null; } window.onbeforeunload = null; showResult(res); }

  /* ---------- مراقبة الخروج من الصفحة ---------- */
  function leftPage() {
    if (!active || finished || busy || !sid) return;
    if (new Date().getTime() < recActiveUntil) return;       // نافذة صلاحيات/تسجيل الصوت ليست خروجًا
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

  /* ---------- النتيجة + مراجعة كل الأسئلة ---------- */
  function secText(s) { var m = Math.floor(s / 60); return m ? m + "د " + (s % 60) + "ث" : s + "ث"; }
  function pts(x) { return String(Math.round(x * 2) / 2).replace(".5", "٫5"); }
  function badge(x) {
    if (x.st === "ok") return '<span class="bd ok">✅ صحيحة</span>';
    if (x.st === "half") return '<span class="bd half">🟡 نصف درجة</span>';
    if (x.st === "void") return '<span class="bd void">🔇 تعذّر الصوت (لم تُحتسب)</span>';
    if (x.st === "timeout") return '<span class="bd bad">⏱ انتهى الوقت</span>';
    if (x.st === "unanswered") return '<span class="bd bad">— لم تُحَل</span>';
    return '<span class="bd bad">❌ خطأ</span>';
  }
  function reviewItem(x) {
    var h = '<div class="ex-q ' + (x.st === "ok" ? "good" : (x.st === "half" || x.st === "void" ? "mid" : "bad")) + '"><div class="qh"><b>سؤال ' + x.n + '</b> ' + badge(x) + ' <small>' + secText(x.sec || 0) + '</small></div>' +
      '<div class="qp">' + esc(x.prompt || "") + '</div><div class="ex-ayah sm">' + esc(x.show || "") + '</div>', i, cls, mark;
    if (x.opts) {
      for (i = 0; i < x.opts.length; i++) {
        cls = ""; mark = "";
        if (i === x.ans) { cls = " right"; mark = "✅ "; }
        if (x.mine === i && i !== x.ans) { cls = " wrong"; mark = "❌ "; }
        h += '<div class="ro' + cls + '">' + mark + esc(x.opts[i]) + (x.mine === i ? ' <small>(إجابتك)</small>' : '') + '</div>';
      }
      if (x.mine === null || x.mine === undefined) h += '<div class="muted">لم تختر إجابة.</div>';
    } else if (x.rec) {
      h += '<div class="muted">ما قلته:</div><div class="ay">' + (x.hyp ? esc(x.hyp) : "— لم يُسمع شيء —") + '</div>' +
        '<div class="muted">الآية الصحيحة:</div><div class="ro right">' + esc(x.cor || "") + '</div>';
      if (x.diff && x.st !== "ok") {
        if (x.diff.miss && x.diff.miss.length) h += '<div class="muted">كلمات ناقصة أو مختلفة: <b>' + esc(x.diff.miss.join(" ، ")) + '</b></div>';
        if (x.diff.extra && x.diff.extra.length) h += '<div class="muted">كلمات زايدة: <b>' + esc(x.diff.extra.join(" ، ")) + '</b></div>';
        h += '<div class="muted"><small>(المقارنة على الحروف بدون تشكيل، وممكن يكون سبب الاختلاف تعرّف الصوت مش قراءتك.)</small></div>';
      }
    }
    return h + '</div>';
  }
  function showResult(r) {
    if (!r) { app.innerHTML = '<div class="ex-card"><div class="ex-msg err">لا توجد نتيجة.</div></div>'; return; }
    var by = r.by || {}, rows = "";
    function row(a, b) { rows += '<div class="ex-row"><span>' + a + '</span><b>' + b + '</b></div>'; }
    if (by.T && by.T[1]) row("الكنز", pts(by.T[0]) + " / " + by.T[1]);
    if (by.N && by.N[1]) row("الثابت (الجديد)", pts(by.N[0]) + " / " + by.N[1]);
    if (by.X && by.X[1]) row("مختلط", pts(by.X[0]) + " / " + by.X[1]);
    if (r.rec && (r.rec[1] || r.rec[2])) row("التسميع", pts(r.rec[0]) + " / " + r.rec[1] + (r.rec[2] ? " (تعذّر الصوت: " + r.rec[2] + ")" : ""));
    row("الوقت الكلي", secText(r.sumSec || 0)); row("متوسط السؤال", secText(r.avg || 0)); row("مرات الخروج من الصفحة", String(r.viol || 0));
    var rev = "", i; for (i = 0; i < (r.review || []).length; i++) rev += reviewItem(r.review[i]);
    app.innerHTML = '<div class="ex-card"><h2 style="text-align:center">' + (r.ended === "violations" ? "⛔ انتهى الاختبار بسبب الخروج المتكرر" : "✅ انتهى الاختبار") + '</h2>' +
      '<div class="ex-score">' + pts(r.score) + ' من ' + r.total + '</div><div style="text-align:center;font-weight:700">' + r.pct + '%</div>' + rows + '</div>' +
      '<div class="ex-card">' + (r.mode === "official" ? '<div class="ex-msg ok">عشان النتيجة توصل لولي الأمر: ارجع لصفحة الجمعة واضغط «📤 تسجيل تقرير اليوم».</div><div class="ex-acts"><a class="btn" href="report.html?d=' + esc(r.date || dateParam) + '">📋 رجوع لتقرير الجمعة</a></div>' : '<div class="ex-acts"><a class="btn" href="exam.html?mode=practice">🔁 اختبار تدريبي جديد</a><a class="btn alt" href="index.html">الرئيسية</a></div>') + '</div>' +
      (rev ? '<div class="ex-card"><h3>📖 مراجعة الاختبار كاملًا (الأسئلة وإجاباتك والصح)</h3><div class="ex-acts" id="revFilter"><button class="btn" data-f="all" type="button">الكل</button><button class="btn alt" data-f="bad" type="button">اللي فيه نقص فقط</button></div><div id="revList">' + rev + '</div></div>' : "");
    var rf = $("revFilter"); if (rf) rf.onclick = function (ev) { var t = ev.target || ev.srcElement, f = t && t.getAttribute && t.getAttribute("data-f"); if (!f) return; var qs = $("revList").getElementsByClassName("ex-q"), j; for (j = 0; j < qs.length; j++) qs[j].style.display = (f === "all" || qs[j].className.indexOf("good") < 0) ? "" : "none"; };
    try { window.scrollTo(0, 0); } catch (e) {}
  }

  showIntro();
})();
