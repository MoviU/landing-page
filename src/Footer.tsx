function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="logo-font">Kachimov.com</div>
      <div className="logo-font">© {year} Max Kachimov</div>
    </footer>
  );
}

export default Footer;
