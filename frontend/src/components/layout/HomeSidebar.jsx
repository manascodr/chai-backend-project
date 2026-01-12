import { NavLink } from "react-router-dom";

const HomeSidebar = () => {
  const navItemClass = ({ isActive }) =>
    `home__nav-item${isActive ? " home__nav-item--active" : ""}`;

  return (
    <aside className="home__sidebar" aria-label="Sidebar navigation">
      <nav className="home__nav">
        <NavLink to="/" end className={navItemClass}>
          Home
        </NavLink>
        <NavLink to="/watch-history" className={navItemClass}>
          History
        </NavLink>
      </nav>
    </aside>
  );
};

export default HomeSidebar;
