# HR PaySim Product Thesis

## 1. Product Definition

**Product name:** HR PaySim

**Client-facing description:** Compensation Governance Simulator for growth-stage Korean startups.

HR PaySim is a sibling module to HR Prism. It helps leadership teams simulate compensation governance decisions when HR Prism identifies compensation-related risks. The product focuses on how compensation principles, exception handling, hiring plans, and budget decisions interact inside a growing organization.

The core thesis is that growth-stage startups often treat compensation, hiring, and AI tooling as separate budget lines. HR PaySim reframes them as one workforce investment decision. However, v1.0 remains a compensation governance simulator. AI is included only as an advanced scenario lens, not as a separate product layer.

## 2. Problem It Solves

Growth-stage Korean startups frequently face compensation decisions before their HR systems are mature enough to explain or govern those decisions consistently. Common symptoms include inconsistent offers, one-off retention adjustments, unclear promotion-linked pay movement, opaque executive exceptions, and budget discussions that separate headcount, compensation, and productivity assumptions.

HR PaySim helps teams move from reactive compensation decisions to governed compensation scenarios. It gives founders, executives, and HR leaders a structured way to compare compensation choices, expose hidden exception debt, and prepare decision memos that explain trade-offs.

The product is intended for moments when compensation risk is already visible. It is not a broad HR planning suite, and it should not be introduced before HR Prism has diagnosed whether compensation governance is a meaningful risk area.

## 3. Why This Is Not a Salary Calculator

HR PaySim does not answer the question, "What should this person be paid?"

It answers a different question: "What happens to compensation governance if we choose this policy, exception, hiring, or allocation scenario?"

A salary calculator typically produces a number based on role, level, market data, or personal inputs. HR PaySim does not provide employee-specific salary recommendations, does not benchmark against external salary market data, and does not optimize individual pay packages.

Instead, it simulates governance-level consequences: explainability, consistency, exception accumulation, budget pressure, and decision quality. The unit of analysis is the compensation system, not the individual employee.

## 3A. Core Facilitated Interaction

The core v1 facilitated interaction is the **Relationship Review Beat**.

HR PaySim should help a founder review a visible compensation relationship or distribution, surface the founder's natural explanation criteria, reveal the roster-based evidence, capture a structured explanation reason, classify the finding, and carry the result into a memo preview.

This is not a quiz or prediction flow. The product should not ask the founder to guess who earns more, reveal whether the founder was right or wrong, or use surprise as the purpose of the interaction. Founder intuition is useful only as explanation context: which criterion would the founder expect to use here, and can the roster evidence support that explanation?

## 4. Why This Is Not a Standalone AI Workforce Simulator

HR PaySim is not an AI substitution calculator or a standalone Human-AI workforce simulator.

The Human-AI Workforce Economics lens appears only in selected advanced scenarios where AI tooling materially changes the workforce investment decision. For example, a scenario may compare whether a team should allocate budget toward additional hiring, compensation adjustment, AI-enabled productivity support, or an orchestrator premium pool.

Even in those cases, AI is treated as a workforce economics assumption inside compensation governance. It is not modeled as an independent product layer, a replacement percentage, or a claim about which jobs will disappear.

Version 1.0 must keep the product centered on compensation governance. AI-related analysis should clarify budget trade-offs and productivity assumptions only when relevant.

## 5. Relationship With HR Prism

HR Prism diagnoses HR system coherence. HR PaySim simulates compensation governance decisions when compensation-related risks appear in HR Prism.

HR PaySim should be triggered only when HR Prism diagnosis shows one or more of the following:

- High compensation inconsistency
- High compensation exception debt
- Low compensation explainability

This sequencing matters. HR Prism identifies whether compensation is a systemic risk. HR PaySim then provides a focused simulation environment for compensation governance decisions. HR PaySim should not replace HR Prism, duplicate the broader diagnosis workflow, or become a general-purpose planning module.

## 6. Pilot Sequence

The recommended pilot sequence is:

1. Run HR Prism first to diagnose HR system coherence.
2. Trigger HR PaySim only when compensation risk is high.
3. Offer an HR PaySim preview for free when it helps the client understand the compensation risk surfaced by HR Prism.
4. Convert the deeper Decision Memo into a paid deliverable or a case-exchange deliverable.

The preview should demonstrate the value of compensation governance simulation without turning the product into a generic calculator. The Decision Memo should be the primary deliverable for serious client use: a concise explanation of options, trade-offs, governance risks, and recommended next decisions.

## 7. Signature Concepts

### Compensation Explainability Index, CEI

CEI represents how clearly a company can explain compensation decisions across roles, levels, teams, and exceptions. It should reflect whether leaders can defend compensation choices using consistent principles rather than ad hoc justification.

### Compensation Exception Debt, CED

CED represents the accumulated burden of one-off compensation exceptions. It captures the idea that exceptions may solve immediate retention or hiring problems while creating future governance pressure, perceived unfairness, and explanation costs.

### Orchestrator Premium Pool

The Orchestrator Premium Pool represents a deliberate compensation allocation for roles or people who increase organizational leverage by coordinating human work, AI tooling, processes, and decision flows. It should be used only where the organization can define the premium clearly and govern it consistently.

### Productivity Leakage Flag

The Productivity Leakage Flag identifies scenarios where compensation, hiring, tooling, or organizational design choices create hidden productivity loss. It should highlight risks such as unmanaged coordination burden, duplicated work, unclear accountability, or AI tooling that adds process overhead instead of reducing it.

## 8. Strict Exclusions

HR PaySim v1.0 must exclude the following:

- No AI substitution percentage
- No Total Work Cost formula
- No fake attrition probability
- No employee-level sensitive data storage
- No external salary market data integration
- No legal/tax-grade stock option calculation

These exclusions protect the product from drifting into unsupported prediction, legal/tax advice, sensitive employee profiling, or generic market benchmarking. They also keep the product aligned with its core purpose: compensation governance simulation for growth-stage Korean startups.

## 9. Acceptance Criteria for This Document

This document is acceptable when it:

- Defines HR PaySim as a compensation governance simulator, not a salary calculator.
- States that HR PaySim is a sibling module to HR Prism, not a replacement.
- Explains that HR Prism must come first in the pilot sequence.
- Limits HR PaySim triggering to high compensation inconsistency, high compensation exception debt, or low compensation explainability.
- Positions the Human-AI Workforce Economics lens as an advanced scenario lens only.
- Includes the required signature concepts: CEI, CED, Orchestrator Premium Pool, and Productivity Leakage Flag.
- Lists all strict exclusions without weakening or reframing them.
- Keeps the tone clear, strategic, product-specific, and free of hype.
