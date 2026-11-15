import ShaderArt from './components/ui/shader-art.tsx';
import FeaturedVideos from './components/FeaturedVideos.jsx';
import SocialCard from './components/SocialCard.jsx';
import { socials } from './data/socials.js';

export default function App() {
  return (
    <>
      <ShaderArt className="shader-background" speed={0.35} intensity={0.6} scale={0.75} colors={{ base: '#f5f3ed', accent: '#087e82', ink: '#202b2c' }} />
      <main className="page-shell">
        <header className="hero">
          <img className="brand-logo" src="/backtobase-logo.png" alt="BacktoBase" width="3840" height="579" />
          <h1>Learn. Connect. Build. Grow. <em>Together</em></h1>
          <p className="intro">A simple place to stay in touch with BacktoBase. Choose where you’d like to connect.</p>
        </header>

        <section className="socials" aria-labelledby="connect-title">
          <div className="section-heading">
            <span className="eyebrow">Connect with us</span>
            <h2 id="connect-title">Follow along</h2>
          </div>
          <div className="social-list">
            {socials.map((social) => <SocialCard key={social.title} {...social} />)}
          </div>
        </section>

        <FeaturedVideos />

        <footer className="footer">
          <span>BacktoBase</span>
          <span>Made with ❤️ by BacktoBase community</span>
        </footer>
      </main>
    </>
  );
}
