'use client';

export default function Footer() {
  return (
    <footer className="glass-effect border-t border-dark-border px-6 py-4 mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-dark-muted">
          © 2024 SkillStock. All rights reserved.
        </div>
        <div className="flex items-center gap-6 text-sm text-dark-muted">
          <a href="#" className="hover:text-dark-text transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-dark-text transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-dark-text transition-colors">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}


