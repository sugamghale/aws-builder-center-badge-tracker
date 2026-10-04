/* AWS Builder Center Badge Tracker — all data remains in browser localStorage. */
(() => {
  "use strict";
  const STORAGE_KEY = "awsBuilderBadgeTracker";
  const ACTIVITY_META = {
    visit: ["Visited Builder Center", "Visit Builder Center"],
    read: ["Read an article", "Read 1 article"],
    comment: ["Commented", "Leave 1 meaningful comment"],
    like: ["Liked content", "Like 2–3 pieces of content"],
    wishVote: ["Voted on a Wish", "Vote on a Wish"],
  };
  const DAILY_KEYS = Object.keys(ACTIVITY_META);
  const BADGES = [
    {
      id: "hello",
      tier: "quick",
      name: "Hello, World!",
      description: "Complete your About section.",
      type: "toggle",
      key: "aboutComplete",
    },
    {
      id: "photo",
      tier: "quick",
      name: "Photo Finisher",
      description: "Upload a profile photo.",
      type: "toggle",
      key: "photoComplete",
    },
    {
      id: "discussion",
      tier: "quick",
      name: "Discussion Debut",
      description: "Leave 1 comment.",
      type: "count",
      key: "comments",
      target: 1,
    },
    {
      id: "knowledge",
      tier: "quick",
      name: "Knowledge Seeker",
      description: "Read 10 articles.",
      type: "count",
      key: "articlesRead",
      target: 10,
    },
    {
      id: "wish",
      tier: "quick",
      name: "First Wish",
      description: "Create your first Wish.",
      type: "count",
      key: "wishesCreated",
      target: 1,
    },
    {
      id: "article",
      tier: "quick",
      name: "First Article",
      description: "Publish your first article.",
      type: "toggle",
      key: "firstArticleComplete",
    },
    {
      id: "influencer",
      tier: "quick",
      name: "Idea Influencer",
      description: "Get 10 votes on your Wishes.",
      type: "count",
      key: "wishVotesReceived",
      target: 10,
    },
    {
      id: "conversation",
      tier: "quick",
      name: "Conversation Starter",
      description: "Get replies on 10 of your comments.",
      type: "count",
      key: "commentRepliesReceived",
      target: 10,
    },
    {
      id: "visit7",
      tier: "quick",
      name: "7-Day Visit Streak",
      description: "Visit Builder Center daily for 7 consecutive days.",
      type: "streak",
      activity: "visit",
      target: 7,
    },
    {
      id: "comment7",
      tier: "quick",
      name: "7-Day Comment Streak",
      description: "Comment daily for 7 consecutive days.",
      type: "streak",
      activity: "comment",
      target: 7,
    },
    {
      id: "like7",
      tier: "quick",
      name: "7-Day Like Streak",
      description: "Like content daily for 7 consecutive days.",
      type: "streak",
      activity: "like",
      target: 7,
    },
    {
      id: "wishWeek4",
      tier: "consistency",
      name: "4-Week Wish Vote Streak",
      description: "Vote on a Wish weekly for 4 consecutive weeks.",
      type: "weekly",
      activity: "wishVote",
      target: 4,
    },
    {
      id: "articleWeek4",
      tier: "consistency",
      name: "4-Week Article Publishing Streak",
      description: "Publish an article weekly for 4 consecutive weeks.",
      type: "weeklyArticles",
      target: 4,
    },
    {
      id: "visit30",
      tier: "consistency",
      name: "30-Day Visit Streak",
      description: "Visit Builder Center daily for 30 consecutive days.",
      type: "streak",
      activity: "visit",
      target: 30,
    },
    {
      id: "comment30",
      tier: "consistency",
      name: "30-Day Comment Streak",
      description: "Comment daily for 30 consecutive days.",
      type: "streak",
      activity: "comment",
      target: 30,
    },
    {
      id: "like30",
      tier: "consistency",
      name: "30-Day Like Streak",
      description: "Like content daily for 30 consecutive days.",
      type: "streak",
      activity: "like",
      target: 30,
    },
    {
      id: "visit90",
      tier: "consistency",
      name: "90-Day Visit Streak",
      description: "Visit Builder Center daily for 90 consecutive days.",
      type: "streak",
      activity: "visit",
      target: 90,
    },
    {
      id: "comment90",
      tier: "consistency",
      name: "90-Day Comment Streak",
      description: "Comment daily for 90 consecutive days.",
      type: "streak",
      activity: "comment",
      target: 90,
    },
    {
      id: "like90",
      tier: "consistency",
      name: "90-Day Like Streak",
      description: "Like content daily for 90 consecutive days.",
      type: "streak",
      activity: "like",
      target: 90,
    },
    {
      id: "creator",
      tier: "consistency",
      name: "Valued Creator",
      description: "Get at least 10 likes on 5 different articles.",
      type: "likesList",
      list: "articles",
      target: 5,
    },
    {
      id: "contributor",
      tier: "consistency",
      name: "Meaningful Contributor",
      description: "Get at least 10 likes on 5 different comments.",
      type: "likesList",
      list: "comments",
      target: 5,
    },
  ];
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  // Date-only parsing avoids UTC conversion and its off-by-one effects.
  const parseDate = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const dateKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const addDays = (key, amount) => {
    const d = parseDate(key);
    d.setDate(d.getDate() + amount);
    return dateKey(d);
  };
  const diffDays = (from, to) =>
    Math.round((parseDate(to) - parseDate(from)) / 86400000);
  const formatDate = (
    key,
    opts = { month: "long", day: "numeric", year: "numeric" },
  ) =>
    key ? new Intl.DateTimeFormat(undefined, opts).format(parseDate(key)) : "—";
  const defaultData = () => ({
    schemaVersion: 3,
    profile: null,
    activities: {},
    counts: {
      articlesRead: 0,
      comments: 0,
      wishesCreated: 0,
      wishVotesReceived: 0,
      commentRepliesReceived: 0,
      aboutComplete: false,
      photoComplete: false,
      firstArticleComplete: false,
    },
    articles: [],
    comments: [],
    weeklyArticles: [],
    badges: {},
    settings: { theme: "light" },
  });
  let data = load();
  let view = "dashboard";
  let calendarCursor = new Date();
  let selectedDate = todayKey();
  let toastTimer;
  function load() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored) return defaultData();
      const normalized = {
        ...defaultData(),
        ...stored,
        counts: { ...defaultData().counts, ...stored.counts },
        activities: stored.activities || {},
        articles: stored.articles || [],
        comments: stored.comments || [],
        weeklyArticles: stored.weeklyArticles || [],
        badges: stored.badges || {},
      };
      if ((stored.schemaVersion || 0) < 3) {
        const oldWeeklyBadge = normalized.badges.articleWeek4;
        if (oldWeeklyBadge?.completed && !oldWeeklyBadge.earned)
          delete normalized.badges.articleWeek4;
        normalized.schemaVersion = 3;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }
      return normalized;
    } catch {
      return defaultData();
    }
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  function showToast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2500);
  }
  function isReady() {
    return Boolean(data.profile);
  }
  function getActivity(key) {
    return {
      ...Object.fromEntries(DAILY_KEYS.map((k) => [k, false])),
      ...(data.activities[key] || {}),
    };
  }
  function activityTotal(key) {
    return Object.values(data.activities).filter((a) => a[key]).length;
  }
  function datesFor(activity) {
    return Object.entries(data.activities)
      .filter(([, a]) => a[activity])
      .map(([k]) => k)
      .sort();
  }
  // Current = consecutive days ending today or yesterday; longest preserves past streaks.
  function streakInfo(activity) {
    const set = new Set(datesFor(activity));
    const today = todayKey();
    let cursor = set.has(today) ? today : addDays(today, -1);
    let current = 0;
    while (set.has(cursor)) {
      current++;
      cursor = addDays(cursor, -1);
    }
    let longest = 0,
      run = 0,
      previous = null;
    for (const key of [...set].sort()) {
      run = previous && diffDays(previous, key) === 1 ? run + 1 : 1;
      longest = Math.max(longest, run);
      previous = key;
    }
    return { current, longest };
  }
  const weekKey = (key) => {
    const d = parseDate(key);
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return dateKey(d);
  };
  // Weekly publishing entries are deliberately separate from First Article and Valued Creator records.
  function weeklyStreak(type) {
    let keys = [];
    if (type === "wishVote") keys = datesFor("wishVote");
    else
      keys = (data.weeklyArticles || [])
        .map((article) => article.date)
        .filter(Boolean);
    const weeks = [...new Set(keys.map(weekKey))].sort();
    let longest = 0,
      run = 0,
      previous = null;
    for (const key of weeks) {
      run = previous && diffDays(previous, key) === 7 ? run + 1 : 1;
      longest = Math.max(longest, run);
      previous = key;
    }
    const thisWeek = weekKey(todayKey());
    let cursor = weeks.includes(thisWeek) ? thisWeek : addDays(thisWeek, -7);
    let current = 0;
    const set = new Set(weeks);
    while (set.has(cursor)) {
      current++;
      cursor = addDays(cursor, -7);
    }
    // runStart is the Monday of the first week in the current unbroken run.
    const runStart = current ? addDays(cursor, 7) : null;
    return { current, longest, weeks, runStart };
  }
  const fmtDay = (key) =>
    formatDate(key, { weekday: "short", month: "short", day: "numeric" });
  const fmtRange = (a, b) => (a === b ? fmtDay(a) : `${fmtDay(a)} – ${fmtDay(b)}`);
  function weeklyEntries(type) {
    return type === "wishVote"
      ? datesFor("wishVote").map((date) => ({ date, label: "Wish vote" }))
      : (data.weeklyArticles || [])
          .filter((article) => article.date)
          .map((article) => ({ date: article.date, label: article.title }))
          .sort((a, b) => a.date.localeCompare(b.date));
  }
  // Weeks run Monday–Sunday. Any entry inside the next week keeps the streak, but
  // repeating the same weekday rhythm (6–7 days after the last entry) is the safest
  // target, so that is what we recommend. It never starts before the next Monday.
  function nextWindow(anchor) {
    const weekStart = addDays(weekKey(anchor), 7),
      early = addDays(anchor, 6),
      start = early > weekStart ? early : weekStart,
      late = addDays(anchor, 7);
    return {
      start,
      end: late < start ? start : late,
      weekStart,
      weekEnd: addDays(weekStart, 6),
    };
  }
  // Where the user stands today for a weekly goal: done, due, coming up, or open.
  function weeklyPlan(type) {
    const entries = weeklyEntries(type),
      today = todayKey(),
      thisWeek = weekKey(today),
      weekEnd = addDays(thisWeek, 6),
      latestIn = (week) =>
        entries
          .filter((e) => weekKey(e.date) === week)
          .map((e) => e.date)
          .sort()
          .pop() || null,
      base = { weekEnd, daysLeft: diffDays(today, weekEnd) },
      doneDate = latestIn(thisWeek);
    if (doneDate)
      return { ...base, status: "done", doneDate, next: nextWindow(doneDate) };
    const anchor = latestIn(addDays(thisWeek, -7));
    if (anchor) {
      const win = nextWindow(anchor);
      return {
        ...base,
        status: today < win.start ? "soon" : "due",
        anchor,
        window: win,
        inWindow: today >= win.start && today <= win.end,
      };
    }
    return { ...base, status: "open" };
  }
  const WEEKLY_GOALS = {
    articles: {
      icon: "fa-pen-nib",
      title: "Publish your weekly article",
      action: "Add published article",
      actionIcon: "fa-plus",
    },
    wishVote: {
      icon: "fa-thumbs-up",
      title: "Vote on a Wish",
      action: "Log today’s Wish vote",
      actionIcon: "fa-check",
    },
  };
  // Turns a plan into the label and sentence shown on the Dashboard and Weekly goals pages.
  function planMessage(type, plan) {
    const noun = type === "articles" ? "an article" : "a Wish vote";
    const lastDay = plan.daysLeft === 0;
    if (plan.status === "done")
      return {
        pill: "Done this week",
        tone: "complete",
        text: `Logged on ${fmtDay(plan.doneDate)}. Next recommended window: ${fmtRange(plan.next.start, plan.next.end)}. Any day from ${fmtDay(plan.next.weekStart)} to ${fmtDay(plan.next.weekEnd)} still keeps your streak.`,
      };
    if (plan.status === "soon")
      return {
        pill: "Coming up",
        tone: "start",
        text: `Last entry: ${fmtDay(plan.anchor)}. Recommended window: ${fmtRange(plan.window.start, plan.window.end)}. Logging ${noun} any time up to ${fmtDay(plan.weekEnd)} still keeps your streak.`,
      };
    if (plan.status === "due") {
      const base = `Last entry: ${fmtDay(plan.anchor)}. `;
      if (plan.inWindow)
        return {
          pill: "Due today",
          tone: "due",
          text: `${base}Today is inside your recommended window (${fmtRange(plan.window.start, plan.window.end)}). Log ${noun} to keep your weekly streak going.`,
        };
      return {
        pill: lastDay ? "Last day" : "Overdue",
        tone: "due",
        text: `${base}Your recommended window (${fmtRange(plan.window.start, plan.window.end)}) has passed, but ${noun} logged by ${fmtDay(plan.weekEnd)} still keeps the streak alive${lastDay ? ". That is today." : "."}`,
      };
    }
    return {
      pill: lastDay ? "Last day" : "Open this week",
      tone: lastDay ? "due" : "progressing",
      text: `No weekly streak is running yet. Log ${noun} on any day up to ${fmtDay(plan.weekEnd)} to ${lastDay ? "count this week" : "start one"}.`,
    };
  }
  function completionDate(badge) {
    const record = data.badges[badge.id];
    if (record?.date) return record.date;
    if (record?.earned) return record.date || null;
    if (badge.type === "streak") {
      const dates = datesFor(badge.activity);
      for (let i = badge.target - 1; i < dates.length; i++) {
        let valid = true;
        for (let j = 1; j < badge.target; j++)
          if (diffDays(dates[i - j], dates[i - j + 1]) !== 1) valid = false;
        if (valid) return dates[i];
      }
    }
    if (badge.type === "weekly" || badge.type === "weeklyArticles") {
      const weeks = weeklyStreak(
        badge.type === "weekly" ? badge.activity : "articles",
      ).weeks;
      for (let i = badge.target - 1; i < weeks.length; i++) {
        let valid = true;
        for (let j = 1; j < badge.target; j++)
          if (diffDays(weeks[i - j], weeks[i - j + 1]) !== 7) valid = false;
        if (valid) return weeks[i];
      }
    }
    return null;
  }
  function badgeProgress(badge) {
    const record = data.badges[badge.id];
    if (record?.earned || record?.completed)
      return {
        value: badge.target || 1,
        target: badge.target || 1,
        complete: true,
        earned: Boolean(record.earned),
        date: record.date || null,
      };
    let value = 0,
      target = badge.target || 1;
    if (badge.type === "toggle") value = data.counts[badge.key] ? 1 : 0;
    if (badge.type === "count") {
      const activityKey =
        badge.key === "articlesRead"
          ? "read"
          : badge.key === "comments"
            ? "comment"
            : null;
      value = Math.min(
        Math.max(
          Number(data.counts[badge.key]) || 0,
          activityKey ? activityTotal(activityKey) : 0,
        ),
        target,
      );
    }
    if (badge.type === "articles")
      value = Math.min(data.articles.length, target);
    if (badge.type === "streak")
      value = Math.min(streakInfo(badge.activity).longest, target);
    if (badge.type === "weekly")
      value = Math.min(weeklyStreak(badge.activity).longest, target);
    if (badge.type === "weeklyArticles")
      value = Math.min(weeklyStreak("articles").longest, target);
    if (badge.type === "likesList")
      value = Math.min(
        data[badge.list].filter((x) => Number(x.likes) >= 10).length,
        target,
      );
    return {
      value,
      target,
      complete: value >= target,
      earned: false,
      date: completionDate(badge),
    };
  }
  function updateBadges() {
    const newCompletions = [];
    BADGES.forEach((b) => {
      const p = badgeProgress(b),
        old = data.badges[b.id];
      if (p.complete && !old?.completed && !old?.earned) {
        data.badges[b.id] = { completed: true, date: p.date || todayKey() };
        newCompletions.push(b);
      } else if (p.complete && old && !old.date)
        old.date = p.date || todayKey();
    });
    save();
    if (newCompletions.length && !$("#badge-dialog").open) {
      const b = newCompletions[0];
      $("#celebration-title").textContent = b.name;
      $("#celebration-text").textContent =
        `You completed ${b.description.toLowerCase()} Keep your builder journey moving.`;
      $("#celebration-dialog").showModal();
    }
  }
  function allProgress() {
    const entries = BADGES.map((b) => ({ badge: b, ...badgeProgress(b) }));
    return { entries, complete: entries.filter((x) => x.complete).length };
  }
  function selectedBadgeIds(root, fieldName) {
    return $$(`input[name="${fieldName}"]:checked`, root).map(
      (input) => input.value,
    );
  }
  function selectedBadgeDates(root, fieldName) {
    return Object.fromEntries(
      $$(`input[name="${fieldName}-date"]`, root).map((input) => [
        input.dataset.badgeId,
        input.value || null,
      ]),
    );
  }
  // Manual "already earned" status never creates activity history or changes a streak.
  function setEarnedBadges(ids, dates = {}) {
    const selected = new Set(ids);
    BADGES.forEach((badge) => {
      const existing = data.badges[badge.id];
      if (selected.has(badge.id)) {
        const hasDate = Object.prototype.hasOwnProperty.call(dates, badge.id);
        data.badges[badge.id] = {
          ...existing,
          earned: true,
          date: hasDate ? dates[badge.id] : existing?.date || null,
        };
      } else if (existing?.earned) {
        if (existing.completed)
          data.badges[badge.id] = {
            completed: true,
            date: existing.date || null,
          };
        else delete data.badges[badge.id];
      }
    });
  }
  function renderBadgePicker(container, fieldName, includeDates = false) {
    if (!container) return;
    const groups = [
      ["quick", "Quick Wins"],
      ["consistency", "Consistency"],
    ];
    container.innerHTML = groups
      .map(
        ([tier, title]) =>
          `<fieldset class="badge-picker-group"><legend>${title}</legend>${BADGES.filter(
            (badge) => badge.tier === tier,
          )
            .map((badge) => {
              const record = data.badges[badge.id],
                earned = Boolean(record?.earned);
              return `<label class="badge-picker-option"><input type="checkbox" name="${fieldName}" value="${badge.id}" ${earned ? "checked" : ""} ${fieldName === "setup-earned-badge" ? "data-onboarding-earned" : ""} ${fieldName === "settings-earned-badge" ? "data-settings-earned" : ""}><span><strong>${badge.name}</strong><small>${badge.description}</small></span>${includeDates ? `<input class="completion-date" name="${fieldName}-date" data-badge-id="${badge.id}" ${fieldName === "settings-earned-badge" ? "data-settings-earned-date" : ""} type="date" value="${record?.date || ""}" ${earned ? "" : "disabled"} aria-label="${badge.name} completion date">` : ""}</label>`;
            })
            .join("")}</fieldset>`,
      )
      .join("");
  }
  function updateSetupEarnedMessage() {
    const message = $("#setup-earned-message");
    if (message)
      message.hidden =
        selectedBadgeIds($("#onboarding-form"), "setup-earned-badge").length ===
        0;
  }
  function updateSettingsEarnedCount() {
    const count = $("#settings-earned-count"),
      picker = $("#settings-badge-picker");
    if (count && picker)
      count.textContent = `${selectedBadgeIds(picker, "settings-earned-badge").length} selected`;
  }
  function dateTarget(days) {
    return data.profile?.startDate
      ? addDays(data.profile.startDate, days - 1)
      : "—";
  }
  function statusClass(p) {
    return p.complete ? "complete" : p.value ? "progressing" : "start";
  }
  function badgeCard(badge) {
    const p = badgeProgress(badge),
      percentage = Math.round((p.value / p.target) * 100),
      label = p.earned
        ? "Already earned"
        : p.complete
          ? "Completed"
          : p.value
            ? "In progress"
            : "Not started";
    return `<button class="badge-card" data-badge="${badge.id}" aria-label="Open ${badge.name} details"><div class="badge-top"><span class="badge-icon" aria-hidden="true"><i class="fa-solid ${p.complete ? "fa-trophy" : "fa-medal"}"></i></span><div><h3>${badge.name}</h3><p>${badge.description}</p></div></div><div class="badge-meta"><span>${p.earned ? '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Already earned' : `${p.value} / ${p.target}${badge.type === "streak" ? " days" : badge.type.includes("weekly") ? " weeks" : ""}`}</span><span class="pill ${statusClass(p)}">${label}</span></div><div class="progress ${p.complete ? "green" : ""}"><span style="width:${percentage}%"></span></div></button>`;
  }
  function activityChecklist(key, compact = false) {
    const a = getActivity(key);
    return `<div class="today-list">${DAILY_KEYS.map((k) => `<label class="activity-row"><input type="checkbox" data-activity="${k}" data-date="${key}" ${a[k] ? "checked" : ""}><span>${compact ? ACTIVITY_META[k][1] : ACTIVITY_META[k][0]}</span>${compact ? "" : `<small>${a[k] ? "Done" : "Pending"}</small>`}</label>`).join("")}</div>`;
  }
  function riskNotices() {
    const result = [];
    ["visit", "comment", "like"].forEach((k) => {
      const s = streakInfo(k);
      if (s.current > 0 && !getActivity(todayKey())[k])
        result.push(
          `<div class="notice"><strong>Your ${s.current}-day ${k} streak is at risk.</strong>Complete today’s ${k === "visit" ? "visit" : k === "comment" ? "comment" : "like"} to keep it alive.</div>`,
        );
    });
    return result.join("");
  }
  function milestoneRows() {
    return ["visit", "comment", "like"]
      .map((k) => {
        const s = streakInfo(k).current;
        let target = s < 7 ? 7 : s < 30 ? 30 : 90;
        const remaining = Math.max(target - s, 0);
        return `<div class="milestone-row"><b>${k[0].toUpperCase() + k.slice(1)}</b><div class="progress green"><span style="width:${Math.min(100, (s / target) * 100)}%"></span></div><small>${remaining ? `${remaining} more → ${target}-Day Badge` : `${target}-Day Badge complete`}</small></div>`;
      })
      .join("");
  }
  function renderDashboard() {
    const overall = allProgress(),
      daily = Math.max(
        ...["visit", "comment", "like"].map((k) => streakInfo(k).current),
      );
    const longest = Math.max(
      ...["visit", "comment", "like"].map((k) => streakInfo(k).longest),
    );
    const percent = ((overall.complete / 21) * 100).toFixed(1);
    const quick = overall.entries.filter((x) => x.badge.tier === "quick"),
      consistency = overall.entries.filter(
        (x) => x.badge.tier === "consistency",
      );
    const startDays = Math.max(
      1,
      diffDays(data.profile.startDate, todayKey()) + 1,
    );
    const today = getActivity(todayKey()),
      done = DAILY_KEYS.filter((k) => today[k]).length;
    $("#view-dashboard").innerHTML =
      `<section class="grid grid-4"><article class="card hero-card" style="grid-column:span 2"><p class="eyebrow">Welcome back, ${escapeHtml(data.profile.fullName.split(" ")[0])}</p><h2>${overall.complete} / 21 badges</h2><p class="subtle">Make each activity count toward your next badge.</p><div class="hero-progress"><span class="score">${percent}% complete</span><div class="progress"><span style="width:${percent}%"></span></div></div></article><article class="card metric-card"><p>Current daily streak</p><div class="metric">${daily} <small>days</small></div><p>Across visits, comments & likes</p></article><article class="card metric-card"><p>Days tracking</p><div class="metric">${startDays}</div><p>Started ${formatDate(data.profile.startDate, { month: "short", day: "numeric" })}</p></article></section>${weeklyTodo()}<section class="grid grid-2"><article class="card"><div class="section-heading"><div><p class="eyebrow">Today</p><h2>${formatDate(todayKey())}</h2></div><span class="pill ${done === 5 ? "complete" : "progressing"}">${done}/5 complete</span></div>${activityChecklist(todayKey(), true)}<div class="progress green" style="margin-top:1rem"><span style="width:${(done / 5) * 100}%"></span></div><button id="routine-complete" class="button button-secondary full" ${done === 5 ? "disabled" : ""}>${done === 5 ? "Today’s routine is complete" : "Mark today’s routine complete"}</button></article><article class="card"><p class="eyebrow">What should I do today?</p><h2>Keep your momentum</h2><ul class="detail-list"><li>Visit Builder Center and read one article.</li><li>Leave one meaningful comment and like useful content.</li><li>${weeklyTodayLine("wishVote")}</li><li>${weeklyTodayLine("articles")}</li></ul>${done === 5 ? '<div class="notice"><strong>Today’s routine is complete.</strong>Keep your streak alive tomorrow.</div>' : riskNotices()}</article></section><section><div class="section-heading"><div><p class="eyebrow">Next milestone</p><h2>Build your consistency</h2></div></div><article class="card">${milestoneRows()}</article></section><section><div class="section-heading"><div><p class="eyebrow">Your Builder Journey</p><h2>Progress at a glance</h2></div></div><div class="grid grid-3"><article class="card metric-card"><p>Quick Wins</p><div class="metric">${quick.filter((x) => x.complete).length} / ${quick.length}</div><p>Build your early foundation</p></article><article class="card metric-card"><p>Consistency</p><div class="metric">${consistency.filter((x) => x.complete).length} / ${consistency.length}</div><p>Keep the habits going</p></article><article class="card metric-card"><p>Longest daily streak</p><div class="metric">${longest} days</div><p>Your personal best</p></article></div></section><section><div class="section-heading"><div><p class="eyebrow">Charts</p><h2>Your progress in detail</h2></div></div><div class="grid grid-2" id="dashboard-charts"></div></section><section><div class="section-heading"><div><p class="eyebrow">Badge progress</p><h2>Continue your journey</h2></div><button class="button button-secondary" data-go="badges">View all badges</button></div><div class="badges-grid">${
        overall.entries
          .filter((x) => !x.complete)
          .slice(0, 3)
          .map((x) => badgeCard(x.badge))
          .join("") ||
        '<div class="card"><strong>All badges completed!</strong><p class="subtle">An outstanding Builder Center journey.</p></div>'
      }</div></section>${studentRewards()}`;
    renderCharts();
  }
  function studentRewards() {
    return `<section><div class="section-heading"><div><p class="eyebrow">Informational only</p><h2>Student Rewards</h2></div></div><article class="card"><p class="subtle">Rewards and eligibility may change. Check AWS Builder Center for the current official terms. This tracker cannot verify eligibility.</p><div class="reward-grid"><div class="reward"><strong>7 badges</strong>$10 credits</div><div class="reward"><strong>14 badges</strong>Additional $20 credits</div><div class="reward"><strong>21 badges</strong>$100 Certification Voucher<br>+ 12 months Skill Builder Premium</div></div><div class="link-list"><a href="https://builder.aws.com/" target="_blank" rel="noopener">AWS Builder Center</a><a href="https://builder.aws.com/profile" target="_blank" rel="noopener">Profile / Badges</a><a href="https://builder.aws.com/" target="_blank" rel="noopener">AWS Student Rewards</a></div></article></section>`;
  }
  function renderDaily() {
    const s = ["visit", "comment", "like"];
    $("#view-daily").innerHTML =
      `<section class="daily-layout"><article class="card"><p class="eyebrow">Daily activity tracker</p><h2>Record a day</h2><label class="date-picker">Date<input id="daily-date" type="date" value="${selectedDate}" max=""></label><div id="daily-checklist">${activityChecklist(selectedDate)}</div></article><div class="grid"><article class="card"><p class="eyebrow">Streak calculation</p><h2>Daily consistency</h2><div class="streak-table">${s
        .map((k) => {
          const x = streakInfo(k);
          return `<div class="streak-line"><strong>${k[0].toUpperCase() + k.slice(1)}</strong><span>Current ${x.current} · Longest ${x.longest}</span><span class="pill ${x.current ? "progressing" : "start"}">${x.current} days</span></div>`;
        })
        .join(
          "",
        )}</div></article><article class="card"><p class="eyebrow">Start-date targets</p><h2>Your original targets</h2><div class="weekly-list"><div class="week-row"><span>7-Day Badge Target</span><strong>${formatDate(dateTarget(7))}</strong></div><div class="week-row"><span>30-Day Badge Target</span><strong>${formatDate(dateTarget(30))}</strong></div><div class="week-row"><span>90-Day Badge Target</span><strong>${formatDate(dateTarget(90))}</strong></div></div><div class="notice"><strong>Badge status and streak history are separate.</strong>Already-earned badges stay completed. Your current streak uses only activity dates you record here—starting with today unless you manually add earlier dates.</div><p class="subtle">Missing a day breaks a streak; the app retains your history and tracks your new consecutive run.</p></article></div></section>`;
  }
  function renderCalendar() {
    const year = calendarCursor.getFullYear(),
      month = calendarCursor.getMonth();
    const first = new Date(year, month, 1),
      days = new Date(year, month + 1, 0).getDate(),
      offset = (first.getDay() + 6) % 7,
      weekCount = Math.ceil((offset + days) / 7);
    let cells = "";
    for (let i = 0; i < offset; i++)
      cells += '<div class="calendar-day empty"></div>';
    for (let day = 1; day <= days; day++) {
      const k = dateKey(new Date(year, month, day)),
        a = getActivity(k),
        count = DAILY_KEYS.filter((x) => a[x]).length;
      const isToday = k === todayKey(),
        isSelected = k === selectedDate,
        isComplete = count === 5,
        classes = [
          "calendar-day",
          isToday ? "today" : "",
          isSelected ? "selected" : "",
          isComplete ? "full" : count ? "partial" : "",
        ]
          .filter(Boolean)
          .join(" "),
        marker = isComplete
          ? '<span class="day-complete-icon" aria-hidden="true"><i class="fa-solid fa-check"></i></span>'
          : count
            ? `<span class="dots"><i class="fa-solid fa-circle" aria-hidden="true"></i> ${count}</span>`
            : "";
      cells += `<button class="${classes}" data-calendar-date="${k}" aria-label="${formatDate(k)}: ${count} activities" aria-pressed="${isSelected}"><span class="date-num">${day}</span>${marker}</button>`;
    }
    $("#view-calendar").innerHTML =
      `<section class="grid grid-2"><article class="card calendar-card"><div class="calendar-controls"><button class="icon-button" data-cal-shift="-1" aria-label="Previous month"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button><h2>${new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(first)}</h2><button class="icon-button" data-cal-shift="1" aria-label="Next month"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button></div><div class="calendar-weekdays">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((x) => `<div>${x}</div>`).join("")}</div><div class="calendar-grid" style="--calendar-weeks:${weekCount}">${cells}</div><footer class="calendar-footer"><div class="calendar-key"><span><i class="fa-solid fa-circle" aria-hidden="true"></i> Some activity</span><span><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Full routine</span></div><p class="subtle">Select any past or future date to edit its activities.</p></footer></article><article class="card"><p class="eyebrow">Selected date</p><h2>${formatDate(selectedDate)}</h2>${activityChecklist(selectedDate)}</article></section>`;
  }
  function renderBadges() {
    const filterOptions = [
      ["all", "All"],
      ["completed", "Completed"],
      ["progress", "In Progress"],
      ["not-started", "Not Started"],
      ["quick", "Quick Wins"],
      ["consistency", "Consistency"],
      ["7", "7 Day"],
      ["30", "30 Day"],
      ["90", "90 Day"],
    ];
    $("#view-badges").innerHTML =
      `<section class="card"><div class="section-heading"><div><p class="eyebrow">All 21 badges</p><h2>Find your next win</h2></div><span class="score">${allProgress().complete} completed</span></div><div class="badge-controls"><input id="badge-search" type="search" placeholder="Search badges..." aria-label="Search badges"><select id="badge-filter" aria-label="Filter badges">${filterOptions.map(([v, l]) => `<option value="${v}">${l}</option>`).join("")}</select></div><div id="badges-grid" class="badges-grid">${BADGES.map(badgeCard).join("")}</div></section>`;
  }
  function renderWeekly() {
    const thisWeek = weekKey(todayKey());
    // Four Monday–Sunday weeks that start where the running streak started (or this week).
    function rows(type) {
      const info = weeklyStreak(type),
        entries = weeklyEntries(type),
        first = info.runStart || thisWeek;
      return [0, 1, 2, 3]
        .map((index) => {
          const week = addDays(first, 7 * index),
            weekEnd = addDays(week, 6),
            inWeek = entries.filter((e) => weekKey(e.date) === week),
            done = inWeek.length > 0;
          let state, label, hint = "";
          if (done) {
            state = "done";
            label =
              '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Completed';
          } else if (week === thisWeek) {
            state = "current";
            label = `<i class="fa-solid fa-hourglass-half" aria-hidden="true"></i> Due by ${fmtDay(weekEnd)}`;
          } else if (week > thisWeek) {
            state = "upcoming";
            label =
              '<i class="fa-regular fa-circle" aria-hidden="true"></i> Upcoming';
            const before = entries
              .filter((e) => weekKey(e.date) === addDays(week, -7))
              .map((e) => e.date)
              .sort()
              .pop();
            if (before) {
              const w = nextWindow(before);
              hint = `Recommended: ${fmtRange(w.start, w.end)}`;
            }
          } else {
            state = "missed";
            label =
              '<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> Missed';
          }
          const logged = inWeek
            .map(
              (e) =>
                `<small class="week-entry">${fmtDay(e.date)} · ${escapeHtml(e.label)}</small>`,
            )
            .join("");
          return `<div class="week-row ${state}"><span class="week-info"><strong>Week ${index + 1}</strong><small>${formatDate(week, { month: "short", day: "numeric" })} – ${formatDate(weekEnd, { month: "short", day: "numeric" })}</small>${logged}${hint ? `<small class="week-hint">${hint}</small>` : ""}</span><strong>${label}</strong></div>`;
        })
        .join("");
    }
    function goalCard(type, eyebrow, title, intro, rule) {
      const plan = weeklyPlan(type),
        msg = planMessage(type, plan),
        info = weeklyStreak(type),
        goal = WEEKLY_GOALS[type],
        action = plan.status === "done" ? "" : weeklyActionButton(type);
      return `<article class="card weekly-goal-card"><p class="eyebrow"><i class="fa-solid ${goal.icon}" aria-hidden="true"></i> ${eyebrow}</p><h2>${title}</h2><p class="subtle">${intro}</p><div class="weekly-status ${msg.tone}"><span class="pill ${msg.tone}">${msg.pill}</span><p>${msg.text}</p></div>${type === "articles" ? '<button class="button button-secondary weekly-card-action" data-weekly-action="articles"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add published article</button>' : action}<div class="weekly-list">${rows(type)}</div><div class="notice"><strong>Current: ${info.current} ${info.current === 1 ? "week" : "weeks"} · Longest: ${info.longest} ${info.longest === 1 ? "week" : "weeks"}${info.current > 4 ? " · Goal reached" : ""}</strong>${rule}</div></article>`;
    }
    $("#view-weekly").innerHTML =
      `<section class="grid grid-2">${goalCard("wishVote", "Wish voting", "4-Week Wish Vote Streak", "Record a Wish vote on its actual date in the Daily Tracker, or log today’s vote here.", "One vote in each Monday–Sunday week counts.")}${goalCard("articles", "Article publishing", "4-Week Article Streak", "Add one article at a time using its actual published date.", "One article in each Monday–Sunday week counts.")}</section>`;
  }
  function weeklyActionButton(type) {
    const goal = WEEKLY_GOALS[type];
    return `<button class="button ${type === "articles" ? "button-primary" : "button-secondary"} weekly-card-action" data-weekly-action="${type}"><i class="fa-solid ${goal.actionIcon}" aria-hidden="true"></i> ${goal.action}</button>`;
  }
  // Dashboard to-do: shows each weekly goal and lights up on the day it is due.
  function weeklyTodo() {
    const cards = ["articles", "wishVote"]
      .map((type) => {
        const plan = weeklyPlan(type),
          msg = planMessage(type, plan),
          goal = WEEKLY_GOALS[type];
        return `<article class="card todo-card ${msg.tone}"><div class="todo-head"><span class="todo-icon" aria-hidden="true"><i class="fa-solid ${goal.icon}"></i></span><div><h3>${goal.title}</h3><span class="pill ${msg.tone}">${msg.pill}</span></div></div><p class="subtle">${msg.text}</p>${plan.status === "done" ? "" : weeklyActionButton(type)}</article>`;
      })
      .join("");
    return `<section class="weekly-todo"><div class="section-heading"><div><p class="eyebrow">Weekly goals</p><h2>This week’s to-do</h2></div><button class="button button-secondary" data-go="weekly">View weekly goals</button></div><div class="grid grid-2">${cards}</div></section>`;
  }
  function weeklyTodayLine(type) {
    const plan = weeklyPlan(type),
      article = type === "articles";
    if (plan.status === "done")
      return article
        ? "Weekly article is logged this week."
        : "Weekly Wish vote is logged this week.";
    if (plan.status === "soon")
      return `${article ? "Publish your next article" : "Vote on a Wish"} around ${fmtRange(plan.window.start, plan.window.end)}.`;
    return article
      ? plan.status === "due" && plan.inWindow
        ? "Publish your weekly article today."
        : `Publish an article by ${fmtDay(plan.weekEnd)} to keep your weekly streak.`
      : plan.status === "due" && plan.inWindow
        ? "Vote on a Wish today for your weekly streak."
        : `Vote on a Wish by ${fmtDay(plan.weekEnd)} to keep your weekly streak.`;
  }
  // ---- Interactive donut charts (plain SVG, no library) ----
  const chartState = {
    badge: { tab: "all", pinned: null },
    activity: { tab: 30, pinned: null },
  };
  const chartModels = {};
  const STATUS_COLORS = {
    complete: "#16794c",
    progress: "#ff9900",
    start: "#c5cfd8",
  };
  const ACTIVITY_COLORS = {
    visit: "#2469a0",
    read: "#0f8b8d",
    comment: "#16794c",
    like: "#d9480f",
    wishVote: "#7b4bb7",
  };
  function badgeChartModel() {
    const tab = chartState.badge.tab,
      tabs = [
        ["all", "All 21"],
        ["quick", "Quick Wins"],
        ["consistency", "Consistency"],
        ["7", "7-Day"],
        ["30", "30-Day"],
        ["90", "90-Day"],
      ],
      entries = allProgress().entries.filter(({ badge }) =>
        tab === "all"
          ? true
          : tab === "quick" || tab === "consistency"
            ? badge.tier === tab
            : badge.type === "streak" && badge.target === Number(tab),
      );
    const list = (items) =>
      items.length
        ? `<ul class="chart-items">${items.join("")}</ul>`
        : '<p class="subtle">Nothing here yet.</p>';
    const unit = (b) => (b.type === "streak" ? "days" : b.type.includes("eekly") ? "weeks" : "");
    const item = (x, text) =>
      `<li><span>${x.badge.name}</span><small>${text}</small></li>`;
    let slices, centerValue, centerLabel, summary;
    if (/^\d+$/.test(tab)) {
      // Milestone tabs show how many of the required days have been reached per activity.
      const needed = Number(tab) * entries.length,
        reached = entries.reduce((n, x) => n + x.value, 0);
      slices = entries
        .filter((x) => x.value > 0)
        .map((x) => ({
          key: x.badge.id,
          label: x.badge.activity[0].toUpperCase() + x.badge.activity.slice(1),
          value: x.value,
          color: ACTIVITY_COLORS[x.badge.activity],
          detail: `<h4>${x.badge.name}</h4><p>${x.earned ? "Already earned" : `${x.value} of ${x.target} days${x.complete ? " · Completed" : ""}`}</p><div class="progress ${x.complete ? "green" : ""}"><span style="width:${(x.value / x.target) * 100}%"></span></div>`,
        }));
      slices.push({
        key: "remaining",
        label: "Still to go",
        value: needed - reached,
        color: STATUS_COLORS.start,
        detail: `<h4>Still to go</h4><p>${needed - reached} of ${needed} streak days left across the three ${tab}-day badges.</p>`,
      });
      centerValue = `${Math.round((reached / needed) * 100)}%`;
      centerLabel = `of ${tab}-day goals`;
      summary = `${entries.filter((x) => x.complete).length} of ${entries.length} ${tab}-day badges completed. Each colored slice is the longest streak reached for that activity.`;
    } else {
      const groups = {
        complete: entries.filter((x) => x.complete),
        progress: entries.filter((x) => !x.complete && x.value > 0),
        start: entries.filter((x) => !x.complete && !x.value),
      };
      const names = {
        complete: "Completed",
        progress: "In progress",
        start: "Not started",
      };
      slices = Object.keys(groups)
        .filter((k) => groups[k].length)
        .map((k) => ({
          key: k,
          label: names[k],
          value: groups[k].length,
          color: STATUS_COLORS[k],
          detail: `<h4>${names[k]} · ${groups[k].length}</h4>${list(
            groups[k].map((x) =>
              item(
                x,
                k === "complete"
                  ? x.earned
                    ? "Earned"
                    : "Done"
                  : `${x.value} / ${x.target} ${unit(x.badge)}`.trim(),
              ),
            ),
          )}`,
        }));
      centerValue = `${groups.complete.length}/${entries.length}`;
      centerLabel = "badges completed";
      summary = `${Math.round((groups.complete.length / entries.length) * 100)}% of these badges are complete.`;
    }
    return {
      id: "badge",
      eyebrow: "Badge progress",
      title: "Where your badges stand",
      tabs,
      tab,
      slices,
      centerValue,
      centerLabel,
      summary,
    };
  }
  function activityChartModel() {
    const range = chartState.activity.tab,
      today = todayKey(),
      recorded = Object.keys(data.activities).sort(),
      trackedFrom =
        recorded.length && recorded[0] < data.profile.startDate
          ? recorded[0]
          : data.profile.startDate,
      windowStart = addDays(today, -(range - 1)),
      from = [trackedFrom, windowStart, today].sort()[1],
      days = Math.max(1, diffDays(from, today) + 1),
      counts = Object.fromEntries(DAILY_KEYS.map((k) => [k, 0]));
    let fullDays = 0;
    for (let i = 0; i < days; i++) {
      const a = getActivity(addDays(from, i));
      let n = 0;
      DAILY_KEYS.forEach((k) => {
        if (a[k]) {
          counts[k]++;
          n++;
        }
      });
      if (n === DAILY_KEYS.length) fullDays++;
    }
    const possible = days * DAILY_KEYS.length,
      total = DAILY_KEYS.reduce((n, k) => n + counts[k], 0),
      slices = DAILY_KEYS.filter((k) => counts[k]).map((k) => ({
        key: k,
        label: ACTIVITY_META[k][0],
        value: counts[k],
        color: ACTIVITY_COLORS[k],
        detail: `<h4>${ACTIVITY_META[k][0]}</h4><p>${counts[k]} of ${days} days (${Math.round((counts[k] / days) * 100)}%)</p><div class="progress green"><span style="width:${(counts[k] / days) * 100}%"></span></div>`,
      }));
    slices.push({
      key: "missed",
      label: "Not logged",
      value: possible - total,
      color: STATUS_COLORS.start,
      detail: `<h4>Not logged</h4><p>${possible - total} of ${possible} possible check-ins were left open.</p>`,
    });
    return {
      id: "activity",
      eyebrow: "Daily activity",
      title: "What you logged",
      tabs: [
        [7, "7 days"],
        [30, "30 days"],
        [90, "90 days"],
      ],
      tab: range,
      slices,
      centerValue: `${Math.round((total / possible) * 100)}%`,
      centerLabel: "logged",
      summary: `${total} of ${possible} check-ins across ${days} ${days === 1 ? "day" : "days"} · ${fullDays} full-routine ${fullDays === 1 ? "day" : "days"}.`,
    };
  }
  function chartHtml(m) {
    m.slices = m.slices.filter((s) => s.value > 0);
    chartModels[m.id] = m;
    const R = 48,
      C = 2 * Math.PI * R,
      total = m.slices.reduce((n, s) => n + s.value, 0);
    let offset = 0;
    const rings = m.slices
      .filter((s) => s.value > 0)
      .map((s) => {
        const len = (s.value / total) * C,
          ring = `<circle class="donut-slice" data-chart-slice="${s.key}" data-chart="${m.id}" cx="60" cy="60" r="${R}" fill="none" stroke="${s.color}" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-offset}" tabindex="0" role="button" aria-label="${s.label}: ${s.value} of ${total} (${Math.round((s.value / total) * 100)}%)"></circle>`;
        offset += len;
        return ring;
      })
      .join("");
    const legend = m.slices
      .map(
        (s) =>
          `<button type="button" class="legend-item" data-chart-slice="${s.key}" data-chart="${m.id}"><i style="background:${s.color}" aria-hidden="true"></i><span>${s.label}</span><strong>${s.value}</strong></button>`,
      )
      .join("");
    const tabs = m.tabs
      .map(
        ([value, label]) =>
          `<button type="button" class="chart-tab" data-chart-tab="${value}" data-chart="${m.id}" aria-pressed="${String(value) === String(m.tab)}">${label}</button>`,
      )
      .join("");
    return `<article class="card chart-card" id="chart-${m.id}"><p class="eyebrow">${m.eyebrow}</p><h2>${m.title}</h2><div class="chart-tabs" role="group" aria-label="${m.title} range">${tabs}</div><div class="chart-body"><div class="donut-wrap"><svg class="donut" viewBox="0 0 120 120" role="group" aria-label="${m.title}"><circle cx="60" cy="60" r="${R}" fill="none" stroke="#eef1f4" stroke-width="16"></circle>${rings}</svg><div class="donut-center" aria-hidden="true"><strong class="donut-center-value">${m.centerValue}</strong><small class="donut-center-label">${m.centerLabel}</small></div></div><div class="chart-legend">${legend}</div></div><p class="subtle chart-summary">${m.summary}</p><div class="chart-detail" aria-live="polite"></div></article>`;
  }
  function renderCharts() {
    const host = $("#dashboard-charts");
    if (!host) return;
    host.innerHTML = chartHtml(badgeChartModel()) + chartHtml(activityChartModel());
    Object.keys(chartState).forEach((id) => showSlice(id, chartState[id].pinned));
  }
  // Updates the donut centre and detail panel for a hovered, focused, or pinned slice.
  function showSlice(id, key) {
    const m = chartModels[id],
      root = $(`#chart-${id}`);
    if (!m || !root) return;
    const s = m.slices.find((x) => x.key === key),
      total = m.slices.reduce((n, x) => n + x.value, 0);
    root.classList.toggle("has-active", Boolean(s));
    $$("[data-chart-slice]", root).forEach((el) =>
      el.classList.toggle("active", el.dataset.chartSlice === key && Boolean(s)),
    );
    $(".donut-center-value", root).textContent = s
      ? `${Math.round((s.value / total) * 100)}%`
      : m.centerValue;
    $(".donut-center-label", root).textContent = s ? s.label : m.centerLabel;
    $(".chart-detail", root).innerHTML = s
      ? s.detail
      : '<p class="subtle">Hover, tap, or focus a slice for details.</p>';
  }
  function creatorProfileSection() {
    return `<section class="creator-section card" aria-labelledby="creator-title"><div class="creator-profile-layout"><img class="creator-profile-photo" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjETkyahNf4nfo5HgkZ-Nb4FAyla5TAIE6kxHYRoOWIS_-qF7zJdVItQCYtIkHuxtufjyIMqYWImLfNgKmlIsYDe0Zskn6YrkMq4r3655z5XQtZW9iAefN77LyiKXQgdIb_KfR4Jt9fVbCI5eP4QDWtnfTxYIbT7BkKyHTbC6mriAaM3UbcROMxNFSdXvtz/s875/photo.png" alt="Sugam Ghale" draggable="false" referrerpolicy="no-referrer"><div><p class="eyebrow">Created by</p><h2 id="creator-title">Sugam Ghale</h2><p class="creator-role">Student Builder Group Leader</p><p class="subtle">Building, learning, and sharing with the AWS community.</p><div class="creator-social-links"><a class="creator-social-link" href="https://builder.aws.com/community/@sugamghale" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-aws" aria-hidden="true"></i> AWS Builder Center <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a><a class="creator-social-link" href="https://www.linkedin.com/in/sugamghale/" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-linkedin" aria-hidden="true"></i> LinkedIn <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a><a class="creator-social-link" href="https://github.com/sugamghale" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github" aria-hidden="true"></i> GitHub <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a></div></div></div></section>`;
  }
  function renderProfile() {
    const p = data.profile;
    $("#view-profile").innerHTML =
      `<section class="grid grid-2"><article class="card"><p class="eyebrow">Profile</p><h2>${escapeHtml(p.fullName)}</h2><dl class="profile-summary"><div><dt>Builder ID</dt><dd>${escapeHtml(p.builderId)}</dd></div><div><dt>Starting date</dt><dd>${formatDate(p.startDate)}</dd></div><div><dt>Storage</dt><dd>Only this browser</dd></div></dl><button id="profile-settings" class="button button-primary" style="margin-top:1rem">Edit profile & settings</button></article><article class="card"><p class="eyebrow">Your data</p><h2>Backup your progress</h2><p class="subtle">Your activities, profile, already-earned badges, and progress are private and persist through browser restarts.</p><button id="profile-export" class="button button-secondary" style="margin-top:1rem">Download backup</button></article></section>${creatorProfileSection()}${studentRewards()}`;
  }
  function render() {
    if (!isReady()) {
      $("#onboarding").hidden = false;
      $("#app").hidden = true;
      return;
    }
    $("#onboarding").hidden = true;
    $("#app").hidden = false;
    const renderers = {
      dashboard: renderDashboard,
      daily: renderDaily,
      calendar: renderCalendar,
      badges: renderBadges,
      weekly: renderWeekly,
      profile: renderProfile,
    };
    renderers[view]();
    $$(".view").forEach((el) =>
      el.classList.toggle("active", el.dataset.viewPanel === view),
    );
    $$(".nav-link").forEach((el) =>
      el.classList.toggle("active", el.dataset.view === view),
    );
    $("#view-title").textContent = {
      dashboard: "Your builder journey",
      daily: "Daily Activity Tracker",
      calendar: "Activity calendar",
      badges: "Badge collection",
      weekly: "Weekly goals",
      profile: "Profile & settings",
    }[view];
  }
  function escapeHtml(v) {
    const e = document.createElement("div");
    e.textContent = v || "";
    return e.innerHTML;
  }
  function setActivity(date, key, checked) {
    const a = getActivity(date);
    a[key] = checked;
    data.activities[date] = a;
    save();
    updateBadges();
    render();
  }
  function openBadge(id) {
    const b = BADGES.find((x) => x.id === id),
      p = badgeProgress(b);
    let control = "";
    if (b.type === "toggle")
      control = `<label class="activity-row"><input type="checkbox" data-toggle-badge="${b.key}" ${data.counts[b.key] ? "checked" : ""}><span>Mark requirement completed</span></label>`;
    if (b.type === "count")
      control = `<label>Progress count<input data-count-badge="${b.key}" type="number" min="0" value="${data.counts[b.key] || 0}"></label>`;
    if (b.type === "articles" || b.type === "likesList")
      control = recordManager(b.list || "articles", b);
    if (b.id === "contributor") control = recordManager("comments", b);
    const earned = data.badges[b.id]?.earned;
    $("#badge-dialog-content").innerHTML =
      `<div class="modal-heading"><div><p class="eyebrow">${b.tier === "quick" ? "Quick Win" : "Consistency"}</p><h2>${b.name}</h2></div><button class="icon-button" data-close-badge aria-label="Close badge details"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div><p>${b.description}</p><div class="card" style="margin:1rem 0"><strong>${earned ? '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Already earned' : p.complete ? '<i class="fa-solid fa-trophy" aria-hidden="true"></i> Completed' : `${p.value} / ${p.target} progress`}</strong><div class="progress ${p.complete ? "green" : ""}" style="margin-top:.55rem"><span style="width:${(p.value / p.target) * 100}%"></span></div>${p.date ? `<p class="subtle">Completed: ${formatDate(p.date)}</p>` : ""}</div>${control}<hr><label class="activity-row"><input type="checkbox" data-earned-badge="${b.id}" ${earned ? "checked" : ""}><span>Already earned</span><small>Skip manual tracking</small></label>${earned ? `<label>Completion date (optional)<input data-earned-date="${b.id}" type="date" value="${data.badges[b.id].date || ""}"></label>` : ""}<div class="modal-actions"><button class="button button-secondary" data-close-badge>Done <i class="fa-solid fa-check" aria-hidden="true"></i></button></div>`;
    const dialog = $("#badge-dialog");
    if (!dialog.open) dialog.showModal();
  }
  function recordManager(list, badge) {
    const entries = data[list] || [],
      isArticle = list === "articles";
    return `<div><h3>${isArticle ? '<i class="fa-solid fa-heart" aria-hidden="true"></i> Article likes' : '<i class="fa-solid fa-comment" aria-hidden="true"></i> Comments'}</h3><p class="subtle">${isArticle ? "Add an article title and its received likes. Articles with 10+ likes count toward Valued Creator." : "Only entries with 10+ likes count."}</p><div class="record-list">${entries.map((x, i) => `<div class="record-row"><input data-record-name="${list}" data-index="${i}" value="${escapeHtml(x.name)}" placeholder="${isArticle ? "Article title" : "Comment label"}" aria-label="${list} name"><input data-record-likes="${list}" data-index="${i}" type="number" min="0" value="${x.likes}" aria-label="Likes"><button data-delete-record="${list}" data-index="${i}" class="button button-secondary" aria-label="Delete ${x.name || "entry"}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>`).join("")}</div><button class="button button-secondary" style="margin-top:1rem" data-add-record="${list}"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add ${isArticle ? "article" : "comment"}</button></div>`;
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      }),
      a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `aws-builder-badge-tracker-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("Backup downloaded.");
  }
  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const incoming = JSON.parse(reader.result);
        if (!incoming || typeof incoming !== "object" || !incoming.profile)
          throw new Error();
        data = {
          ...defaultData(),
          ...incoming,
          counts: { ...defaultData().counts, ...incoming.counts },
        };
        save();
        render();
        showToast("Backup restored successfully.");
      } catch {
        showToast("That file is not a valid tracker backup.");
      }
    };
    reader.readAsText(file);
  }
  function openSettings() {
    const f = $("#settings-form");
    f.fullName.value = data.profile.fullName;
    f.builderId.value = data.profile.builderId;
    f.startDate.value = data.profile.startDate;
    renderBadgePicker(
      $("#settings-badge-picker"),
      "settings-earned-badge",
      true,
    );
    updateSettingsEarnedCount();
    $("#settings-dialog").showModal();
  }
  function filterBadges() {
    const q = $("#badge-search")?.value.toLowerCase() || "",
      filter = $("#badge-filter")?.value || "all";
    $$(".badge-card", $("#badges-grid")).forEach((el) => {
      const b = BADGES.find((x) => x.id === el.dataset.badge),
        p = badgeProgress(b);
      let match = !q || `${b.name} ${b.description}`.toLowerCase().includes(q);
      if (filter === "completed") match &&= p.complete;
      else if (filter === "progress") match &&= !p.complete && p.value > 0;
      else if (filter === "not-started") match &&= !p.complete && !p.value;
      else if (filter === "quick" || filter === "consistency")
        match &&= b.tier === filter;
      else if (["7", "30", "90"].includes(filter))
        match &&= b.name.startsWith(filter + "-");
      el.hidden = !match;
    });
  }
  // Event delegation keeps cards, dynamic pages, dialogs, and forms lightweight.
  document.addEventListener("click", (e) => {
    const target = e.target.closest(
      "[data-view],[data-go],[data-badge],[data-calendar-date],[data-cal-shift],#routine-complete,#mobile-menu,#header-settings,#profile-settings,#profile-export,#export-data,#reset-data,#confirm-reset,[data-close-badge],[data-toggle-badge],[data-add-record],[data-delete-record],#add-article-weekly,[data-weekly-action],[data-chart-tab],[data-chart-slice]",
    );
    if (!target) return;
    if (target.dataset.chartTab !== undefined) {
      const id = target.dataset.chart;
      chartState[id].tab = id === "activity" ? Number(target.dataset.chartTab) : target.dataset.chartTab;
      chartState[id].pinned = null;
      renderCharts();
      return;
    }
    if (target.dataset.chartSlice !== undefined) {
      const state = chartState[target.dataset.chart];
      state.pinned = state.pinned === target.dataset.chartSlice ? null : target.dataset.chartSlice;
      showSlice(target.dataset.chart, state.pinned);
      return;
    }
    if (target.dataset.weeklyAction === "wishVote") {
      setActivity(todayKey(), "wishVote", true);
      showToast("Wish vote logged for today.");
      return;
    }
    if (target.dataset.view) {
      view = target.dataset.view;
      render();
      if (innerWidth < 951)
        $("#side-nav").closest(".sidebar").classList.remove("mobile-open");
      return;
    }
    if (target.dataset.go) {
      view = target.dataset.go;
      render();
      return;
    }
    if (target.id === "mobile-menu") {
      const side = $(".sidebar");
      side.classList.toggle("mobile-open");
      target.setAttribute(
        "aria-expanded",
        side.classList.contains("mobile-open"),
      );
      return;
    }
    if (target.id === "header-settings" || target.id === "profile-settings") {
      openSettings();
      return;
    }
    if (target.id === "profile-export" || target.id === "export-data") {
      exportData();
      return;
    }
    if (target.id === "reset-data") {
      $("#reset-dialog").showModal();
      return;
    }
    if (target.id === "confirm-reset") {
      localStorage.removeItem(STORAGE_KEY);
      data = defaultData();
      $("#settings-dialog").close();
      render();
      return;
    }
    if (target.dataset.badge) {
      openBadge(target.dataset.badge);
      return;
    }
    if (target.hasAttribute("data-close-badge")) {
      $("#badge-dialog").close();
      return;
    }
    if (target.dataset.calendarDate) {
      selectedDate = target.dataset.calendarDate;
      renderCalendar();
      return;
    }
    if (target.dataset.calShift) {
      calendarCursor.setMonth(
        calendarCursor.getMonth() + Number(target.dataset.calShift),
      );
      renderCalendar();
      return;
    }
    if (target.id === "routine-complete") {
      DAILY_KEYS.forEach((k) => {
        const a = getActivity(todayKey());
        a[k] = true;
        data.activities[todayKey()] = a;
      });
      save();
      updateBadges();
      render();
      return;
    }
    if (target.dataset.toggleBadge) {
      data.counts[target.dataset.toggleBadge] = target.checked;
      save();
      updateBadges();
      openBadge(BADGES.find((b) => b.key === target.dataset.toggleBadge).id);
      render();
      return;
    }
    if (target.dataset.addRecord) {
      const list = target.dataset.addRecord;
      data[list].push({ name: "", likes: 0 });
      save();
      openBadge(list === "articles" ? "creator" : "contributor");
      render();
      return;
    }
    if (target.dataset.deleteRecord) {
      data[target.dataset.deleteRecord].splice(Number(target.dataset.index), 1);
      save();
      updateBadges();
      openBadge(
        target.dataset.deleteRecord === "articles" ? "creator" : "contributor",
      );
      render();
      return;
    }
    if (target.id === "add-article-weekly" || target.dataset.weeklyAction === "articles") {
      const form = $("#weekly-article-form");
      form.reset();
      $('input[name="date"]', form).value = todayKey();
      $("#weekly-article-dialog").showModal();
      return;
    }
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.matches("[data-onboarding-earned]")) {
      updateSetupEarnedMessage();
      return;
    }
    if (t.matches("[data-settings-earned]")) {
      const option = t.closest(".badge-picker-option"),
        dateInput = option?.querySelector('input[type="date"]');
      if (dateInput) dateInput.disabled = !t.checked;
      const form = $("#settings-form");
      setEarnedBadges(
        selectedBadgeIds(form, "settings-earned-badge"),
        selectedBadgeDates(form, "settings-earned-badge"),
      );
      save();
      render();
      updateSettingsEarnedCount();
      return;
    }
    if (t.matches("[data-settings-earned-date]")) {
      const form = $("#settings-form");
      setEarnedBadges(
        selectedBadgeIds(form, "settings-earned-badge"),
        selectedBadgeDates(form, "settings-earned-badge"),
      );
      save();
      render();
      return;
    }
    if (t.matches("[data-activity]")) {
      setActivity(t.dataset.date, t.dataset.activity, t.checked);
      return;
    }
    if (t.id === "daily-date") {
      selectedDate = t.value || todayKey();
      renderDaily();
      return;
    }
    if (t.matches("[data-count-badge]")) {
      data.counts[t.dataset.countBadge] = Math.max(0, Number(t.value) || 0);
      save();
      updateBadges();
      render();
      showToast("Progress saved.");
      return;
    }
    if (t.matches("[data-earned-badge]")) {
      const id = t.dataset.earnedBadge;
      data.badges[id] = {
        ...(data.badges[id] || {}),
        earned: t.checked,
        date: data.badges[id]?.date || null,
      };
      if (!t.checked) delete data.badges[id].earned;
      save();
      updateBadges();
      openBadge(id);
      render();
      return;
    }
    if (t.matches("[data-earned-date]")) {
      data.badges[t.dataset.earnedDate].date = t.value || null;
      save();
      render();
      return;
    }
    if (
      t.matches("[data-record-name],[data-record-likes],[data-record-date]")
    ) {
      const list =
          t.dataset.recordName || t.dataset.recordLikes || t.dataset.recordDate,
        index = Number(t.dataset.index),
        item = data[list][index];
      if (t.matches("[data-record-name]")) item.name = t.value;
      if (t.matches("[data-record-likes]"))
        item.likes = Math.max(0, Number(t.value) || 0);
      if (t.matches("[data-record-date]")) item.date = t.value;
      save();
      updateBadges();
      render();
      return;
    }
    if (t.id === "import-data" && t.files[0]) {
      importData(t.files[0]);
      return;
    }
  });
  document.addEventListener("keydown", (e) => {
    const slice = e.target.closest?.("circle[data-chart-slice]");
    if (slice && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      slice.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
  });
  // Hover/focus previews a slice; leaving restores the pinned (clicked) slice.
  ["mouseover", "focusin"].forEach((type) =>
    document.addEventListener(type, (e) => {
      const slice = e.target.closest?.("[data-chart-slice]");
      if (slice) showSlice(slice.dataset.chart, slice.dataset.chartSlice);
    }),
  );
  ["mouseout", "focusout"].forEach((type) =>
    document.addEventListener(type, (e) => {
      const slice = e.target.closest?.("[data-chart-slice]");
      if (slice && !slice.contains(e.relatedTarget))
        showSlice(slice.dataset.chart, chartState[slice.dataset.chart].pinned);
    }),
  );
  document.addEventListener("input", (e) => {
    if (e.target.id === "badge-search") {
      filterBadges();
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.id === "badge-filter") filterBadges();
  });
  $("#weekly-article-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (e.submitter?.value === "cancel") {
      e.currentTarget.closest("dialog").close();
      return;
    }
    const form = e.currentTarget,
      values = new FormData(form),
      title = values.get("title").trim(),
      date = values.get("date");
    if (!title || !date) return;
    data.weeklyArticles.push({ title, date });
    save();
    $("#weekly-article-dialog").close();
    updateBadges();
    render();
    showToast("Weekly article saved.");
  });
  $("#onboarding-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.currentTarget,
      f = new FormData(form),
      earned = selectedBadgeIds(form, "setup-earned-badge");
    data.profile = {
      fullName: f.get("fullName").trim(),
      builderId: f.get("builderId").trim(),
      startDate: f.get("startDate"),
    };
    setEarnedBadges(earned);
    save();
    render();
    if (earned.length)
      showToast(
        `${earned.length} badges marked as already earned. Current streaks begin with activity you record.`,
      );
  });
  $("#settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (e.submitter?.value === "cancel") {
      e.currentTarget.closest("dialog").close();
      return;
    }
    const form = e.currentTarget,
      f = new FormData(form),
      earned = selectedBadgeIds(form, "settings-earned-badge"),
      dates = selectedBadgeDates(form, "settings-earned-badge");
    data.profile = {
      fullName: f.get("fullName").trim(),
      builderId: f.get("builderId").trim(),
      startDate: f.get("startDate"),
    };
    setEarnedBadges(earned, dates);
    save();
    $("#settings-dialog").close();
    render();
    showToast("Profile and completed badges saved.");
  });
  renderBadgePicker($("#setup-badge-picker"), "setup-earned-badge");
  $("#setup-date").value = todayKey();
  render();
})();
