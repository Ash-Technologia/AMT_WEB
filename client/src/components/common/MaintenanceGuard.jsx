import { useEffect, useState } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Maintenance from '../../pages/Maintenance';

const MaintenanceGuard = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const [maintenance, setMaintenance] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                // If API is down or restricted, we might fail here.
                // But /api/config is public.
                const { data } = await API.get('/config'); // /api/config
                if (data.success && data.config?.maintenanceMode) {
                    setMaintenance(true);
                }
            } catch (err) {
                console.error('Failed to check maintenance mode', err);
            } finally {
                setLoading(false);
            }
        };
        checkMaintenance();
    }, []);

    if (authLoading || loading) {
        return <div className="page-loader"><div className="spinner" /></div>;
    }

    // If maintenance is active AND (no user OR user is not admin)
    // Actually, if user is admin, they should proceed.
    // If user is just 'user', strict maintenance usually blocks them too?
    // The requirement said "will not be shown". Assumes public visibility.
    // I'll allow admins to bypass.
    if (maintenance && (!user || user.role !== 'admin')) {
        return <Maintenance />;
    }

    return children;
};

export default MaintenanceGuard;
