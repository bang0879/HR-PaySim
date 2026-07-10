const bucketCopy = {
  "hire-exception": "신규 채용·예외 보상 기준이 강조되어 있습니다.",
  "implicit-band": "암묵적 보상 구간 기준이 강조되어 있습니다.",
  "tenured-review": "장기근속·초기멤버 보상 리뷰 기준이 강조되어 있습니다.",
  "data-needed": "추가 확인 필요 항목이 강조되어 있습니다.",
};

const bucketToSources = {
  "hire-exception": ["hire-exception"],
  "implicit-band": ["implicit-band"],
  "tenured-review": ["tenured-review"],
  "data-needed": ["hire-exception", "implicit-band", "tenured-review"],
};

const activeBucketCopy = document.querySelector("#activeBucketCopy");

function renderActiveBucket(bucket) {
  document.querySelectorAll("[data-bucket]").forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.bucket === bucket);
  });

  const activeSources = bucketToSources[bucket] ?? [];
  document.querySelectorAll("[data-source]").forEach((item) => {
    item.classList.toggle("is-highlighted", activeSources.includes(item.dataset.source));
  });

  activeBucketCopy.textContent = bucketCopy[bucket] ?? "보상 기준 후보를 선택하면 관련 보상 관계가 강조됩니다.";
}

function memoText() {
  const memo = document.querySelector("#memo-final");
  return memo?.innerText.trim().replace(/\n{3,}/g, "\n\n") ?? "";
}

async function copyMemo(button) {
  const text = memoText();
  button.textContent = "복사 준비됨";
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      button.textContent = "복사됨";
    }
  } catch {
    // File URLs may block clipboard access; the prototype still shows the intended action.
  }
}

function scrollToMemo() {
  const memo = document.querySelector("#memo-final");
  if (!memo) return;

  const top = memo.getBoundingClientRect().top + window.scrollY - 104;
  window.scrollTo({ top, behavior: "auto" });
}

function hydrateStaticIcons() {
  document.querySelectorAll("[data-icon]").forEach((target) => {
    const name = target.dataset.icon;
    target.innerHTML = icon(name);
  });
}

function icon(name) {
  const paths = {
    shield: '<path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"></path><path d="m8.5 12 2.2 2.2 4.8-5"></path>',
    chat: '<path d="M5 6h14v10H9l-4 4V6Z"></path><path d="M9 10h6M9 13h4"></path>',
  };
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.shield}</svg>`;
}

document.addEventListener("click", (event) => {
  const bucketCard = event.target.closest("[data-bucket]");
  if (bucketCard) {
    renderActiveBucket(bucketCard.dataset.bucket);
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  if (actionButton.dataset.action === "show-memo") {
    scrollToMemo();
    return;
  }

  if (actionButton.dataset.action === "copy-memo") {
    copyMemo(actionButton);
  }
});

hydrateStaticIcons();
renderActiveBucket("hire-exception");
