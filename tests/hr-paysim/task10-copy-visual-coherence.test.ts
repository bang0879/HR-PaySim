import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { FOUNDER_COPY } from "../../src/lib/hr-paysim/copy/founderCopy.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("preparation copy states the guided local Excel workflow and privacy boundary", () => {
  const copy = FOUNDER_COPY as Record<string, string>;

  assert.equal(copy["preparation.heading"], "이번 세션에 사용할 익명 자료를 먼저 확인합니다.");
  assert.equal(copy["preparation.guide.heading"], "Product Engineer 직원 자료를 준비해 주세요.");
  assert.equal(copy["preparation.download.action"], "1. Excel 입력 양식 내려받기");
  assert.equal(copy["preparation.file.action"], "2. 작성한 Excel 파일 불러오기");
  assert.equal(copy["preparation.paste.heading"], "파일을 사용하지 않고 표 붙여넣기");
  assert.equal(copy["preparation.paste.action"], "자료 형식 확인");
  assert.equal(copy["preparation.ready.action"], "이 자료로 세션 시작");
  assert.match(copy["preparation.privacy"] ?? "", /브라우저.*파일은 전송하거나 저장하지 않/);
});

test("preparation and Decision Room import one scoped visual foundation", () => {
  const foundation = read("../../src/features/decision-room/decisionRoomFoundation.css");
  const preparation = read("../../src/features/facilitator-preparation/facilitatorPreparation.css");
  const decisionRoom = read("../../src/features/decision-room/decisionRoom.css");

  assert.match(foundation, /:where\(\.dr-app, \.fp-app\)/);
  for (const token of [
    "--dr-ink",
    "--dr-muted",
    "--dr-line",
    "--dr-soft",
    "--dr-blue",
    "--dr-blue-deep",
    "--dr-blue-soft",
  ]) {
    assert.match(foundation, new RegExp(token));
  }
  assert.match(preparation, /decisionRoomFoundation\.css/);
  assert.match(decisionRoom, /decisionRoomFoundation\.css/);
  assert.doesNotMatch(preparation, /--fp-/);
});

test("preparation renders centralized copy and only the Korean field contract", () => {
  const preparation = read("../../src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx");

  assert.match(preparation, /FOUNDER_COPY\["preparation\.heading"\]/);
  assert.match(preparation, /FOUNDER_COPY\["preparation\.download\.action"\]/);
  assert.match(preparation, /기본연봉\(원\)/);
  assert.match(preparation, /관련 경력년수/);
  assert.match(preparation, /회사 근속개월/);
  assert.doesNotMatch(preparation, /row_id|role_group|base_salary_krw/);
  assert.doesNotMatch(preparation, /Product Engineer roster/);
});


test("Task 10 conclusions, states, and next actions stay in the founder copy SSOT", () => {
  const viewModel = read("../../src/features/decision-room/decisionRoomViewModel.ts");
  assert.equal(
    FOUNDER_COPY["screen.result.multi.conclusion"],
    "세 역할에서 확인된 내용과 아직 확인할 항목을 함께 정리했습니다.",
  );
  assert.equal(FOUNDER_COPY["state.additional_review_required"], "추가 확인 필요");
  assert.equal(
    FOUNDER_COPY["action.next.platform"],
    "Platform Engineer의 연봉 차이를 설명할 기록과 적용 조건을 확인합니다.",
  );
  assert.match(viewModel, /FOUNDER_COPY\["screen\.result\.multi\.conclusion"\]/);
  assert.match(viewModel, /FOUNDER_COPY\["state\.additional_review_required"\]/);
  assert.match(viewModel, /FOUNDER_COPY\["action\.next\.platform"\]/);
  assert.doesNotMatch(
    viewModel,
    /"세 역할에서 확인된 내용과 아직 확인할 항목을 함께 정리했습니다\."/,
  );
});
