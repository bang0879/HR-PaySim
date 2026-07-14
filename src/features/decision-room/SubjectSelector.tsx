import type { DecisionRoomSubjectOption } from "./decisionRoomViewModel.ts";

export function SubjectSelector({
  subjects,
  activeId,
  onSelect,
}: {
  subjects: DecisionRoomSubjectOption[];
  activeId: string;
  onSelect(themeId: string): void;
}) {
  return (
    <div className="dr-subject-row" aria-label="금번 화면에서 검토할 역할">
      {subjects.map((subject, index) => {
        const active = subject.id === activeId;
        return (
          <button
            key={subject.id}
            type="button"
            className={active ? "is-active" : ""}
            aria-pressed={active}
            onClick={() => onSelect(subject.id)}
          >
            <span>{subject.roleGroup}</span>
            <small>
              {active
                ? `${index + 1}/${subjects.length} 확인 중`
                : subject.reviewStatus === "answered" ? "답변 있음" : "확인 필요"}
            </small>
          </button>
        );
      })}
    </div>
  );
}
