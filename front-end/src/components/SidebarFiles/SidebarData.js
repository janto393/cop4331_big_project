import React from 'react'
import { FaHome, FaUtensils, FaList, FaUserCircle, FaCookieBite } from "react-icons/fa";

export const SidebarData = [
    {
        title: 'Home',
        path:'/recipes',
        icon: <FaHome />,
        cName: 'sidebar-text'
    },
    {
        title: 'My Recipes',
        path:'/myrecipes',
        icon: <FaUtensils />,
        cName: 'sidebar-text'
    },
    {
        title: 'Create Recipe',
        path:'/createrecipe',
        icon: <FaCookieBite />,
        cName: 'sidebar-text'
    },
    {
        title: 'My Account',
        path:'/accountSettings',
        icon: <FaUserCircle />,
        cName: 'sidebar-text'
    }
]
