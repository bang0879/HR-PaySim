export const ROSTER_HEADERS = [
  "기본연봉(원)",
  "관련 경력년수",
  "회사 근속개월",
  "직무",
  "직급",
  "직급 순서",
  "처우 예외적용 사유",
] as const;

export type CompensationExceptionReason =
  | "none"
  | "hiring_exception"
  | "counteroffer"
  | "other_documented";

export const COMPENSATION_EXCEPTION_LABELS: Record<
  CompensationExceptionReason,
  string
> = {
  none: "없음",
  hiring_exception: "채용 예외",
  counteroffer: "카운터오퍼",
  other_documented: "기타 문서화된 사유",
};

export const ROSTER_EXAMPLE_ROWS = [
  [68_000_000, 8, 36, "Backend Engineer", "L1", 1, "없음"],
  [74_000_000, 7.5, 24, "Backend Engineer", "L2", 2, "카운터오퍼"],
  [82_000_000, 10, 18, "Backend Engineer", "L3", 3, "채용 예외"],
  [79_000_000, 6, 12, "Backend Engineer", "L2", 2, "없음"],
] as const;
