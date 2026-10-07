// ==========================================
// متابعة حفظ القرآن الكريم
// ==========================================


// ==========================================
// أسماء السور
// ==========================================

const surahs = [
    "الفاتحة",
    "البقرة",
    "آل عمران",
    "النساء",
    "المائدة",
    "الأنعام",
    "الأعراف",
    "الأنفال",
    "التوبة",
    "يونس",
    "هود",
    "يوسف",
    "الرعد",
    "إبراهيم",
    "الحجر",
    "النحل",
    "الإسراء",
    "الكهف",
    "مريم",
    "طه",
    "الأنبياء",
    "الحج",
    "المؤمنون",
    "النور",
    "الفرقان",
    "الشعراء",
    "النمل",
    "القصص",
    "العنكبوت",
    "الروم",
    "لقمان",
    "السجدة",
    "الأحزاب",
    "سبأ",
    "فاطر",
    "يس",
    "الصافات",
    "ص",
    "الزمر",
    "غافر",
    "فصلت",
    "الشورى",
    "الزخرف",
    "الدخان",
    "الجاثية",
    "الأحقاف",
    "محمد",
    "الفتح",
    "الحجرات",
    "ق",
    "الذاريات",
    "الطور",
    "النجم",
    "القمر",
    "الرحمن",
    "الواقعة",
    "الحديد",
    "المجادلة",
    "الحشر",
    "الممتحنة",
    "الصف",
    "الجمعة",
    "المنافقون",
    "التغابن",
    "الطلاق",
    "التحريم",
    "الملك",
    "القلم",
    "الحاقة",
    "المعارج",
    "نوح",
    "الجن",
    "المزمل",
    "المدثر",
    "القيامة",
    "الإنسان",
    "المرسلات",
    "النبأ",
    "النازعات",
    "عبس",
    "التكوير",
    "الانفطار",
    "المطففين",
    "الانشقاق",
    "البروج",
    "الطارق",
    "الأعلى",
    "الغاشية",
    "الفجر",
    "البلد",
    "الشمس",
    "الليل",
    "الضحى",
    "الشرح",
    "التين",
    "العلق",
    "القدر",
    "البينة",
    "الزلزلة",
    "العاديات",
    "القارعة",
    "التكاثر",
    "العصر",
    "الهمزة",
    "الفيل",
    "قريش",
    "الماعون",
    "الكوثر",
    "الكافرون",
    "النصر",
    "المسد",
    "الإخلاص",
    "الفلق",
    "الناس"
];


// ==========================================
// خطة السور: يوم البداية ويوم النهاية
// ==========================================
//
// ملاحظة:
// الفاتحة والبقرة وآل عمران والنساء ليست محفوظة سابقًا.
// لذلك تظهر "لم يبدأ الحفظ".
//
// الأيام هنا مبنية على خطة الكنز التي أعطيتها.
// ==========================================

