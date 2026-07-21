import type { Question } from "@/types";

function Dots({ count, symbol }: { count: number; symbol: string }) { return <span className="dot-group" aria-hidden="true">{Array.from({ length: count }, (_, index) => <span key={index}>{symbol}</span>)}</span>; }

export function QuestionVisual({ question }: { question: Question }) {
  const [first, second] = question.values;
  if (question.kind === "addition") return <div className="math-visual groups"><Dots count={first} symbol={question.id === "add-2" ? "🍎" : question.id === "add-3" ? "🐚" : "⭐"} /><strong>+</strong><Dots count={second} symbol={question.id === "add-2" ? "🍎" : question.id === "add-3" ? "🐚" : "⭐"} /></div>;
  if (question.kind === "subtraction") return <div className="math-visual groups"><Dots count={first} symbol="●" /><strong>− {second}</strong><span className="visual-note">take away</span></div>;
  if (question.kind === "missing-addend") return <div className="equation"><span>{first}</span><strong>+</strong><span className="blank" aria-label="missing number">?</span><strong>=</strong><span>{second}</span></div>;
  if (question.kind === "skip-counting") return <div className="sequence">{question.values.map((value) => <span key={value}>{value}</span>)}<span className="blank">?</span></div>;
  return <div className="bond" aria-label={`Number bond: whole ${first}, one part ${second}, one missing part`}><span className="bond-whole">{first}</span><span className="bond-line left"/><span className="bond-line right"/><span className="bond-part known">{second}</span><span className="bond-part blank">?</span></div>;
}
