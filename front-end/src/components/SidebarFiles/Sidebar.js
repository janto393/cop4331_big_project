// React imports
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from "react-icons/fa";
import { SidebarData } from './SidebarData';
import { IconContext } from 'react-icons';

// CSS imports
import './Sidebar.css';

// App imports
import LoggedInName from '../LoggedInName';
import Logout from '../Logout';


function Sidebar(){
    const [showbar, setShowbar] = useState(false)

    const showSidebar = () => setShowbar(!showbar)

    return(
			<div>
				<IconContext.Provider value={{ color: "white" }}>
					<div className="sidebar">
						<Link to="#" className ="menu-bars">
							<FaBars onClick={ showSidebar } />
						</Link>
						<h1 className="usersname"> <LoggedInName /> </h1>
					</div>
					<nav className={showbar ? "side-menu active" :"side-menu"}>
						<ul className="side-menu-items" onClick={ showSidebar }>
							<li className="sidebar-toggle">
								<Link to="#" className="menu-bars">
										<FaTimes />
								</Link>
							</li>
							{SidebarData.map((item,index) =>
							{
								return (
									<li key={index} className={item.cName}>
										<Link to={item.path}>
											{item.icon}
											<span>{item.title}</span>
										</Link>
									</li>
								);
							}
							)}
							<Logout />
						</ul>
					</nav>
				</IconContext.Provider>
			</div>
		);
}

export default Sidebar
