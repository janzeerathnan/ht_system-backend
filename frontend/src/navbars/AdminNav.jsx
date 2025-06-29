import React, { useState } from "react";
import {
    ManageAccounts,
    KeyboardArrowDown,
    KeyboardArrowUp,
    Settings,
    Logout,
    Notifications,
    Person,
    Dashboard,
} from '@mui/icons-material';

import './Admin.css';
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/ICST.png";
import { logout } from "../api";

function AdminNav() {
    const [manageOpen, setManageOpen] = useState(false);
    const [settingOpen, setSettingOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    const toggleManage = () => {
        setManageOpen(!manageOpen);
    };

    const toggleSetting = () => {
        setSettingOpen(!settingOpen);
    };

    const handleLogout = async () => {
        if (isLoggingOut) return; // Prevent multiple logout attempts
        
        setIsLoggingOut(true);
        
        try {
            // Call centralized logout function
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
            // Continue with logout even if API call fails
        } finally {
            // Clear local storage with correct keys
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('employee');
            
            // Also remove old keys for compatibility
            localStorage.removeItem("authToken");
            localStorage.removeItem("userRole");

            // Navigate to login page
            navigate("/");
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="Navbar">
            <nav className="nav">
                <div className="logo">
                    <img src={Logo} alt="Logo" />
                </div>
            </nav>

            <div className="sidebar">
                <ul className="side-m">
                    <li className="sidebar-item">
                        <Dashboard className="icon-m icon-t-g" />
                        <Link to="/overview" className="text dropdown-li">Overview</Link>
                    </li>

                    <li className="sidebar-item" onClick={toggleManage}>
                        <ManageAccounts className="icon-m icon-t-g" />
                        <span className="text">Manage</span>
                        <span className="arrow">
                            {manageOpen ? (
                                <KeyboardArrowUp className="icon-m icon-right" />
                            ) : (
                                <KeyboardArrowDown className="icon-m icon-right" />
                            )}
                        </span>
                    </li>

                    {manageOpen && (
                        <ul className="dropdown">
                            <li className="manage-item">
                                <Link to="/people" className="dropdown-li">People</Link>
                            </li>
                            <li className="manage-item">
                                <Link to="/attendance" className="dropdown-li">Attendance</Link>
                            </li>
                            <li className="manage-item">
                                <Link to="/timeOff" className="dropdown-li">Time-off</Link>
                            </li>
                        </ul>
                    )}

                    <li className="sidebar-item" onClick={toggleSetting}>
                        <Settings className="icon-m icon-t-g" />
                        <span className="text">Settings</span>
                        <span className="arrow">
                            {settingOpen ? (
                                <KeyboardArrowUp className="icon-m icon-right" />
                            ) : (
                                <KeyboardArrowDown className="icon-m icon-right" />
                            )}
                        </span>
                    </li>

                    {settingOpen && (
                        <ul className="dropdown">
                            <li className="manage-item">
                                <Link to="/leavesettings" className="dropdown-li">Leave Settings</Link>
                            </li>
                            <li className="manage-item">
                                <Link to="/holidaycalendar" className="dropdown-li">Calendar</Link>
                            </li>
                        </ul>
                    )}

                    {/* Logout */}
                    <li className="sidebar-item">
                        <Link to="/" onClick={handleLogout} className="dropdown-li">
                            <Logout className="icon-m icon-t-g" />
                            <span className="text">Logout</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default AdminNav;
