import React from 'react';
import { Compass, Award, CreditCard, Check } from 'lucide-react';

const STEPS = [
  { id: 'explore',    label: 'Выбор участка',   icon: Compass },
  { id: 'customizer', label: 'Оформление',       icon: Award },
  { id: 'checkout',   label: 'Оплата',           icon: CreditCard },
];

const ProgressStepper = ({ currentPage, onStepClick }) => {
  const currentIndex = STEPS.findIndex(s => s.id === currentPage);

  return (
    <div className="progress-stepper-lux animate-fade-in">
      {STEPS.map((step, index) => {
        const isDone    = index < currentIndex;
        const isActive  = index === currentIndex;
        const Icon      = step.icon;

        return (
          <React.Fragment key={step.id}>
            <div 
              className={`stepper-step ${isDone ? 'done clickable' : ''} ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (isDone && onStepClick) onStepClick(step.id);
              }}
              style={{ cursor: isDone ? 'pointer' : 'default' }}
            >
              <div className="stepper-icon-wrap">
                {isDone
                  ? <Check size={14} strokeWidth={3} />
                  : <Icon size={14} />
                }
              </div>
              <span className="stepper-label">{step.label}</span>
            </div>

            {index < STEPS.length - 1 && (
              <div className={`stepper-line ${isDone ? 'done' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressStepper;
