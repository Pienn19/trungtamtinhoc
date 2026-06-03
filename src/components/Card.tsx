import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
}

export const Card: React.FC<CardProps> & {
    Header: React.FC<CardHeaderProps>
    Body: React.FC<CardBodyProps>
    Footer: React.FC<CardFooterProps>
} = ({ children, className = '', ...props }) => {
    return (
        <div className={`admin-card ${className}`} {...props}>
            {children}
        </div>
    )
}

Card.Header = ({ children, className = '', ...props }: CardHeaderProps) => (
    <div className={`admin-card__header ${className}`} {...props}>
        {children}
    </div>
)

Card.Body = ({ children, className = '', ...props }: CardBodyProps) => (
    <div className={`admin-card__body ${className}`} {...props}>
        {children}
    </div>
)

Card.Footer = ({ children, className = '', ...props }: CardFooterProps) => (
    <div className={`admin-card__footer ${className}`} {...props}>
        {children}
    </div>
)

Card.Header.displayName = 'Card.Header'
Card.Body.displayName = 'Card.Body'
Card.Footer.displayName = 'Card.Footer'
Card.displayName = 'Card'
