import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from "react-icons/fa";
import { SidebarData } from './SidebarData';
import { IconContext } from 'react-icons';
import './Sidebar.css';


function Sidebar(){
    const [showbar,setShowbar] = useState(false)

    const showSidebar = () => setShowbar(!showbar)

    return(
        <>
            <IconContext.Provider value = {{ color: 'white' }}>
                <div className = "sidebar">
                    <Link to="#" className ="menu-bars">
                        <FaBars onClick = {showSidebar}/>
                    </Link>
                    <h1 className="usersname">[Name here]</h1>
                </div>
                <nav className = {showbar ? 'side-menu active' :'side-menu'}>
                    <ul className = 'side-menu-items' onClick = {showSidebar}>
                        <li className = 'sidebar-toggle'>
                            <Link to="#" className='menu-bars'>
                                <FaTimes />
                            </Link>
                        </li>
                        {SidebarData.map((item,index) => {
                            return (
                                <li key={index} className={item.cName}>
                                    <Link to={item.path}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </IconContext.Provider>
        </>
    )
}

export default Sidebar