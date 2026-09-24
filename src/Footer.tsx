import { Link } from './router';

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div>Kachimov.com</div>
      <Link className="footer-link" href="/games">
        Arcade
      </Link>
      <div>© {year} Max Kachimov</div>
    </footer>
  );
}

export default Footer;
