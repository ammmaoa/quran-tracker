/* =====================================================================
   engine.js — محرّك خطة حفظ القرآن الكريم (مشترك بين كل الصفحات)
   لا تعدّل فيه إلا الإعدادات في الأعلى (QT_CONFIG).
   مكتوب بصيغة قديمة (ES5) ليعمل على الأجهزة القديمة أيضًا.
   ===================================================================== */

/* ---------------------------------------------------------------------
   الإعدادات
   --------------------------------------------------------------------- */
var QT_CONFIG = {
  // رابط Google Apps Script (الذي نشرته). لو غيّرته ضعه هنا.
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyladtIbtLJUU9M-f25RuOaW9dVaTs2FXQj2D1LnhNYXvkKaOWEpHbaxRQ7rVcf6foCPg/exec",
  // عدد أرباع التثبيت في اليوم (ربعان).
  FIX_PER_DAY: 2
};

var QT = (function () {

  /* -------------------------------------------------------------------
     البيانات: أسماء السور
     ------------------------------------------------------------------- */
  var SURAHS = ["الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"];

  /* -------------------------------------------------------------------
     الكنز: 180 وحدة (ربع) = يومان × 90 يومًا
     كل وحدة: مصفوفة أجزاء [السورة، رقم الربع داخل السورة، بداية الربع، من آية، إلى آية، ملاحظة]
     ------------------------------------------------------------------- */
var SLOTS=[
[["الأنعام",0,"بداية السورة",1,12,""],["الأنعام",1,"وله ما سكن",13,35,""]],
[["الأنعام",2,"إنما يستجيب",36,58,""]],
[["الأنعام",3,"وعنده مفاتح الغيب",59,73,""]],
[["الأنعام",4,"وإذ قال إبراهيم",74,94,""]],
[["الأنعام",5,"إن الله فالق الحب",95,110,""]],
[["الأنعام",6,"ولو أننا نزلنا",111,126,""]],
[["الأنعام",7,"لهم دار السلام",127,140,""]],
[["الأنعام",8,"وهو الذي أنشأ",141,150,""]],
[["الأنعام",9,"قل تعالوا أتل",151,165,""]],
[["الأعراف",1,"بداية السورة",1,30,""]],
[["الأعراف",2,"يا بني آدم خذوا",31,46,""]],
[["الأعراف",3,"وإذا صرفت",47,64,""]],
[["الأعراف",4,"وإلى عاد أخاهم",65,87,""]],
[["الأعراف",5,"قال الملأ",88,116,""]],
[["الأعراف",6,"وأوحينا إلى موسى",117,141,""]],
[["الأعراف",7,"وواعدنا",142,155,""]],
[["الأعراف",8,"واكتب لنا",156,170,""]],
[["الأعراف",9,"وإذ نتقنا",171,188,""]],
[["الأعراف",10,"هو الذي خلقكم",189,206,""]],
[["الأنفال",1,"بداية السورة",1,21,""]],
[["الأنفال",2,"إن شر الدواب",22,40,""]],
[["الأنفال",3,"واعلموا أنما",41,60,""]],
[["الأنفال",4,"وإن جنحوا",61,75,""]],
[["التوبة",1,"بداية السورة",1,18,""]],
[["التوبة",2,"أجعلتم سقاية",19,33,""]],
[["التوبة",3,"يا أيها الذين",34,45,""]],
[["التوبة",4,"ولو أرادوا الخروج",46,59,""]],
[["التوبة",5,"إنما الصدقات",60,74,""]],
[["التوبة",6,"ومنهم من عاهد",75,92,""]],
[["التوبة",7,"إنما السبيل",93,110,""]],
[["التوبة",8,"إن الله اشترى",111,121,""]],
[["التوبة",9,"وما كان",122,129,""]],
[["يونس",1,"بداية السورة",1,10,""]],
[["يونس",2,"ولو يعجل الله",11,25,""]],
[["يونس",3,"للذين أحسنوا",26,52,""]],
[["يونس",4,"ويستنبئونك",53,70,""]],
[["يونس",5,"فمن أظلم",71,89,""]],
[["يونس",6,"وجاوزنا ببني إسرائيل",90,109,"ختام السورة"]],
[["هود",1,"بداية السورة",1,23,""]],
[["هود",2,"ويا قوم لا أسألكم",24,40,""]],
[["هود",3,"قيل يا نوح اهبط",41,60,""]],
[["هود",4,"وإلى ثمود أخاهم",61,83,""]],
[["هود",5,"وإلى مدين أخاهم",84,107,""]],
[["هود",6,"وأقم الصلاة",108,123,""]],
[["يوسف",1,"بداية السورة",1,29,""]],
[["يوسف",2,"وقال نسوة",30,52,""]],
[["يوسف",3,"وما أبرئ نفسي",53,76,""]],
[["يوسف",4,"فلما استيأسوا",77,100,""]],
[["يوسف",5,"وكأين من آية",101,111,"ختام السورة"]],
[["الرعد",1,"بداية السورة",1,18,""]],
[["الرعد",2,"أفمن يعلم",19,34,""]],
[["الرعد",3,"ومثل الجنة",35,43,"ختام السورة"]],
[["إبراهيم",1,"بداية السورة",1,27,""]],
[["إبراهيم",2,"ألم تر إلى الذين بدلوا",28,52,"ختام السورة"]],
[["الحجر",1,"بداية السورة",1,48,""]],
[["الحجر",2,"ونبئهم عن ضيف",49,99,"ختام السورة"]],
[["النحل",1,"بداية السورة",1,29,""]],
[["النحل",2,"وقيل للذين اتقوا",30,50,""]],
[["النحل",3,"وقال الله لا تتخذوا",51,74,""]],
[["النحل",4,"وضرب الله مثلاً",75,89,""]],
[["النحل",5,"إن الله يأمر بالعدل",90,110,""]],
[["النحل",6,"ثم إن ربك للذين هاجروا",111,128,"ختام السورة"]],
[["الإسراء",1,"بداية السورة",1,22,""]],
[["الإسراء",2,"وقضى ربك",23,49,""]],
[["الإسراء",3,"وقل لعبادي",50,69,""]],
[["الإسراء",4,"وإذ قلنا لك",70,98,""]],
[["الإسراء",5,"أولم يروا أن الله",99,111,"ختام السورة"]],
[["الكهف",1,"بداية السورة",1,16,""]],
[["الكهف",2,"وترى الشمس",17,31,""]],
[["الكهف",3,"واضرب لهم مثلاً",32,50,""]],
[["الكهف",4,"وما منع الناس",51,74,""]],
[["الكهف",5,"قال ألم أقل لك",75,110,"ختام السورة"]],
[["مريم",1,"بداية السورة",1,58,""]],
[["مريم",2,"أفرأيت الذي كفر",59,98,"ختام السورة"]],
[["طه",1,"بداية السورة",1,54,""]],
[["طه",2,"قال فما بالك",55,82,""]],
[["طه",3,"وما أعجلك",83,110,""]],
[["طه",4,"ومن أعرض عن ذكري",111,135,"ختام السورة"]],
[["الأنبياء",1,"بداية السورة",1,50,""]],
[["الأنبياء",2,"ولقد آتينا إبراهيم",51,82,""]],
[["الأنبياء",3,"وأيوب إذ نادى",83,112,"ختام السورة"]],
[["الحج",1,"بداية السورة",1,18,""]],
[["الحج",2,"ألم تر أن الله يسجد له",19,37,""]],
[["الحج",3,"أذن للذين يقاتلون",38,59,""]],
[["الحج",4,"ذلك ومن عاقب",60,78,"ختام السورة"]],
[["المؤمنون",1,"بداية السورة",1,35,""]],
[["المؤمنون",2,"ثم أنشأنا",36,74,""]],
[["المؤمنون",3,"حتى إذا أخذنا",75,118,"ختام السورة"]],
[["النور",1,"بداية السورة",1,20,""]],
[["النور",2,"لولا إذ سمعتموه",21,34,""]],
[["النور",3,"الله نور السماوات والأرض",35,52,""]],
[["النور",4,"ولقد أنزلنا",53,64,"ختام السورة"]],
[["الفرقان",1,"بداية السورة",1,20,""]],
[["الفرقان",2,"وقال الذين لا يرجون",21,52,""]],
[["الفرقان",3,"وهو الذي مرج البحرين",53,77,"ختام السورة"]],
[["الشعراء",1,"بداية السورة",1,51,""]],
[["الشعراء",2,"قال للملأ حوله",52,110,""]],
[["الشعراء",3,"قالوا أنؤمن لك",111,180,""]],
[["الشعراء",4,"قالوا إنما أنت من السحرين",181,227,"ختام السورة"]],
[["النمل",1,"بداية السورة",1,26,""]],
[["النمل",2,"قال سننظر",27,55,""]],
[["النمل",3,"أمن خلق السماوات",56,75,""]],
[["النمل",4,"إن هذا القرآن يقص",76,93,"ختام السورة"]],
[["القصص",1,"بداية السورة",1,11,""]],
[["القصص",2,"وحرمنا عليه المراضع",12,28,""]],
[["القصص",3,"فلما قضى موسى الأجل",29,50,""]],
[["القصص",4,"ولقد وصلنا لهم القول",51,75,""]],
[["القصص",5,"إن قارون كان",76,88,"ختام السورة"]],
[["العنكبوت",1,"بداية السورة",1,25,""]],
[["العنكبوت",2,"فما كان جواب قومه",26,45,""]],
[["العنكبوت",3,"ولا تجادلوا أهل الكتاب",46,69,"ختام السورة"]],
[["الروم",1,"بداية السورة",1,30,""]],
[["الروم",2,"ومن آياته أن خلق لكم",31,60,"ختام السورة"]],
[["لقمان",1,"بداية السورة",1,21,""]],
[["لقمان",2,"وإذا قيل لهم اتبعوا",22,34,"ختام السورة"]],
[["السجدة",1,"بداية السورة",1,30,"ختام السورة"]],
[["الأحزاب",1,"بداية السورة",1,17,""]],
[["الأحزاب",2,"وإذ قالت طائفة",18,30,""]],
[["الأحزاب",3,"ومن يقنت منكن",31,50,""]],
[["الأحزاب",4,"لا يحل لك النساء",51,59,""]],
[["الأحزاب",5,"يا أيها الذين آمنوا اذكروا",60,73,"ختام السورة"]],
[["سبأ",1,"بداية السورة",1,23,""]],
[["سبأ",2,"قل إن ربي يبسط الرزق",24,54,"ختام السورة"]],
[["فاطر",1,"بداية السورة",1,14,""]],
[["فاطر",2,"يا أيها الناس أنتم الفقراء",15,45,"ختام السورة"]],
[["يس",1,"بداية السورة",1,27,""]],
[["يس",2,"وما أنزلنا على قومه",28,59,""]],
[["يس",3,"ألم أعهد إليكم",60,83,"ختام السورة"]],
[["الصافات",1,"بداية السورة",1,82,""]],
[["الصافات",2,"وإن من شيعته لإبراهيم",83,144,""]],
[["الصافات",3,"فنبذناه بالعراء",145,182,"ختام السورة"]],
[["ص",1,"بداية السورة",1,51,""]],
[["ص",2,"هذا وإن للطاغين",52,88,"ختام السورة"]],
[["الزمر",1,"بداية السورة",1,31,""]],
[["الزمر",2,"فمن أظلم ممن كذب",32,52,""]],
[["الزمر",3,"قل يا عبادي الذين أسرفوا",53,75,"ختام السورة"]],
[["غافر",1,"بداية السورة",1,20,""]],
[["غافر",2,"وقال رجل مؤمن",21,40,""]],
[["غافر",3,"ويا قوم ما لي أدعوكم",41,65,""]],
[["غافر",4,"فسبحان الله",66,85,"ختام السورة"]],
[["فصلت",1,"بداية السورة",1,24,""]],
[["فصلت",2,"وقال الذين كفروا",25,46,""]],
[["فصلت",3,"إليه يرد علم الساعة",47,54,"ختام السورة"]],
[["الشورى",1,"بداية السورة",1,26,""]],
[["الشورى",2,"ومن آياته الجوار",27,53,"ختام السورة"]],
[["الزخرف",1,"بداية السورة",1,23,""]],
[["الزخرف",2,"واستمسك بالذي أوحي",24,56,""]],
[["الزخرف",3,"ولما ضرب ابن مريم",57,89,"ختام السورة"]],
[["الدخان",0,"كاملة",1,59,""]],
[["الجاثية",0,"كاملة",1,37,""]],
[["الأحقاف",1,"بداية السورة",1,20,""]],
[["الأحقاف",2,"واذكر أخا عاد",21,35,"ختام السورة"]],
[["محمد",0,"كاملة",1,38,""]],
[["الفتح",1,"بداية السورة",1,17,""]],
[["الفتح",2,"هو الذي أنزل السكينة",18,29,"ختام السورة"]],
[["الحجرات",0,"كاملة",1,18,""]],
[["ق",0,"كاملة",1,45,""]],
[["الذاريات",1,"بداية السورة",1,30,""]],
[["الذاريات",2,"قال فما خطبكم",31,60,"ختام السورة"]],
[["الطور",0,"كاملة",1,49,""]],
[["النجم",0,"كاملة",1,62,""]],
[["القمر",0,"كاملة",1,55,""]],
[["الرحمن",0,"كاملة",1,78,""]],
[["الواقعة",0,"كاملة",1,96,""]],
[["الحديد",0,"كاملة",1,29,""]],
[["المجادلة",0,"كاملة",1,22,""]],
[["الحشر",0,"كاملة",1,24,""]],
[["الممتحنة",0,"كاملة",1,13,""]],
[["الصف",0,"كاملة",1,14,""],["الجمعة",0,"كاملة",1,11,""]],
[["المنافقون",0,"كاملة",1,11,""],["التغابن",0,"كاملة",1,18,""]],
[["الطلاق",0,"كاملة",1,12,""],["التحريم",0,"كاملة",1,12,""]],
[["الملك",0,"كاملة",1,30,""]],
[["القلم",0,"كاملة",1,52,""]],
[["الحاقة",0,"كاملة",1,52,""],["المعارج",0,"كاملة",1,44,""]],
[["نوح",0,"كاملة",1,28,""],["الجن",0,"كاملة",1,28,""]],
[["المزمل",0,"كاملة",1,20,""],["المدثر",0,"كاملة",1,56,""]],
[["القيامة",0,"كاملة",1,40,""],["الإنسان",0,"كاملة",1,31,""],["المرسلات",0,"كاملة",1,50,""]],
[["النبأ",0,"كاملة",1,40,""],["النازعات",0,"كاملة",1,46,""],["عبس",0,"كاملة",1,42,""],["التكوير",0,"كاملة",1,29,""],["الانفطار",0,"كاملة",1,19,""],["المطففين",0,"كاملة",1,36,""],["الانشقاق",0,"كاملة",1,25,""],["البروج",0,"كاملة",1,22,""],["الطارق",0,"كاملة",1,17,""],["الأعلى",0,"كاملة",1,19,""],["الغاشية",0,"كاملة",1,26,""],["الفجر",0,"كاملة",1,30,""],["البلد",0,"كاملة",1,20,""],["الشمس",0,"كاملة",1,15,""],["الليل",0,"كاملة",1,21,""],["الضحى",0,"كاملة",1,11,""],["الشرح",0,"كاملة",1,8,""],["التين",0,"كاملة",1,8,""],["العلق",0,"كاملة",1,19,""]],
[["القدر",0,"كاملة",1,5,""],["البينة",0,"كاملة",1,8,""],["الزلزلة",0,"كاملة",1,8,""],["العاديات",0,"كاملة",1,11,""],["القارعة",0,"كاملة",1,11,""],["التكاثر",0,"كاملة",1,8,""]],
[["العصر",0,"كاملة",1,3,""],["الهمزة",0,"كاملة",1,9,""],["الفيل",0,"كاملة",1,5,""],["قريش",0,"كاملة",1,4,""],["الماعون",0,"كاملة",1,7,""],["الكوثر",0,"كاملة",1,3,""],["الكافرون",0,"كاملة",1,6,""],["النصر",0,"كاملة",1,3,""],["المسد",0,"كاملة",1,5,""],["الإخلاص",0,"كاملة",1,4,""],["الفلق",0,"كاملة",1,5,""],["الناس",0,"كاملة",1,6,""]]
];

  var UNITS = 180;       // عدد الأرباع
  var UNIT12 = 12;       // كل ربع = 12 جزءًا (لتمثيل ¼ ⅓ ½ ⅔ ¾ بدون كسور عشرية)
  var TOTAL12 = UNITS * UNIT12;   // 2160
  var DAY12 = 24;        // المطلوب اليومي = ربعان

  /* -------------------------------------------------------------------
     الجديد: سورة المائدة — 9 أرباع، كل ربع على يومين
     ------------------------------------------------------------------- */
  var MAIDA = [
    { q: 1, s: 1,   e: 11,  ph: "بداية السورة" },
    { q: 2, s: 12,  e: 26,  ph: "ولقد أخذ الله ميثاق بني إسرائيل" },
    { q: 3, s: 27,  e: 40,  ph: "واتل عليهم نبأ ابني آدم" },
    { q: 4, s: 41,  e: 50,  ph: "يا أيها الرسول لا يحزنك" },
    { q: 5, s: 51,  e: 66,  ph: "يا أيها الذين آمنوا لا تتخذوا اليهود والنصارى أولياء" },
    { q: 6, s: 67,  e: 81,  ph: "يا أيها الرسول بلغ" },
    { q: 7, s: 82,  e: 96,  ph: "لتجدن أشد الناس عداوة" },
    { q: 8, s: 97,  e: 108, ph: "جعل الله الكعبة" },
    { q: 9, s: 109, e: 120, ph: "يوم يجمع الله الرسل" }
  ];
  (function () {
    for (var i = 0; i < MAIDA.length; i++) {
      var n = MAIDA[i].e - MAIDA[i].s + 1;
      MAIDA[i].mid = MAIDA[i].s + Math.ceil(n / 2) - 1;   // نهاية اليوم الأول من الربع
    }
  })();

  var REST = { 0: 1, 3: 1 };      // الأحد والأربعاء: راحة بلا أي مهام
  function isRest(s) { return !!REST[parseYmd(s).getDay()]; }

  var DAYNAMES = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  var MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

  /* -------------------------------------------------------------------
     أدوات عامة
     ------------------------------------------------------------------- */
  function esc(s) {
    return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m];
    });
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function ymd(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function parseYmd(s) {
    var p = String(s).split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12, 0, 0);
  }
  function addDays(s, k) { var d = parseYmd(s); d.setDate(d.getDate() + k); return ymd(d); }
  function dowOf(s) { return parseYmd(s).getDay(); }          // 0 أحد ... 5 جمعة ... 6 سبت
  function todayStr() { return ymd(new Date()); }
  function isYmd(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || "")); }
  function prettyDate(s) {
    var d = parseYmd(s);
    return DAYNAMES[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  }
  function shortDate(s) {
    var d = parseYmd(s);
    return d.getDate() + " " + MONTHS[d.getMonth()];
  }
  function weekStart(s) {              // بداية الأسبوع = السبت
    var dw = dowOf(s);
    var back = (dw + 1) % 7;           // السبت 0، الأحد 1 ... الجمعة 6
    return addDays(s, -back);
  }
  function getParam(name) {
    var q = String(window.location.search || "").replace(/^\?/, "").split("&");
    for (var i = 0; i < q.length; i++) {
      var kv = q[i].split("=");
      if (decodeURIComponent(kv[0]) === name) return decodeURIComponent((kv[1] || "").replace(/\+/g, " "));
    }
    return "";
  }

  /* -------------------------------------------------------------------
     الكسور: كل كمية في الكنز تُخزَّن بالأجزاء (ربع = 12 جزءًا)
     ¼ = 3 ، ⅓ = 4 ، ½ = 6 ، ⅔ = 8 ، ¾ = 9 ، 1 = 12
     ------------------------------------------------------------------- */
  var FR = { 3: "¼", 4: "⅓", 6: "½", 8: "⅔", 9: "¾" };
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function fmtU(t) {
    t = Math.round(t);
    if (t <= 0) return "0";
    var w = Math.floor(t / 12), r = t % 12, f = "";
    if (r) {
      if (FR[r]) f = FR[r];
      else { var g = gcd(r, 12); f = (r / g) + "/" + (12 / g); }
    }
    if (w && f) return w + (FR[r] ? "" : " ") + f;
    if (w) return String(w);
    return f;
  }
  function normDigits(s) {
    return String(s).replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 1632); })
                    .replace(/٫/g, ".").replace(/[،,]/g, ".").replace(/⁄/g, "/");
  }
  function parseU(str) {
    var s = normDigits(str || "");
    s = s.replace(/¼/g, " 1/4 ").replace(/⅓/g, " 1/3 ").replace(/½/g, " 1/2 ")
         .replace(/⅔/g, " 2/3 ").replace(/¾/g, " 3/4 ");
    s = s.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
    if (!s) return null;
    var toks = s.split(" "), total = 0;
    for (var i = 0; i < toks.length; i++) {
      var t = toks[i], v;
      if (/^\d+\/\d+$/.test(t)) {
        var ab = t.split("/");
        if (Number(ab[1]) === 0) return null;
        v = 12 * Number(ab[0]) / Number(ab[1]);
      } else if (/^\d+(\.\d+)?$/.test(t)) {
        v = 12 * parseFloat(t);
      } else {
        return null;
      }
      if (Math.abs(v - Math.round(v)) > 0.0001) return null;
      total += Math.round(v);
    }
    return total;
  }

  /* -------------------------------------------------------------------
     وصف أجزاء الكنز
     ------------------------------------------------------------------- */
  function partText(p) {
    if (p[1] === 0 && p[2] === "كاملة") return p[0] + " كاملة (" + p[3] + "–" + p[4] + ")";
    return p[0] + " — " + p[2] + " (" + p[3] + "–" + p[4] + ")";
  }
  function unitInfo(u) {              // u من 1 إلى 180
    var parts = SLOTS[u - 1] || [];
    var names = [], i;
    for (i = 0; i < parts.length; i++) if (names.indexOf(parts[i][0]) < 0) names.push(parts[i][0]);
    var title, sub, ayat;
    if (parts.length === 0) { title = ""; sub = ""; ayat = ""; }
    else if (parts.length <= 2) {
      var tt = [], ss = [], aa = [];
      for (i = 0; i < parts.length; i++) {
        tt.push(parts[i][0]);
        ss.push(parts[i][2] === "كاملة" ? "كاملة" : parts[i][2]);
        aa.push(parts[i][3] + "–" + parts[i][4]);
      }
      if (parts.length === 1) { title = tt[0]; sub = ss[0]; ayat = aa[0]; }
      else if (parts[0][0] === parts[1][0]) {   // نفس السورة (بداية السورة + الربع الأول)
        title = tt[0]; sub = ss.join(" ثم "); ayat = parts[0][3] + "–" + parts[1][4];
      } else { title = tt.join(" + "); sub = ss.join(" + "); ayat = aa.join(" + "); }
    } else {
      title = "من " + parts[0][0] + " إلى " + parts[parts.length - 1][0];
      sub = parts.length + " سورة";
      ayat = "";
    }
    return { u: u, title: title, sub: sub, ayat: ayat, names: names, parts: parts };
  }
  // مقطع من الكنز: الربع u والجزء من a إلى b (بالأجزاء 0..12)
  function segsOf(from12, to12) {
    var segs = [];
    var u = Math.floor(from12 / 12);
    while (u * 12 < to12 && u < UNITS) {
      var a = Math.max(from12, u * 12) - u * 12;
      var b = Math.min(to12, (u + 1) * 12) - u * 12;
      segs.push({ u: u + 1, a: a, b: b, whole: (a === 0 && b === 12), info: unitInfo(u + 1) });
      u++;
    }
    return segs;
  }
  function segLabel(sg) {
    var s = "ربع " + sg.u;
    if (!sg.whole) {
      if (sg.a === 0) s += " (أول " + fmtU(sg.b - sg.a) + ")";
      else if (sg.b === 12) s += " (آخر " + fmtU(sg.b - sg.a) + ")";
      else s += " (جزء " + fmtU(sg.b - sg.a) + ")";
    }
    return s;
  }
  function segFull(sg) {
    var i = sg.info;
    var s = segLabel(sg) + " — " + i.title;
    if (i.sub && i.sub !== "كاملة") s += ": " + i.sub;
    if (i.ayat) s += " (" + i.ayat + ")";
    return s;
  }

  /* -------------------------------------------------------------------
     الحالة (state) وتخزينها
     state = {
       v:2, start:"YYYY-MM-DD", settingsAt:0,
       reports: { "YYYY-MM-DD": { at, t:{st,amt}, nw:{st,to}, fx:{st}, day:"full|none|" } },
       comps:   [ { id, kind:"t|n|day", ref, amt, date, at } ],
       kahf:    { "YYYY-MM-DD": { ok:true/false, at } }
     }
     ------------------------------------------------------------------- */
  var LS_KEY = "qt_state_v2";
  var state = null;

  function emptyState() { return { v: 2, start: "", settingsAt: 0, reports: {}, comps: [], kahf: {} }; }
  function loadLocal() {
    try {
      var raw = window.localStorage.getItem(LS_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && typeof s === "object") {
          s.reports = s.reports || {}; s.comps = s.comps || []; s.kahf = s.kahf || {};
          s.start = s.start || ""; s.settingsAt = s.settingsAt || 0; s.v = 2;
          return s;
        }
      }
    } catch (e) {}
    return emptyState();
  }
  function saveLocal() {
    try { window.localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function setDirty(v) { try { window.localStorage.setItem("qt_dirty", v ? "1" : "0"); } catch (e) {} }
  function isDirty() { try { return window.localStorage.getItem("qt_dirty") === "1"; } catch (e) { return false; } }

  function merge(a, b) {            // دمج حالتين: الأحدث يفوز لكل عنصر
    var out = emptyState(), k;
    if ((b.settingsAt || 0) > (a.settingsAt || 0)) { out.start = b.start || ""; out.settingsAt = b.settingsAt || 0; }
    else { out.start = a.start || ""; out.settingsAt = a.settingsAt || 0; }
    var sets = [["reports", "at"], ["kahf", "at"]];
    for (var i = 0; i < sets.length; i++) {
      var nm = sets[i][0];
      var A = a[nm] || {}, B = b[nm] || {};
      for (k in A) if (A.hasOwnProperty(k)) out[nm][k] = A[k];
      for (k in B) if (B.hasOwnProperty(k)) {
        if (!out[nm][k] || (B[k].at || 0) > (out[nm][k].at || 0)) out[nm][k] = B[k];
      }
    }
    var seen = {}, list = (a.comps || []).concat(b.comps || []);
    for (i = 0; i < list.length; i++) {
      if (!seen[list[i].id]) { seen[list[i].id] = 1; out.comps.push(list[i]); }
    }
    return out;
  }
  function sameState(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

  /* ---- اتصال بسيط مع Google Apps Script ---- */
  function http(method, url, body, cb, timeoutMs) {
    var done = false, x;
    function fin(ok, data) { if (done) return; done = true; if (cb) cb(ok, data); }
    try {
      x = new XMLHttpRequest();
      x.open(method, url, true);
      if (method === "POST") x.setRequestHeader("Content-Type", "text/plain;charset=utf-8");
      x.timeout = timeoutMs || 9000;
      x.onreadystatechange = function () {
        if (x.readyState !== 4) return;
        if (x.status >= 200 && x.status < 300) {
          var d = null;
          try { d = JSON.parse(x.responseText); } catch (e) {}
          fin(true, d);
        } else fin(false, null);
      };
      x.ontimeout = function () { fin(false, null); };
      x.onerror = function () { fin(false, null); };
      x.send(method === "POST" ? body : null);
    } catch (e) { fin(false, null); }
  }
  function hasServer() { return QT_CONFIG.SCRIPT_URL && QT_CONFIG.SCRIPT_URL.indexOf("script.google.com") > -1; }

  function pull(cb) {
    if (!hasServer()) { if (cb) cb(false, false); return; }
    http("GET", QT_CONFIG.SCRIPT_URL + "?action=state&t=" + new Date().getTime(), null, function (ok, data) {
      if (!ok || !data || !data.state) { if (cb) cb(false, false); return; }
      var remote = data.state;
      remote.reports = remote.reports || {}; remote.comps = remote.comps || []; remote.kahf = remote.kahf || {};
      var merged = merge(state, remote);
      var changed = !sameState(merged, state);
      state = merged;
      saveLocal();
      var needPush = !sameState(merged, remote);
      if (needPush) setDirty(true);
      if (cb) cb(true, changed);
    }, 9000);
  }
  function push(extra, cb) {
    if (!hasServer()) { if (cb) cb(false, null); return; }
    var payload = { action: "save", state: state };
    if (extra) for (var k in extra) if (extra.hasOwnProperty(k)) payload[k] = extra[k];
    http("POST", QT_CONFIG.SCRIPT_URL, JSON.stringify(payload), function (ok, data) {
      if (ok && data && data.ok !== false) setDirty(false);
      if (cb) cb(ok, data);
    }, 15000);
  }
  // يحمّل الحالة: يعرض المحلي فورًا ثم يحدّث من الخادم (مرة واحدة)
  function init(cb, waitMs) {
    state = loadLocal();
    var called = false;
    function once(fromServer) { if (called) return; called = true; if (cb) cb(state, fromServer); }
    if (!hasServer()) { once(false); return; }
    var timer = setTimeout(function () { once(false); }, waitMs || 5000);
    pull(function (ok) {
      clearTimeout(timer);
      if (isDirty()) push(null, null);
      once(ok);
    });
  }
  function getState() { return state; }
  function commit(extra, cb) { saveLocal(); setDirty(true); push(extra, cb); }

  function setStart(d) {
    state.start = d; state.settingsAt = new Date().getTime();
    commit(null, null);
  }
  function putReport(date, rep, extra, cb) {
    rep.at = new Date().getTime();
    state.reports[date] = rep;
    commit(extra, cb);
  }
  function putKahf(date, ok) {
    state.kahf[date] = { ok: !!ok, at: new Date().getTime() };
    commit(null, null);
  }
  function addComp(kind, ref, amt) {
    var id = "c" + new Date().getTime() + "x" + Math.floor(Math.random() * 1000);
    state.comps.push({ id: id, kind: kind, ref: ref, amt: amt || 0, date: todayStr(), at: new Date().getTime() });
    commit(null, null);
  }

  /* -------------------------------------------------------------------
     الحساب: يعيد بناء الخطة كلها من التقارير المسجلة (لا شيء يُخزَّن جاهزًا)
     ------------------------------------------------------------------- */
  function compute(st, today) {
    if (!st || !isYmd(st.start)) return null;
    today = today || todayStr();
    var M = { start: st.start, today: today, days: [], byDate: {}, tDef: [], nDef: [], fridays: [], finished: false };
    var comps = st.comps || [];

    function compsFor(kind, ref) {
      var r = [];
      for (var i = 0; i < comps.length; i++) if (comps[i].kind === kind && comps[i].ref === ref) r.push(comps[i]);
      r.sort(function (a, b) { return (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.at || 0) - (b.at || 0)); });
      return r;
    }
    function dayComp(date) { var c = compsFor("day", date); return c.length ? c[0] : null; }

    function makeDef(kind, id, n, date, from, to, extra) {
      var closed = (kind === "n");
      var len = closed ? (to - from + 1) : (to - from);
      var cl = compsFor(kind, id), dc = dayComp(date), acc = 0, cleared = null, i;
      if (dc) { acc = len; cleared = dc.date; }
      else {
        for (i = 0; i < cl.length; i++) {
          acc += cl[i].amt;
          if (acc >= len && !cleared) cleared = cl[i].date;
        }
      }
      var done = Math.min(acc, len);
      var d = { id: id, kind: kind, n: n, date: date, from: from, to: to, len: len, done: done, rem: len - done,
                curFrom: from + done, clearedDate: cleared, comps: cl };
      if (extra) for (var k in extra) if (extra.hasOwnProperty(k)) d[k] = extra[k];
      return d;
    }

    var C = 0;                 // مؤشر الكنز (بالأجزاء)
    var V = 0, nq = 0, ph = "A", newDone = false;     // مؤشر الجديد
    var qFinish = {};          // رقم الربع -> { n, def }
    var lastRev = {};          // رقم الربع -> رقم آخر يوم تثبيت
    var date = st.start, n = 0, guard = 0;

    function normNew() {
      if (newDone) return;
      while (nq < 9 && V >= MAIDA[nq].e) { nq++; ph = "A"; }
      if (nq >= 9) newDone = true;
    }

    while (guard++ < 900) {
      normNew();
      if (C >= TOTAL12 && newDone) { M.finished = true; break; }
      var dw = dowOf(date);
      if (REST[dw]) { date = addDays(date, 1); continue; }     // الأحد والأربعاء: لا مهام
      if (dw === 5) {                                   // الجمعة
        var fr = { date: date, isFriday: true, kahf: st.kahf[date] || null,
                   status: (st.kahf[date] ? (st.kahf[date].ok ? "done" : "missed") : (date < today ? "none" : (date === today ? "today" : "future"))) };
        M.fridays.push(fr); M.days.push(fr); M.byDate[date] = fr;
        date = addDays(date, 1); continue;
      }
      n++;
      var rep = st.reports[date] || null;
      var mode = rep ? "rep" : (date < today ? "miss" : "proj");
      var day = { n: n, date: date, isFriday: false, report: rep, mode: mode, t: null, nw: null, fx: null };

      /* ---- الكنز ---- */
      if (C < TOTAL12) {
        var req = Math.min(DAY12 - (C % DAY12), TOTAL12 - C);
        var T = { from: C, req: req, to: C + req, extra: 0, def: null, st: "full" };
        var tst = mode === "rep" ? ((rep.t && rep.t.st) || "full") : (mode === "miss" ? "none" : "full");
        var tam = (mode === "rep" && rep.t) ? (rep.t.amt || 0) : 0;
        if (tst === "partial" && (tam <= 0)) tst = "none";
        if (tst === "partial" && tam >= req) tst = "full";
        if (tst === "extra" && tam <= 0) tst = "full";
        if (tst === "none") T.def = makeDef("t", "t" + date, n, date, C, C + req);
        else if (tst === "partial") T.def = makeDef("t", "t" + date, n, date, C + tam, C + req);
        else if (tst === "extra") T.extra = Math.min(tam, TOTAL12 - (C + req));
        T.st = tst; T.am = tam;
        T.segs = segsOf(C, C + req);
        if (T.def) M.tDef.push(T.def);
        C = C + req + T.extra;
        day.t = T;
      }

      /* ---- الجديد ---- */
      normNew();
      if (!newDone) {
        var Q = MAIDA[nq];
        if (ph === "A" && V >= Q.mid) ph = "B";
        var rf = V + 1, rt = (ph === "A") ? Q.mid : Q.e;
        var Nw = { q: Q.q, ph: ph, from: rf, to: rt, cnt: rt - rf + 1, st: "full", def: null, qi: Q, newV: V, to2: null };
        var nst = mode === "rep" ? ((rep.nw && rep.nw.st) || "full") : (mode === "miss" ? "none" : "full");
        var nto = (mode === "rep" && rep.nw && rep.nw.to !== undefined && rep.nw.to !== null && rep.nw.to !== "") ? Number(rep.nw.to) : null;
        var newV = V;
        if (nst === "full") newV = rt;
        else if (nst === "none") newV = V;
        else {
          if (nto === null || isNaN(nto)) newV = (nst === "extra") ? rt : V;
          else newV = nto;
          if (newV < V) newV = V;
          if (nst === "partial") { if (newV >= rt) nst = "full"; else if (newV <= V) nst = "none"; }
          if (nst === "extra") { if (newV <= rt) { nst = "full"; newV = rt; } }
          if (nst === "full") newV = Math.max(newV, rt);
          if (newV > 120) newV = 120;
        }
        Nw.st = nst; Nw.to2 = newV;
        var def2 = null;
        if (ph === "A") {
          V = newV; ph = "B";
        } else {
          if (newV < Q.e) {
            def2 = makeDef("n", "n" + date, n, date, newV + 1, Q.e, { q: Q.q });
            M.nDef.push(def2);
            V = Q.e;
          } else V = newV;
          ph = "A";
        }
        Nw.def = def2;
        // تسجيل الأرباع التي انتهى حفظها
        for (var qi = 0; qi < 9; qi++) {
          if (V >= MAIDA[qi].e && !qFinish[MAIDA[qi].q]) {
            qFinish[MAIDA[qi].q] = { n: n, def: (def2 && def2.q === MAIDA[qi].q) ? def2 : null };
          }
        }
        day.nw = Nw;
      }

      /* ---- التثبيت ---- */
      var cand = [], qk;
      for (qk = 1; qk <= 9; qk++) {
        var fq = qFinish[qk];
        if (!fq || fq.n >= n) continue;
        if (fq.def && !(fq.def.clearedDate && fq.def.clearedDate < date)) continue;
        cand.push(qk);
      }
      if (cand.length) {
        cand.sort(function (a, b) {
          var la = (lastRev[a] !== undefined) ? lastRev[a] : (-1000 + qFinish[a].n);
          var lb = (lastRev[b] !== undefined) ? lastRev[b] : (-1000 + qFinish[b].n);
          return la !== lb ? la - lb : a - b;
        });
        var pick = cand.slice(0, Math.min(QT_CONFIG.FIX_PER_DAY, cand.length)).sort(function (a, b) { return a - b; });
        var fst = mode === "rep" ? ((rep.fx && rep.fx.st) || "done") : (mode === "miss" ? "none" : "done");
        if (fst !== "done" && fst !== "none") fst = "done";
        day.fx = { qs: pick, st: fst };
        if (fst === "done") for (var pi = 0; pi < pick.length; pi++) lastRev[pick[pi]] = n;
      }

      /* ---- حالة اليوم ---- */
      var secs = [];
      if (day.t) secs.push(day.t.st);
      if (day.nw) secs.push(day.nw.st);
      if (day.fx) secs.push(day.fx.st === "done" ? "full" : "none");
      var allNone = secs.length > 0, k2;
      for (k2 = 0; k2 < secs.length; k2++) if (secs[k2] !== "none") allNone = false;
      if (mode === "rep") day.status = allNone ? "missed" : "done";
      else if (mode === "miss") day.status = "missed";
      else day.status = (date === today) ? "today" : "future";
      day.comp = dayComp(date);
      if (day.status === "missed" && day.comp) day.status = "compensated";

      M.days.push(day); M.byDate[date] = day;
      date = addDays(date, 1);
    }

    /* ---- ملخصات ---- */
    var workDays = 0, i, d;
    for (i = 0; i < M.days.length; i++) if (!M.days[i].isFriday) workDays++;
    M.totalDays = workDays;                       // مدة الخطة بأيام الحفظ
    M.treasureDays = 0; M.newDays = 0;
    for (i = 0; i < M.days.length; i++) {
      d = M.days[i];
      if (d.isFriday) continue;
      if (d.t) M.treasureDays++;
      if (d.nw) M.newDays++;
    }
    M.endDate = M.days.length ? M.days[M.days.length - 1].date : st.start;
    M.qFinish = qFinish;
    M.V = V; M.C = C;
    M.doneDays = 0; M.missedDays = []; 
    for (i = 0; i < M.days.length; i++) {
      d = M.days[i];
      if (d.isFriday) continue;
      if (d.status === "done" || d.status === "compensated") M.doneDays++;
      if (d.status === "missed") M.missedDays.push(d);
    }
    M.tDefOpen = []; M.nDefOpen = [];
    for (i = 0; i < M.tDef.length; i++) if (M.tDef[i].rem > 0) M.tDefOpen.push(M.tDef[i]);
    for (i = 0; i < M.nDef.length; i++) if (M.nDef[i].rem > 0) M.nDefOpen.push(M.nDef[i]);
    M.tDefTotal = 0; for (i = 0; i < M.tDefOpen.length; i++) M.tDefTotal += M.tDefOpen[i].rem;
    M.nDefTotal = 0; for (i = 0; i < M.nDefOpen.length; i++) M.nDefTotal += M.nDefOpen[i].rem;
    return M;
  }

  /* اليوم الفعلي لتاريخ ما (هل هو يوم حفظ أم جمعة أم قبل البداية) */
  function dayFor(M, date) { return M && M.byDate ? (M.byDate[date] || null) : null; }

  /* ترتيب الأيام المتتالية */
  function streak(M, today) {
    if (!M) return 0;
    var i, list = [];
    for (i = 0; i < M.days.length; i++) if (!M.days[i].isFriday && M.days[i].date <= today) list.push(M.days[i]);
    var s = 0;
    for (i = list.length - 1; i >= 0; i--) {
      var d = list[i];
      if (d.date === today && d.status === "today") continue;     // اليوم لم يُرسل بعد
      if (d.status === "done" || d.status === "compensated") s++; else break;
    }
    return s;
  }

  /* حالة سورة: متى يبدأ حفظها ومتى ينتهي (من الخطة الفعلية) */
  function surahTimeline(M) {
    var info = {};                // اسم السورة -> {first:day, last:day, finishedAll:bool}
    if (!M) return info;
    var i, j, p, d, nm;
    for (i = 0; i < M.days.length; i++) {
      d = M.days[i];
      if (d.isFriday) continue;
      if (d.t) {
        for (j = 0; j < d.t.segs.length; j++) {
          var parts = d.t.segs[j].info.parts;
          for (p = 0; p < parts.length; p++) {
            nm = parts[p][0];
            if (!info[nm]) info[nm] = { first: d, last: d, kind: "كنز" };
            info[nm].last = d;
          }
        }
      }
      if (d.nw) {
        nm = "المائدة";
        if (!info[nm]) info[nm] = { first: d, last: d, kind: "جديد" };
        info[nm].last = d;
      }
    }
    return info;
  }

  /* -------------------------------------------------------------------
     نصوص التقرير
     ------------------------------------------------------------------- */
  var ST_AR = { full: "تم بالكامل", extra: "تم وزيادة", partial: "جزئي", none: "لم يتم", done: "تم" };
  var ST_ICON = { full: "✅", extra: "➕", partial: "🟡", none: "❌", done: "✅" };

  function tSummary(d) {
    if (!d.t) return "";
    var s = ST_ICON[d.t.st] + " " + ST_AR[d.t.st];
    if (d.t.st === "extra") s += " (زيادة " + fmtU(d.t.extra) + " ربع)";
    if (d.t.st === "partial") s += " (حفظت " + fmtU(d.t.am) + " من " + fmtU(d.t.req) + ")";
    if (d.t.st === "none") s += " (" + fmtU(d.t.req) + " ربع في الكنز الناقص)";
    return s;
  }
  function nSummary(d) {
    if (!d.nw) return "";
    var n = d.nw;
    var s = ST_ICON[n.st] + " " + ST_AR[n.st];
    if (n.st === "extra") s += " (إلى آية " + n.to2 + " — زيادة " + (n.to2 - n.to) + ")";
    if (n.st === "partial") s += " (حفظت إلى آية " + n.to2 + " من " + n.from + "–" + n.to + ")";
    if (n.def) s += " — الناقص: " + n.def.from + "–" + n.def.to;
    return s;
  }
  function fSummary(d) {
    if (!d.fx) return "";
    return ST_ICON[d.fx.st] + " " + ST_AR[d.fx.st];
  }
  function todayTasksText(d) {
    var lines = [];
    if (d.nw) lines.push("📖 الجديد (المائدة): من آية " + d.nw.from + " إلى آية " + d.nw.to);
    if (d.t) {
      var ss = [];
      for (var i = 0; i < d.t.segs.length; i++) ss.push(segLabel(d.t.segs[i]) + " — " + d.t.segs[i].info.title);
      lines.push("💎 الكنز: " + ss.join(" + "));
    }
    if (d.fx) lines.push("🔄 التثبيت: ربع " + d.fx.qs.join(" + ربع ") + " من المائدة");
    return lines.join("\n");
  }
  function reportText(M, d) {
    var lines = ["📋 تقرير حفظ اليوم " + d.n + " — " + prettyDate(d.date)];
    if (d.t) lines.push("💎 الكنز: " + tSummary(d));
    if (d.nw) lines.push("📖 الجديد: " + nSummary(d));
    if (d.fx) lines.push("🔄 التثبيت: " + fSummary(d));
    if (M) {
      lines.push("—");
      lines.push("مدة الخطة الحالية: " + M.totalDays + " يوم · تنتهي " + shortDate(M.endDate));
      if (M.tDefTotal > 0) lines.push("الكنز الناقص: " + fmtU(M.tDefTotal) + " ربع");
      if (M.nDefTotal > 0) lines.push("الجديد الناقص: " + M.nDefTotal + " آية");
    }
    return lines.join("\n");
  }

  /* -------------------------------------------------------------------
     التحقق من صحة التقرير قبل الإرسال
     form = { t:{st,amtText}, nw:{st,toText}, fx:{st} }
     يعيد { ok, errors:[...], report }
     ------------------------------------------------------------------- */
  function buildReport(day, form) {
    var errors = [], rep = { v: 2 }, v;
    if (day.t) {
      var ts = form.t && form.t.st;
      if (!ts) errors.push("اختر حالة الكنز.");
      else {
        rep.t = { st: ts, amt: 0 };
        if (ts === "extra" || ts === "partial") {
          v = parseU(form.t.amtText);
          if (v === null || v <= 0) errors.push(ts === "extra" ? "اكتب مقدار الزيادة في الكنز (مثل ½ أو 1 أو 2)." : "اكتب مقدار ما حفظته في الكنز (مثل 1 أو 1½).");
          else if (ts === "partial" && v >= day.t.req) errors.push("في الجزئي لازم يكون المقدار أقل من المطلوب (" + fmtU(day.t.req) + ").");
          else if (ts === "extra" && v > 48) errors.push("أقصى زيادة في الكنز 4 أرباع.");
          else rep.t.amt = v;
        }
      }
    }
    if (day.nw) {
      var ns = form.nw && form.nw.st;
      if (!ns) errors.push("اختر حالة الجديد.");
      else {
        rep.nw = { st: ns, to: null };
        if (ns === "extra" || ns === "partial") {
          var tv = parseInt(normDigits(form.nw.toText || ""), 10);
          if (isNaN(tv)) errors.push(ns === "extra" ? "اكتب آخر آية وصلت لها في الجديد (بعد آية " + day.nw.to + ")." : "اكتب آخر آية حفظتها في الجديد (من آية " + day.nw.from + ").");
          else if (ns === "partial" && (tv < day.nw.from || tv >= day.nw.to)) errors.push("في الجزئي لازم تكون الآية بين " + day.nw.from + " و " + (day.nw.to - 1) + ".");
          else if (ns === "extra" && (tv <= day.nw.to || tv > 120)) errors.push("في الزيادة لازم تكون الآية أكبر من " + day.nw.to + " وحتى 120.");
          else rep.nw.to = tv;
        }
      }
    }
    if (day.fx) {
      var fs = form.fx && form.fx.st;
      if (!fs) errors.push("اختر حالة التثبيت (تم / لم يتم).");
      else rep.fx = { st: fs };
    }
    rep.day = form.day || "";
    return { ok: errors.length === 0, errors: errors, report: rep };
  }

  /* -------------------------------------------------------------------
     إحصاءات أسبوعية/شهرية للصفحة التشجيعية
     ------------------------------------------------------------------- */
  function weekStats(M, anyDate) {
    var ws = weekStart(anyDate), we = addDays(ws, 5);   // السبت..الخميس
    var o = { from: ws, to: we, missed: 0, tExtra: 0, tLess: 0, nExtra: 0, nLess: 0, days: 0, done: 0 };
    if (!M) return o;
    for (var i = 0; i < M.days.length; i++) {
      var d = M.days[i];
      if (d.isFriday || d.date < ws || d.date > we) continue;
      if (d.status === "today" || d.status === "future") continue;
      o.days++;
      if (d.status === "missed") o.missed++; else o.done++;
      if (d.mode !== "rep" && d.mode !== "miss") continue;
      if (d.t) { if (d.t.st === "extra") o.tExtra++; if (d.t.st === "partial" || d.t.st === "none") o.tLess++; }
      if (d.nw) { if (d.nw.st === "extra") o.nExtra++; if (d.nw.st === "partial" || d.nw.st === "none") o.nLess++; }
    }
    return o;
  }
  function monthStats(M, anyDate) {
    var ym = String(anyDate).slice(0, 7);
    var o = { ym: ym, missed: 0, days: 0 };
    if (!M) return o;
    for (var i = 0; i < M.days.length; i++) {
      var d = M.days[i];
      if (d.isFriday || String(d.date).slice(0, 7) !== ym) continue;
      if (d.status === "today" || d.status === "future") continue;
      o.days++;
      if (d.status === "missed") o.missed++;
    }
    return o;
  }

  /* -------------------------------------------------------------------
     كلمات التشجيع
     ------------------------------------------------------------------- */
  function pick(a, seed) { return a[Math.abs(seed) % a.length]; }
  function encourage(d) {
    var seed = d ? d.n : 0, good = [], bad = [];
    var msgs = {
      great: ["ما شاء الله! يوم ممتاز وزيادة، بارك الله فيك 🌟", "إنجاز رائع! كل خطوة تقرّبك من ختم الحفظ بإذن الله 💪", "أحسنت! الزيادة اليوم تختصر عليك من الخطة 🌿"],
      good: ["أحسنت! أتممت يومك كما خططت، استمر 🌱", "ما شاء الله، يوم موفّق. حافظ على هذا الثبات 💚", "بارك الله فيك! خطوة جديدة في طريق الحفظ ✨"],
      some: ["بداية طيبة، وما نقص اليوم تقدر تعوّضه يوم الجمعة بإذن الله 🤍", "لا بأس، المهم الاستمرار. غدًا يوم جديد، وكن قدوة لنفسك 🌅", "أنجزت جزءًا اليوم، والنقص محفوظ لك لتعوّضه، لا تتوقف 💫"],
      none: ["ابدأ من جديد اليوم، أول خطوة هي الأصعب والله معك 🌙", "يوم فاتك؟ لا تحزن، نيّتك طيبة والخطة تنتظرك. يلا ابدأ! 💪", "كن قدوة لنفسك: خطوة صغيرة الآن أفضل من لا شيء 🌿"]
    };
    if (!d || !d.report && d.status !== "done") return pick(msgs.none, seed);
    var st = d.status;
    if (st === "missed" || st === "compensated") return pick(st === "compensated" ? msgs.good : msgs.none, seed);
    var extra = (d.t && d.t.st === "extra") || (d.nw && d.nw.st === "extra");
    var less = (d.t && (d.t.st === "partial" || d.t.st === "none")) || (d.nw && (d.nw.st === "partial" || d.nw.st === "none")) || (d.fx && d.fx.st === "none");
    if (less) return pick(msgs.some, seed);
    if (extra) return pick(msgs.great, seed);
    return pick(msgs.good, seed);
  }

  /* -------------------------------------------------------------------
     تاريخ اليوم الافتراضي للتقرير (بعد منتصف الليل وحتى 4 فجرًا يُعتبر اليوم السابق إن لم يُرسل)
     ------------------------------------------------------------------- */
  function defaultReportDate() {
    var now = new Date(), t = ymd(now);
    if (now.getHours() < 4) {
      var y = addDays(t, -1);
      if (state && !state.reports[y] && dowOf(y) !== 5 && !isRest(y) && state.start && y >= state.start) return y;
    }
    return t;
  }

  /* -------------------------------------------------------------------
     واجهة عامة صغيرة
     ------------------------------------------------------------------- */
  function toast(msg, kind) {
    var el = document.getElementById("qtToast");
    if (!el) {
      el = document.createElement("div"); el.id = "qtToast"; el.className = "toast";
      document.body.appendChild(el);
    }
    el.className = "toast show " + (kind || "");
    el.innerHTML = esc(msg);
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.className = "toast " + (kind || ""); }, 3200);
  }

  function applyTheme() {
    try {
      if (window.localStorage.getItem("darkMode") === "true") document.body.className += " dark";
    } catch (e) {}
  }
  function bindThemeButton(id) {
    var b = document.getElementById(id);
    if (!b) return;
    function label() { b.innerHTML = /(^| )dark( |$)/.test(document.body.className) ? "☀️ الوضع النهاري" : "🌙 الوضع الليلي"; }
    label();
    b.onclick = function () {
      var has = /(^| )dark( |$)/.test(document.body.className);
      if (has) document.body.className = document.body.className.replace(/(^| )dark( |$)/g, " ");
      else document.body.className += " dark";
      try { window.localStorage.setItem("darkMode", has ? "false" : "true"); } catch (e) {}
      label();
    };
  }

  return {
    SURAHS: SURAHS, SLOTS: SLOTS, MAIDA: MAIDA, UNITS: UNITS, TOTAL12: TOTAL12,
    esc: esc, ymd: ymd, parseYmd: parseYmd, addDays: addDays, dowOf: dowOf, todayStr: todayStr, isYmd: isYmd,
    prettyDate: prettyDate, shortDate: shortDate, weekStart: weekStart, getParam: getParam, DAYNAMES: DAYNAMES, MONTHS: MONTHS,
    isRest: isRest, fmtU: fmtU, parseU: parseU, normDigits: normDigits,
    unitInfo: unitInfo, segsOf: segsOf, segLabel: segLabel, segFull: segFull, partText: partText,
    init: init, pull: pull, push: push, getState: getState, setStart: setStart, putReport: putReport, putKahf: putKahf, addComp: addComp,
    emptyState: emptyState, merge: merge, hasServer: hasServer,
    compute: compute, dayFor: dayFor, streak: streak, surahTimeline: surahTimeline,
    ST_AR: ST_AR, ST_ICON: ST_ICON, tSummary: tSummary, nSummary: nSummary, fSummary: fSummary,
    todayTasksText: todayTasksText, reportText: reportText, buildReport: buildReport,
    weekStats: weekStats, monthStats: monthStats, encourage: encourage, defaultReportDate: defaultReportDate,
    toast: toast, applyTheme: applyTheme, bindThemeButton: bindThemeButton,
    _setState: function (s) { state = s; }
  };
})();

