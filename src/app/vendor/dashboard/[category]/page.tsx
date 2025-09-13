
'use client';

import { useParams } from 'next/navigation';
import CybercafeDashboard from '@/components/vendor/dashboard/cybercafe-dashboard';
import FoodMessDashboard from '@/components/vendor/dashboard/food-mess-dashboard';
import HostelDashboard from '@/components/vendor/dashboard/hostel-dashboard';
import LibraryDashboard from '@/components/vendor/dashboard/library-dashboard';
import PageHeader from '@/components/admin/page-header';

export default function VendorCategoryDashboardPage() {
    const params = useParams();
    const category = params.category as string;

    const renderDashboard = () => {
        switch (category) {
            case 'library':
                return <LibraryDashboard />;
            case 'food-mess':
                return <FoodMessDashboard />;
            case 'hostels':
                return <HostelDashboard />;
            case 'cybercafe':
                return <CybercafeDashboard />;
            default:
                return (
                     <PageHeader 
                        title="Unknown Dashboard"
                        description="This service dashboard does not exist."
                    />
                )
        }
    }

    return (
        <div>
            {renderDashboard()}
        </div>
    );
}
