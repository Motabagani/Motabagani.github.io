function TopBar() {
  return (
    <header className="topbar">
      <a href="#/" className="mark">
        <img src="images/logowhite.png" alt="Home" className="logo" />
        <span>HASHIM MOTABAGANI</span>
      </a>
      <nav>
        <a href="#/#work">Work</a>
        <a href="#/#writing">Writing</a>
        <a href="#/#about">About</a>
        <a href="#/#contact">Contact</a>
      </nav>
    </header>
  );
}

export default TopBar;