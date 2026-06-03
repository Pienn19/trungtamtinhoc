import React from 'react'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
    fullWidth?: boolean
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, helperText, fullWidth = true, className = '', id, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

        return (
            <div className={`admin-form-group ${fullWidth ? 'admin-form-group--full' : ''}`}>
                {label && (
                    <label htmlFor={inputId} className="admin-form-label">
                        {label}
                        {props.required && <span className="admin-form-label__required">*</span>}
                    </label>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    className={`admin-form-input ${error ? 'admin-form-input--error' : ''} ${className}`}
                    {...props}
                />

                {error && (
                    <div className="admin-form-error" role="alert">
                        {error}
                    </div>
                )}

                {helperText && !error && (
                    <div className="admin-form-helper-text">{helperText}</div>
                )}
            </div>
        )
    }
)

FormInput.displayName = 'FormInput'
