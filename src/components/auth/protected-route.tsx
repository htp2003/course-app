import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import { Spin } from "antd";

export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }


    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};