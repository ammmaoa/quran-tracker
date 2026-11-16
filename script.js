// ==========================================
// الصفحة الرئيسية — متابعة حفظ القرآن الكريم
// ==========================================
(function () {
  QT.applyTheme();
  QT.bindThemeButton("themeButton");

  var $ = function (id) { return document.getElementById(id); };
  var M = null;
  var searchText = "";

  function surahStatuses() {
    var res = {};
    if (!M) return res;
    var tl = QT.surahTimeline(M), today = M.today, openNames = {}, i, j;
    for (i = 0; i < M.tDefOpen.length; i++) {
      var segs = QT.segsOf(M.tDefOpen[i].curFrom, M.tDefOpen[i].to);
      for (j = 0; j < segs.length; j++) for (var p = 0; p < segs[j].info.names.length; p++) openNames[segs[j].info.names[p]] = 1;
    }
    if (M.nDefOpen.length) openNames["المائدة"] = 1;
    for (var nm in tl) if (tl.hasOwnProperty(nm)) {
      var o = tl[nm], first = o.first, last = o.last, st;
      var finished = (last.status === "done" || last.status === "compensated") && last.date < today || (last.status === "done" && last.date === today);
      if (finished && !openNames[nm]) st = "completed";
      else if (first.date <= today) st = "progress";
      else st = "planned";
      res[nm] = { st: st, first: first, last: last };
    }
    return res;
  }

  function showSurahs() {
    var list = $("surahList"), html = "", sts = surahStatuses(), done = 0, i;
    for (i = 0; i < QT.SURAHS.length; i++) {
      var s = QT.SURAHS[i];
      var info = sts[s];
      if (info && info.st === "completed") done++;
      if (searchText && s.indexOf(searchText) < 0) continue;
      var cls = "status-not-started", txt = "⚪ لم يبدأ الحفظ", days = "";
      if (info) {
        var f = info.first, l = info.last;
        if (info.st === "completed") { cls = "status-completed"; txt = "🟢 تم حفظ السورة"; }
        else if (info.st === "progress") { cls = "status-planned"; txt = "🟠 جاري حفظها الآن"; }
        else { cls = "status-planned"; txt = "🟡 سيتم حفظها ضمن الخطة"; }
        if (f.n === l.n) days = "سيتم البدء فيها وإنهاؤها في اليوم " + f.n + " (" + QT.shortDate(f.date) + ")";
        else days = "سيبدأ حفظها في اليوم " + f.n + " (" + QT.shortDate(f.date) + ")<br>وسيتم الانتهاء منها في اليوم " + l.n + " (" + QT.shortDate(l.date) + ")";
        if (s === "المائدة") days = "الجديد: " + days;
      }
      html += '<div class="surah-card ' + cls + '"><div class="surah-number">سورة رقم ' + (i + 1) + '</div>' +
              '<div class="surah-name">' + s + '</div><div class="surah-status">' + txt + '</div>' +
              (days ? '<div class="surah-days">📅 ' + days + '</div>' : '') + '</div>';
    }
    list.innerHTML = html || '<p class="muted">لا توجد نتائج</p>';
    return done;
  }

  function render() {
    var st = QT.getState();
    renderBase(st);
    $("startBox").style.display = (st.start || (npStart() && !st.base)) ? "none" : "block";
    if (!st.start) {
      var t = QT.addDays(QT.todayStr(), 1);
      if (!$("startInput").value) $("startInput").value = t;
      $("currentDay").innerHTML = "لم تبدأ الخطة بعد";
      $("dayDescription").innerHTML = "اختر تاريخ البداية من الأعلى";
      showSurahs();
      return;
    }
    M = QT.compute(st, QT.todayStr());
    var today = QT.todayStr();
    var d = M.byDate[today];
    var el = $("currentDay"), ds = $("dayDescription");
    if (today < st.start) {
      el.innerHTML = "تبدأ الخطة " + QT.prettyDate(M.days[0].date);
      ds.innerHTML = "استعد، بإذن الله نبدأ معًا 🌱";
      $("todayTasks").innerHTML = "";
    } else if (QT.isRest(today)) {
      el.innerHTML = "يوم راحة 🌿"; ds.innerHTML = "لا توجد مهام اليوم (الأحد والأربعاء راحة)";
      $("todayTasks").innerHTML = "";
    } else if (!d) {
      el.innerHTML = "اكتملت الخطة 🎉"; ds.innerHTML = "ما شاء الله، أتممت الخطة";
    } else if (d.isFriday) {
      el.innerHTML = "يوم الجمعة 🕌"; ds.innerHTML = "سورة الكهف فقط";
      $("todayTasks").innerHTML = "";
    } else {
      el.innerHTML = "اليوم " + d.n + " من " + M.totalDays;
      ds.innerHTML = QT.prettyDate(d.date) + (d.status === "done" ? " — ✅ تم إرسال تقرير اليوم" : "");
      $("todayTasks").innerHTML = QT.esc(QT.todayTasksText(d));
    }
    var pct = Math.round((M.doneDays / Math.max(1, M.totalDays)) * 100);
    $("dayPercentage").innerHTML = pct + "%";
    $("ring").style.background = "conic-gradient(#1b8a5a " + pct + "%, #e6f4ec 0)";
    $("progressText").innerHTML = pct + "%";
    $("progressBar").style.width = pct + "%";
    $("progressLabel").innerHTML = M.doneDays + " يوم من " + M.totalDays;
    $("streakText").innerHTML = QT.streak(M, today);
    var done = showSurahs();
    $("completedText").innerHTML = done;
    var msg = $("progressMessage");
    if (M.doneDays === 0) msg.innerHTML = "ابدأ بتسجيل أول إنجاز لك اليوم 💪";
    else if (pct < 50) msg.innerHTML = "ممتاز! استمر ولا تتوقف 🌱";
    else if (pct < 100) msg.innerHTML = "أحسنت! أنت تقترب من إتمام الخطة 💪";
    else msg.innerHTML = "ما شاء الله! أتممت الخطة 🎉";
    $("reportLink").href = "report.html?d=" + today;
    $("tasksLink").href = "today.html?d=" + today;
  }

  /* ---------- نقطة الانطلاق (وين وصلت؟) ---------- */
  var baseEditing = false;
  function npStart() { return QT.isYmd(QT_CONFIG.NEW_PLAN_START) ? QT_CONFIG.NEW_PLAN_START : ""; }
  function countOldReports(st) { var k, n = 0; for (k in (st.reports || {})) if (st.reports.hasOwnProperty(k) && !st.reports[k].cancelled) n++; return n; }
  function baseInfo() {
    var c = parseInt($("baseC").value, 10), v = parseInt($("baseV").value, 10), a = "", b = "", i;
    if (!isNaN(c) && c >= 0 && c <= 180) a = c >= 180 ? "أنهيت كل الكنز 🎉" : "ستبدأ من الربع رقم " + (c + 1) + ": " + QT.unitInfo(c + 1).title;
    if (!isNaN(v) && v >= 0 && v <= 120) {
      if (v >= QT.NEW_LAST) b = "أنهيت الجديد المطلوب في الترم الأول 🎉";
      else {
        var day = 0; for (i = 0; i < QT.NU.length; i++) { if (QT.NU[i].e <= v) day++; else break; }
        b = "ستكمل من الآية " + (v + 1) + " — الأيام المتبقية في الخطة الجديدة: " + (QT.NU.length - day) + " يومًا";
      }
    }
    $("baseCInfo").innerHTML = QT.esc(a); $("baseVInfo").innerHTML = QT.esc(b);
  }
  function renderBase(st) {
    var np = npStart(), need = !!np && !st.base, show = need || (baseEditing && !!np);
    $("baseBox").style.display = show ? "block" : "none";
    $("baseEditRow").style.display = (!!np && !!st.base && !baseEditing) ? "block" : "none";
    if (show && !$("baseBox").getAttribute("data-init")) {
      $("baseBox").setAttribute("data-init", "1");
      var b = st.base || {}, today = QT.todayStr(), from = np > today ? np : today;
      $("baseC").value = b.c !== undefined ? b.c : ""; $("baseV").value = b.v !== undefined ? b.v : "";
      $("baseD").value = b.d !== undefined ? b.d : countOldReports(st); $("baseFrom").value = st.base && st.start ? st.start : from;
      $("baseFrom").min = np; baseInfo();
    }
  }
  $("baseC").oninput = baseInfo; $("baseV").oninput = baseInfo;
  $("baseEdit").onclick = function () { baseEditing = true; $("baseBox").removeAttribute("data-init"); renderBase(QT.getState()); $("baseBox").scrollIntoView(); };
  $("baseSave").onclick = function () {
    var c = parseInt($("baseC").value, 10), v = parseInt($("baseV").value, 10), d = parseInt($("baseD").value, 10), f = $("baseFrom").value, np = npStart();
    if (isNaN(c) || c < 0 || c > 180) { QT.toast("اكتب عدد الأرباع التي أنهيتها في الكنز (من 0 إلى 180)", "err2"); return; }
    if (isNaN(v) || v < 0 || v > 120) { QT.toast("اكتب آخر آية حفظتها في الجديد (0 لو لم تبدأ)", "err2"); return; }
    if (isNaN(d) || d < 0) d = 0;
    if (!QT.isYmd(f)) { QT.toast("اختر تاريخ أول يوم", "err2"); return; }
    if (np && f < np) { f = np; }
    QT.setBase(c, v, d, f); baseEditing = false; $("baseBox").removeAttribute("data-init");
    render(); QT.toast("تم الحفظ ✅ — الخطة الجديدة تبدأ من مكانك", "ok2");
  };

  $("startSave").onclick = function () {
    var v = $("startInput").value;
    if (!QT.isYmd(v)) { QT.toast("اختر تاريخًا صحيحًا", "err2"); return; }
    QT.setStart(v); render(); QT.toast("تم حفظ تاريخ البداية ✅", "ok2");
  };
  $("searchInput").oninput = function () { searchText = this.value.replace(/^\s+|\s+$/g, ""); showSurahs(); };

  function showAccount() {
    var ss = QT.session();
    if (!ss) return;
    var ph = ss.phone && ss.phone.indexOf("20") === 0 ? "0" + ss.phone.substring(2) : (ss.phone || "");
    $("whoBox").innerHTML = "الاسم: <b>" + QT.esc(ss.name) + "</b><br>رقم الهاتف: <b style=\"direction:ltr;unicode-bidi:embed\">" + QT.esc(ph) + "</b>";
    $("greet").innerHTML = "السلام عليكم يا " + QT.esc(ss.name);
  }

  /* ---------- أوسمة الإنجاز ---------- */
  function showBadges() {
    var list = QT.badges(M), h = "", got = 0;
    for (var i = 0; i < list.length; i++) {
      if (list[i].got) got++;
      h += '<div class="badge-item' + (list[i].got ? " got" : "") + '"><span>' + list[i].icon + '</span><b>' + list[i].title + '</b><small>' + list[i].desc + '</small></div>';
    }
    $("badgeList").innerHTML = h;
    $("badgeCount").innerHTML = got + " من " + list.length;
  }

  QT.init(function () {
    showAccount();
    render();
    showBadges();
  }, 0, function (ok, changed) {
    $("syncState").innerHTML = ok ? "☁️ بياناتك متزامنة على كل أجهزتك" : "بياناتك محفوظة على هذا الجهاز";
    if (changed) { showAccount(); render(); showBadges(); }
  });
})();