const surahPlan = {

    "المائدة": { start: 1, end: 18 },

    "الأنعام": { start: 1, end: 5 },

    "الأعراف": { start: 5, end: 10 },

    "الأنفال": { start: 10, end: 12 },

    "التوبة": { start: 12, end: 16 },

    "يونس": { start: 17, end: 19 },

    "هود": { start: 20, end: 22 },

    "يوسف": { start: 23, end: 25 },

    "الرعد": { start: 25, end: 26 },

    "إبراهيم": { start: 27, end: 27 },

    "الحجر": { start: 28, end: 28 },

    "النحل": { start: 29, end: 31 },

    "الإسراء": { start: 32, end: 34 },

    "الكهف": { start: 34, end: 36 },

    "مريم": { start: 37, end: 37 },

    "طه": { start: 38, end: 39 },

    "الأنبياء": { start: 40, end: 41 },

    "الحج": { start: 41, end: 43 },

    "المؤمنون": { start: 43, end: 44 },

    "النور": { start: 45, end: 46 },

    "الفرقان": { start: 47, end: 48 },

    "الشعراء": { start: 48, end: 50 },

    "النمل": { start: 50, end: 52 },

    "القصص": { start: 52, end: 54 },

    "العنكبوت": { start: 55, end: 56 },

    "الروم": { start: 56, end: 57 },

    "لقمان": { start: 57, end: 58 },

    "السجدة": { start: 58, end: 58 },

    "الأحزاب": { start: 59, end: 61 },

    "سبأ": { start: 61, end: 62 },

    "فاطر": { start: 62, end: 63 },

    "يس": { start: 63, end: 64 },

    "الصافات": { start: 65, end: 66 },

    "ص": { start: 66, end: 68 },

    "الزمر": { start: 67, end: 68 },

    "غافر": { start: 69, end: 70 },

    "فصلت": { start: 71, end: 72 },

    "الشورى": { start: 72, end: 74 },

    "الزخرف": { start: 73, end: 74 },

    "الدخان": { start: 75, end: 75 },

    "الجاثية": { start: 75, end: 75 },

    "الأحقاف": { start: 76, end: 76 },

    "محمد": { start: 77, end: 77 },

    "الفتح": { start: 77, end: 78 },

    "الحجرات": { start: 78, end: 78 },

    "ق": { start: 79, end: 79 },

    "الذاريات": { start: 79, end: 80 },

    "الطور": { start: 80, end: 80 },

    "النجم": { start: 81, end: 81 },

    "القمر": { start: 81, end: 81 },

    "الرحمن": { start: 82, end: 82 },

    "الواقعة": { start: 82, end: 82 },

    "الحديد": { start: 83, end: 83 },

    "المجادلة": { start: 83, end: 83 },

    "الحشر": { start: 84, end: 84 },

    "الممتحنة": { start: 84, end: 84 },

    "الصف": { start: 85, end: 85 },

    "الجمعة": { start: 85, end: 85 },

    "المنافقون": { start: 85, end: 85 },

    "التغابن": { start: 85, end: 85 },

    "الطلاق": { start: 86, end: 86 },

    "التحريم": { start: 86, end: 86 },

    "الملك": { start: 86, end: 86 },

    "القلم": { start: 87, end: 87 },

    "الحاقة": { start: 87, end: 87 },

    "المعارج": { start: 87, end: 87 },

    "نوح": { start: 88, end: 88 },

    "الجن": { start: 88, end: 88 },

    "المزمل": { start: 88, end: 88 },

    "المدثر": { start: 88, end: 88 },

    "القيامة": { start: 89, end: 89 },

    "المرسلات": { start: 89, end: 89 },

    "النبأ": { start: 89, end: 89 },

    "النازعات": { start: 89, end: 89 },

    "عبس": { start: 89, end: 89 },

    "التكوير": { start: 89, end: 89 },

    "الانفطار": { start: 89, end: 89 },

    "المطففين": { start: 89, end: 89 },

    "الانشقاق": { start: 89, end: 89 },

    "البروج": { start: 89, end: 89 },

    "الطارق": { start: 89, end: 89 },

    "الأعلى": { start: 89, end: 89 },

    "الغاشية": { start: 89, end: 89 },

    "الفجر": { start: 89, end: 89 },

    "البلد": { start: 89, end: 89 },

    "الشمس": { start: 89, end: 89 },

    "الليل": { start: 89, end: 89 },

    "الضحى": { start: 89, end: 89 },

    "الشرح": { start: 89, end: 89 },

    "التين": { start: 89, end: 89 },

    "العلق": { start: 89, end: 89 },

    "القدر": { start: 90, end: 90 },

    "البينة": { start: 90, end: 90 },

    "الزلزلة": { start: 90, end: 90 },

    "العاديات": { start: 90, end: 90 },

    "القارعة": { start: 90, end: 90 },

    "التكاثر": { start: 90, end: 90 },

    "العصر": { start: 90, end: 90 },

    "الهمزة": { start: 90, end: 90 },

    "الفيل": { start: 90, end: 90 },

    "قريش": { start: 90, end: 90 },

    "الماعون": { start: 90, end: 90 },

    "الكوثر": { start: 90, end: 90 },

    "الكافرون": { start: 90, end: 90 },

    "النصر": { start: 90, end: 90 },

    "المسد": { start: 90, end: 90 },

    "الإخلاص": { start: 90, end: 90 },

    "الفلق": { start: 90, end: 90 },

    "الناس": { start: 90, end: 90 }
};


// ==========================================
// السور التي تم تعليمها كمكتملة
// ==========================================

