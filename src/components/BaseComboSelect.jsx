import React from 'react';

export default function BaseComboSelect({
  wrapperRef,
  isFocused,
  onClickWrapper,
  children,
  dropdownContent,
  containerClassName = "relative w-full",
  inputClassName = "input-frame"
}) {
  return (
    <div className={containerClassName} ref={wrapperRef}>
      <div 
        onClick={onClickWrapper}
        className={`${inputClassName} ${isFocused ? 'border-primary/50' : 'border-outline-variant/30'}`}
      >
        {children}
      </div>

      {dropdownContent && (
        <div className="dropdown-frame">
          {dropdownContent}
        </div>
      )}
    </div>
  );
}
