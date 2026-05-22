function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div>Kachimov.com</div>
      <div>© {year} Max Kachimov</div>
    </footer>
  );
}

export default Footer;
