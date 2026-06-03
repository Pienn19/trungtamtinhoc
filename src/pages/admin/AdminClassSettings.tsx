import { useEffect, useState } from 'react'
import axiosClient from '../../services/axiosClient'
import '../../styles/admin-class-settings.css'

type Settings = {
    DefaultPeriodsPerSession: number
    MinPeriodsPerSession: number
    MaxPeriodsPerSession: number
}

const AdminClassSettings = () => {
    const [settings, setSettings] = useState<Settings | null>(null)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState<'success' | 'error'>('success')

    useEffect(() => {
        void axiosClient.get('/admin/class-settings')
            .then((response) => setSettings(response.data))
            .catch(() => {
                setMessage('Không thể tải cấu hình')
                setMessageType('error')
            })
    }, [])

    const update = async () => {
        if (!settings) return

        if (settings.DefaultPeriodsPerSession < settings.MinPeriodsPerSession || settings.DefaultPeriodsPerSession > settings.MaxPeriodsPerSession) {
            setMessage('Giá trị mặc định phải nằm giữa Min và Max')
            setMessageType('error')
            return
        }

        setSaving(true)
        setMessage('')

        try {
            await axiosClient.put('/admin/class-settings', settings)
            setMessage('Cập nhật thành công')
            setMessageType('success')
        } catch {
            setMessage('Cập nhật thất bại')
            setMessageType('error')
        } finally {
            setSaving(false)
        }
    }

    if (!settings) {
        return <div className="admin-class-settings__loading">Đang tải cấu hình...</div>
    }

    return (
        <div className="admin-class-settings">
            <h2 className="admin-class-settings__title">Cấu hình buổi lớp (Global)</h2>

            <div className="admin-class-settings__card">
                <div className="admin-class-settings__form">
                    <div className="admin-class-settings__field">
                        <label className="admin-class-settings__label">
                            Số tiết mặc định mỗi buổi:
                        </label>
                        <input
                            type="number"
                            value={settings.DefaultPeriodsPerSession}
                            min={settings.MinPeriodsPerSession}
                            max={settings.MaxPeriodsPerSession}
                            onChange={(event) => setSettings({ ...settings, DefaultPeriodsPerSession: Number(event.target.value) })}
                            className="admin-class-settings__input"
                        />
                    </div>

                    <div className="admin-class-settings__field">
                        <label className="admin-class-settings__label">
                            Min tiết mỗi buổi:
                        </label>
                        <input
                            type="number"
                            value={settings.MinPeriodsPerSession}
                            onChange={(event) => setSettings({ ...settings, MinPeriodsPerSession: Number(event.target.value) })}
                            className="admin-class-settings__input"
                        />
                    </div>

                    <div className="admin-class-settings__field">
                        <label className="admin-class-settings__label">
                            Max tiết mỗi buổi:
                        </label>
                        <input
                            type="number"
                            value={settings.MaxPeriodsPerSession}
                            onChange={(event) => setSettings({ ...settings, MaxPeriodsPerSession: Number(event.target.value) })}
                            className="admin-class-settings__input"
                        />
                    </div>

                    {message && (
                        <div
                            className={`admin-class-settings__message admin-class-settings__message--${messageType}`}
                            role={messageType === 'error' ? 'alert' : 'status'}
                        >
                            {message}
                        </div>
                    )}

                    <div className="admin-class-settings__actions">
                        <button
                            onClick={update}
                            disabled={saving}
                            className="admin-class-settings__btn admin-class-settings__btn--primary"
                            type="button"
                        >
                            {saving ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminClassSettings
