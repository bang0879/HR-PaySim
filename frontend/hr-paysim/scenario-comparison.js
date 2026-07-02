const scenarioSummaries = {
  pay_inversion_correction:
    "현재 입력 기준으로는 보상 역전 정리가 비용만이 아니라 설명 가능성 회복과 실행 가능성의 균형이 가장 좋습니다.",
  salary_band_redesign:
    "급여 밴드 재설계는 구조 개선 효과가 크지만, 초기 전환 비용과 실행 난이도를 함께 관리해야 합니다.",
  payroll_cost_forecast:
    "Payroll 증가 예측은 burn 압박을 빠르게 보여주지만, 보상 설명 가능성 회복은 별도 조정안이 필요합니다.",
  ai_tooling_headcount_freeze:
    "AI tooling과 채용 유예 가정은 단기 burn을 낮출 수 있지만, junior pipeline과 senior 검토 부담을 반드시 봐야 합니다.",
  senior_orchestrator_premium:
    "Senior Orchestrator Premium은 숨은 예외 보상을 기준 있는 pool로 바꾸는 선택이지만, 대상 기준이 약하면 형평 리스크가 커집니다.",
};

const summary = document.querySelector("[data-selected-summary]");

document.querySelectorAll("[data-select-fit]").forEach((button) => {
  button.addEventListener("click", () => {
    const selectedId = button.dataset.selectFit;

    document.querySelectorAll(".comparison-column").forEach((column) => {
      column.classList.toggle("is-best-fit", column.dataset.scenarioId === selectedId);

      const badge = column.querySelector(".best-fit-badge");
      if (badge && column.dataset.scenarioId !== selectedId) {
        badge.remove();
      }

      if (column.dataset.scenarioId === selectedId && !column.querySelector(".best-fit-badge")) {
        const header = column.querySelector(".comparison-column-header");
        const marker = document.createElement("span");
        marker.className = "best-fit-badge";
        marker.textContent = "Best-fit 후보";
        header?.insertBefore(marker, header.querySelector("h2"));
      }
    });

    if (summary && selectedId && scenarioSummaries[selectedId]) {
      summary.textContent = scenarioSummaries[selectedId];
    }
  });
});
