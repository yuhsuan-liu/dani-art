import { Github, Linkedin } from 'lucide-react'

const GITHUB_URL = 'https://github.com/yuhsuan-liu/dani-art'
const LINKEDIN_URL = 'https://www.linkedin.com/in/yuhsuan-liu-yl/'
const UNSPLASH_LICENSE_URL = 'https://unsplash.com/license'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>A gift project for Dani</p>
        <p className="max-w-md text-xs leading-relaxed text-stone-400">
          Demo images are stock photos from{' '}
          <a
            href="https://unsplash.com"
            className="underline decoration-stone-300 underline-offset-2 hover:text-stone-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Unsplash
          </a>
          , used under the{' '}
          <a
            href={UNSPLASH_LICENSE_URL}
            className="underline decoration-stone-300 underline-offset-2 hover:text-stone-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Unsplash License
          </a>
          .
        </p>
        <p>Created by YuHsuan Liu</p>
        <div className="flex items-center gap-1">
          <a
            href={GITHUB_URL}
            className="footer-icon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <Github size={20} strokeWidth={1.75} />
          </a>
          <a
            href={LINKEDIN_URL}
            className="footer-icon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <Linkedin size={20} strokeWidth={1.75} />
          </a>
        </div>
      </div>
    </footer>
  )
}
