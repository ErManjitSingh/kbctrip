const steps = ['Guest details', 'Payment', 'Confirmed'] as const;

export function BookStepper({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol className="book-stepper" aria-label="Booking steps">
      {steps.map((label, index) => {
        const current = index + 1;
        const state = current === step ? 'active' : current < step ? 'done' : '';
        return (
          <li className={state} key={label} aria-current={current === step ? 'step' : undefined}>
            <b>{current}</b>
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