/* =====================================================================
   واجهة التعويض (الأيام الناقصة + الكنز الناقص + الجديد الناقص)
   تظهر في صفحة الخطة وفي تقرير الجمعة. التعويض نفسه مسموح يوم الجمعة فقط.
   ===================================================================== */
QT.renderComp = function (box, M, enabled, onChange) {
  var esc = QT.esc, html = "", i, j;
  function note(t) { return '<p class="muted">' + t + '</p>'; }

  if (!M) { box.innerHTML = note("حدّد تاريخ بداية الخطة أولًا."); return; }
  if (!enabled) html += '<div class="err" style="background:#fff1d6;color:#8a5e00">🔒 التعويض متاح يوم الجمعة فقط. تقدر تشوف النواقص هنا فقط.</div>';

  /* ---- الأيام الناقصة ---- */
  html += '<h3>⚠️ الأيام الناقصة (' + M.missedDays.length + ')</h3>';
  if (!M.missedDays.length) html += note("لا توجد أيام ناقصة 👏");
  for (i = 0; i < M.missedDays.length; i++) {
    var md = M.missedDays[i];
    html += '<div class="dayline missed"><div class="meta"><div class="title">اليوم ' + md.n + ' — ' + QT.prettyDate(md.date) + '</div>' +
            '<div class="sub">لم يتم فيه شيء. عند التعويض يرجع لمكانه في الأيام المكتملة ويظل مرتبطًا بتاريخه.</div></div>' +
            (enabled ? '<button class="btn small" data-act="day" data-ref="' + md.date + '">تم تعويضه بالكامل</button>' : '') + '</div>';
  }

  /* ---- الكنز الناقص ---- */
  html += '<h3 style="margin-top:22px">💎 الكنز الناقص (' + (M.tDefTotal ? QT.fmtU(M.tDefTotal) + ' ربع' : '0') + ')</h3>';
  if (!M.tDefOpen.length) html += note("لا يوجد كنز ناقص 👏");
  for (i = 0; i < M.tDefOpen.length; i++) {
    var td = M.tDefOpen[i], segs = QT.segsOf(td.curFrom, td.to), ss = [];
    for (j = 0; j < segs.length; j++) ss.push(QT.segFull(segs[j]));
    html += '<div class="dayline"><div class="meta"><div class="title">اليوم ' + td.n + ' — ' + QT.shortDate(td.date) + ' · ناقص ' + QT.fmtU(td.rem) + ' ربع</div>' +
            '<div class="sub">' + esc(ss.join(" + ")) + '</div></div>';
    if (enabled) html += '<div class="row"><button class="btn small" data-act="t-full" data-ref="' + td.id + '" data-amt="' + td.rem + '">تم بالكامل</button>' +
                         '<button class="btn small gray" data-act="t-part" data-ref="' + td.id + '" data-rem="' + td.rem + '">جزئي</button></div>';
    html += '</div>';
  }

  /* ---- الجديد الناقص ---- */
  html += '<h3 style="margin-top:22px">📖 الجديد الناقص (' + M.nDefTotal + ' آية)</h3>';
  if (!M.nDefOpen.length) html += note("لا يوجد جديد ناقص 👏");
  for (i = 0; i < M.nDefOpen.length; i++) {
    var nd = M.nDefOpen[i];
    html += '<div class="dayline"><div class="meta"><div class="title">اليوم ' + nd.n + ' — ' + QT.shortDate(nd.date) + ' · ربع ' + nd.q + ' من المائدة</div>' +
            '<div class="sub">الآيات الناقصة: من ' + nd.curFrom + ' إلى ' + nd.to + ' (' + nd.rem + ' آية)</div></div>';
    if (enabled) html += '<div class="row"><button class="btn small" data-act="n-full" data-ref="' + nd.id + '" data-amt="' + nd.rem + '">تم بالكامل</button>' +
                         '<button class="btn small gray" data-act="n-part" data-ref="' + nd.id + '" data-from="' + nd.curFrom + '" data-to="' + nd.to + '">جزئي</button></div>';
    html += '</div>';
  }
  html += '<div id="compBoxMsg"></div>';
  box.innerHTML = html;

  box.onclick = function (ev) {
    ev = ev || window.event;
    var t = ev.target || ev.srcElement;
    while (t && t !== box && !(t.getAttribute && t.getAttribute("data-act"))) t = t.parentNode;
    if (!t || t === box) return;
    var act = t.getAttribute("data-act"), ref = t.getAttribute("data-ref");
    if (!enabled) return;
    if (act === "day") { QT.addComp("day", ref, 0); QT.toast("تم تعويض اليوم ✅", "ok2"); if (onChange) onChange(); return; }
    if (act === "t-full") { QT.addComp("t", ref, Number(t.getAttribute("data-amt"))); QT.toast("تم تعويض الكنز ✅", "ok2"); if (onChange) onChange(); return; }
    if (act === "n-full") { QT.addComp("n", ref, Number(t.getAttribute("data-amt"))); QT.toast("تم تعويض الجديد ✅", "ok2"); if (onChange) onChange(); return; }
    if (act === "t-part") {
      var rem = Number(t.getAttribute("data-rem"));
      var v = window.prompt("كم ربعًا حفظت من هذا النقص؟ (مثل ½ أو ¾ أو 1 أو 1½) — الحد الأقصى أقل من " + QT.fmtU(rem), "");
      if (v === null) return;
      var a = QT.parseU(v);
      if (a === null || a <= 0 || a >= rem) { QT.toast("اكتب مقدارًا صحيحًا أقل من " + QT.fmtU(rem), "err2"); return; }
      QT.addComp("t", ref, a); QT.toast("تم تسجيل الجزء، وبقي " + QT.fmtU(rem - a) + " ✅", "ok2"); if (onChange) onChange(); return;
    }
    if (act === "n-part") {
      var f = Number(t.getAttribute("data-from")), to = Number(t.getAttribute("data-to"));
      var v2 = window.prompt("اكتب آخر آية حفظتها (بين " + f + " و " + (to - 1) + ")", "");
      if (v2 === null) return;
      var e = parseInt(QT.normDigits(v2), 10);
      if (isNaN(e) || e < f || e >= to) { QT.toast("اكتب رقم آية بين " + f + " و " + (to - 1), "err2"); return; }
      QT.addComp("n", ref, e - f + 1); QT.toast("تم تسجيل الجزء ✅", "ok2"); if (onChange) onChange(); return;
    }
  };
};
