import { useGetCurrentUserQuery } from "../../redux/api/userAPI";
import Spinner from "../utils/Spinner";
import Error from "../utils/Error";
import { motion } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import { useTheme } from "../../hooks/useTheme";

const Welcome = () => {
    const { isLoading, isSuccess, isError, error, data } = useGetCurrentUserQuery(undefined, {
        skip: !localStorage.getItem('accessToken')
    });
    const { isDarkMode } = useTheme();

    if (isLoading) return <Spinner />;
    if (isError) return <Error error={error} />;


    const secondaryTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';
    const bgColor = isDarkMode ? '#1F2937' : '#FFFFFF';

    if (isSuccess)
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`${bgColor} rounded-xl p-8`}
            >
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                        <FaUserCircle className="w-8 h-8 text-slate-600" />
                    </div>
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl font-bold mb-2 text-ink"
                        >
                            Welcome back, {data?.fullName}!
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg"
                            style={{ color: secondaryTextColor }}
                        >
                            Welcome to your admin dashboard. Manage your hospital's operations from here.
                        </motion.p>
                    </div>
                </div>
            </motion.div>
        );
};

export default Welcome;