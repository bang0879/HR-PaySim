import type { QuickInputDraft } from "./domain.ts";

export function validateQuickInput(input: QuickInputDraft): string[] {
  const errors: string[] = [];
  const numericFields: Array<[keyof QuickInputDraft, string]> = [
    ["employeeCount", "전체 인원"],
    ["plannedHires", "채용 계획"],
    ["basePayrollAnnual", "기준 급여 총액"],
    ["variablePayAnnual", "변동 보상 총액"],
    ["benefitsAnnual", "복리후생 총액"],
    ["exceptionRaiseCount", "예외 인상"],
    ["inversionCaseCount", "보상 역전"],
  ];

  for (const [field, label] of numericFields) {
    const value = input[field];
    if (typeof value === "number" && value < 0) {
      errors.push(`${label}에는 음수 값을 사용할 수 없습니다.`);
    }
  }

  if (input.employeeCount <= 0) {
    errors.push("전체 인원은 1명 이상이어야 합니다.");
  }

  if (input.exceptionRaiseCount > input.employeeCount) {
    errors.push("예외 인상 건수는 전체 인원보다 클 수 없습니다.");
  }

  if (input.inversionCaseCount > input.employeeCount) {
    errors.push("보상 역전 건수는 전체 인원보다 클 수 없습니다.");
  }

  return errors;
}

export function containsPiiLikeText(value: string): boolean {
  return /(@|010-?\d{4}-?\d{4}|\d{6}-[1-4]\d{6}|주민등록|이메일|전화번호|사번)/.test(value);
}
