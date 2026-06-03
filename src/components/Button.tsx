import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    isLoading?: boolean
    children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', isLoading = false, children, className, ...props }, ref) => {
        const variantClass = `admin-btn--${variant}`
        const sizeClass = `admin-btn--size-${size}`

        return (
            <button
                ref={ref}
                className={`admin-btn ${variantClass} ${sizeClass} ${className || ''}`}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? 'Đang xử lý...' : children}
            </button>
        )
    }
)

Button.displayName = 'Button'
