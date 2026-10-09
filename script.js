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
    $("startBox").style.display = st.start ? "none" : "block";
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
      el.innerHTML = "يوم الجمعة 🕌"; ds.innerHTML = "سورة الكهف + تعويض النواقص (اختياري)";
      $("todayTasks").innerHTML = "";
    } else {
      el.innerHTML = "اليوم " + d.n + " من " + M.totalDays;
      ds.innerHTML = QT.prettyDate(d.date) + (d.status === "done" ? " — ✅ تم إرسال تقرير اليوم" : "");
      $("todayTasks").innerHTML = QT.esc(QT.todayTasksText(d));
    }
    var pct = Math.round((M.doneDays / Math.max(1, M.totalDays)) * 100);
    $("dayPercentage").innerHTML = pct + "%";
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
  }

  $("startSave").onclick = function () {
    var v = $("startInput").value;
    if (!QT.isYmd(v)) { QT.toast("اختر تاريخًا صحيحًا", "err2"); return; }
    QT.setStart(v); render(); QT.toast("تم حفظ تاريخ البداية ✅", "ok2");
  };
  $("searchInput").oninput = function () { searchText = this.value.replace(/^\s+|\s+$/g, ""); showSurahs(); };

  QT.init(function (s, fromServer) {
    $("syncState").innerHTML = fromServer ? "☁️ بياناتك متزامنة على كل أجهزتك" : "بياناتك محفوظة على هذا الجهاز";
    render();
  }, 5000);
})();