let completedSurahs =
    JSON.parse(
        localStorage.getItem("completedSurahs")
    ) || [];


// ==========================================
// اليوم الحالي
// ==========================================

let currentDay =
    Number(
        localStorage.getItem("currentPlanDay")
    ) || 1;


// ==========================================
// عرض السور
// ==========================================

function displaySurahs(searchText = "") {

    const list =
        document.getElementById("surahList");

    if (!list) return;

    list.innerHTML = "";

    surahs.forEach((surah, index) => {

        if (
            searchText &&
            !surah.includes(searchText)
        ) {
            return;
        }


        const plan =
            surahPlan[surah];


        const completed =
            completedSurahs.includes(index);


        let statusClass =
            "status-not-started";

        let statusText =
            "⚪ لم يبدأ الحفظ";

        let daysText =
            "";


        // السورة مكتملة يدويًا

        if (completed) {

            statusClass =
                "status-completed";

            statusText =
                "🟢 تم إتقان السورة";

        }


        // السورة موجودة في الخطة

        else if (plan) {

            statusClass =
                "status-planned";

            statusText =
                "🟡 سيتم حفظها ضمن الخطة";

            if (plan.start === plan.end) {

                daysText =
                    `سيتم البدء فيها وإنهاؤها في اليوم ${plan.start}`;

            } else {

                daysText =
                    `سيبدأ حفظها في اليوم ${plan.start}
                     وسيتم الانتهاء منها في اليوم ${plan.end}`;
            }

        }


        const card =
            document.createElement("div");

        card.className =
            `surah-card ${statusClass}`;


        card.innerHTML = `

            <div class="surah-number">
                سورة رقم ${index + 1}
            </div>

            <div class="surah-name">
                ${surah}
            </div>

            <div class="surah-status">
                ${statusText}
            </div>

            ${
                plan
                ?
                `
                <div class="surah-days">
                    📅 ${daysText}
                </div>
                `
                :
                ""
            }

            <button
                class="surah-action ${completed ? "completed" : ""}"
                onclick="toggleSurah(${index})">

                ${
                    completed
                    ? "↩️ إلغاء إتقان السورة"
                    : "✅ تم إتقان السورة"
                }

            </button>

        `;

        list.appendChild(card);

    });


    updateStats();
}


// ==========================================
// تغيير حالة السورة
// ==========================================

function toggleSurah(index) {

    if (
        completedSurahs.includes(index)
    ) {

        completedSurahs =
            completedSurahs.filter(
                item => item !== index
            );

    } else {

        completedSurahs.push(index);
    }


    localStorage.setItem(
        "completedSurahs",
        JSON.stringify(completedSurahs)
    );


    const searchInput =
        document.getElementById("searchInput");


    displaySurahs(
        searchInput
        ? searchInput.value
        : ""
    );
}


// ==========================================
// الإحصائيات
// ==========================================

function updateStats() {

    const completed =
        completedSurahs.length;


    const total =
        surahs.length;


    const percentage =
        Math.round(
            (completed / total) * 100
        );


    const completedText =
        document.getElementById("completedText");


    const progressText =
        document.getElementById("progressText");


    const progressBar =
        document.getElementById("progressBar");


    const progressMessage =
        document.getElementById("progressMessage");


    const progressLabel =
        document.getElementById("progressLabel");


    if (completedText) {

        completedText.textContent =
            completed;
    }


    if (progressText) {

        progressText.textContent =
            percentage + "%";
    }


    if (progressBar) {

        progressBar.style.width =
            percentage + "%";
    }


    if (progressLabel) {

        progressLabel.textContent =
            `${completed} من ${total} سورة`;
    }


    if (progressMessage) {

        if (completed === 0) {

            progressMessage.textContent =
                "ابدأ بتسجيل أول إنجاز لك اليوم 💪";

        } else if (percentage < 50) {

            progressMessage.textContent =
                "ممتاز! استمر ولا تتوقف 🌱";

        } else if (percentage < 100) {

            progressMessage.textContent =
                "أحسنت! أنت تقترب من إكمال القرآن 💪";

        } else {

            progressMessage.textContent =
                "ما شاء الله! أكملت جميع السور 🎉";
        }
    }
}


// ==========================================
// تحديث اليوم
// ==========================================

