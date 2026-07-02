const root = document.querySelector(".governance-snapshot");

root?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.tagName !== "BUTTON") return;

  const note = document.createElement("div");
  note.className = "snapshot-note";
  note.textContent =
    "다음 단계는 Scenario Builder입니다. 현재 Task 4에서는 스냅샷까지만 표시하고 시나리오 비교는 생성하지 않습니다.";
  root.append(note);
});
