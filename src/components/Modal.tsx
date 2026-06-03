import React, { useEffect } from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    subtitle?: string
    children: React.ReactNode
    className?: string
    closeLabel?: string
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    className = '',
    closeLabel = 'Đóng modal',
}) => {
    // Close modal on Esc key
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="admin-modal__overlay"
            onClick={onClose}
            role="presentation"
        >
            <div
                className={`admin-modal ${className}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {(title || closeLabel) && (
                    <div className="admin-modal__header">
                        {(title || subtitle) && (
                            <div>
                                {title && (
                                    <h3 id="modal-title" className="admin-modal__title">
                                        {title}
                                    </h3>
                                )}
                                {subtitle && (
                                    <p className="admin-modal__subtitle">{subtitle}</p>
                                )}
                            </div>
                        )}
                        {closeLabel && (
                            <button
                                onClick={onClose}
                                className="admin-modal__close-btn"
                                type="button"
                                aria-label={closeLabel}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                )}

                <div className="admin-modal__content">{children}</div>
            </div>
        </div>
    )
}

Modal.displayName = 'Modal'