function updateDayDisplay() {

    const currentDayElement =
        document.getElementById("currentDay");


    const dayPercentage =
        document.getElementById("dayPercentage");


    const dayDescription =
        document.getElementById("dayDescription");


    if (currentDayElement) {

        currentDayElement.textContent =
            `اليوم ${currentDay} من 90`;
    }


    if (dayPercentage) {

        const percentage =
            Math.round(
                (currentDay / 90) * 100
            );

        dayPercentage.textContent =
            percentage + "%";
    }


    if (dayDescription) {

        if (currentDay === 1) {

            dayDescription.textContent =
                "بداية خطة حفظ القرآن الكريم";

        } else if (currentDay === 90) {

            dayDescription.textContent =
                "اليوم الأخير — ختام الخطة";

        } else {

            dayDescription.textContent =
                "استمر في خطة الحفظ والتثبيت";
        }
    }
}


// ==========================================
// تسجيل حفظ اليوم
// ==========================================

const todayButton =
    document.getElementById("todayButton");


if (todayButton) {

    todayButton.addEventListener(
        "click",
        function () {

            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            localStorage.setItem(
                "lastStudyDate",
                today
            );


            const todayStatus =
                document.getElementById("todayStatus");


            if (todayStatus) {

                todayStatus.textContent =
                    "✅ تم تسجيل حفظ اليوم بنجاح";
            }


            updateStreak();
        }
    );
}


// ==========================================
// الأيام المتتالية
// ==========================================

function updateStreak() {

    const streakText =
        document.getElementById("streakText");


    if (!streakText) return;


    const lastDate =
        localStorage.getItem(
            "lastStudyDate"
        );


    if (!lastDate) {

        streakText.textContent =
            "0";

        return;
    }


    const last =
        new Date(lastDate);


    const today =
        new Date();


    last.setHours(0, 0, 0, 0);

    today.setHours(0, 0, 0, 0);


    const difference =
        Math.floor(
            (today - last) /
            (1000 * 60 * 60 * 24)
        );


    streakText.textContent =
        difference === 0
            ? "1"
            : "0";
}


// ==========================================
// البحث
// ==========================================

const searchInput =
    document.getElementById("searchInput");


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            displaySurahs(
                this.value.trim()
            );
        }
    );
}


// ==========================================
// الوضع الليلي
// ==========================================

const themeButton =
    document.getElementById("themeButton");


if (themeButton) {

    themeButton.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "dark"
            );


            const darkMode =
                document.body.classList.contains(
                    "dark"
                );


            localStorage.setItem(
                "darkMode",
                darkMode
            );


            themeButton.textContent =
                darkMode
                ? "☀️ الوضع النهاري"
                : "🌙 الوضع الليلي";
        }
    );


    if (
        localStorage.getItem(
            "darkMode"
        ) === "true"
    ) {

        document.body.classList.add(
            "dark"
        );

        themeButton.textContent =
            "☀️ الوضع النهاري";
    }
}


// ==========================================
// التذكير
// ==========================================

const reminderTime =
    document.getElementById(
        "reminderTime"
    );


const saveReminderButton =
    document.getElementById(
        "saveReminderButton"
    );


const reminderStatus =
    document.getElementById(
        "reminderStatus"
    );


if (reminderTime) {

    const savedTime =
        localStorage.getItem(
            "reminderTime"
        );


    if (savedTime) {

        reminderTime.value =
            savedTime;
    }
}


if (saveReminderButton) {

    saveReminderButton.addEventListener(
        "click",
        function () {

            if (!reminderTime) return;


            localStorage.setItem(
                "reminderTime",
                reminderTime.value
            );


            if (reminderStatus) {

                reminderStatus.textContent =
                    "✅ تم حفظ وقت التذكير: " +
                    reminderTime.value;
            }
        }
    );
}


// ==========================================
// فتح صفحة الحفظ
// ==========================================

function openHifzPage() {

    window.location.href =
        "hifz.html";
}


// ==========================================
// فتح صفحة التقارير
// ==========================================

function openReportsPage() {

    window.location.href =
        "reports.html";
}


// ==========================================
// تشغيل الموقع
// ==========================================

displaySurahs();

updateStats();

updateStreak();

updateDayDisplay();