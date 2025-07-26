export default function Footer() {
  return (
    <footer className="bg-white/5 backdrop-blur-md border-t border-white/10 text-white/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                HostPro
              </span>
            </div>
            <p className="text-white/70 max-w-md leading-relaxed mb-6">
              Container-based VPS hosting platform built by developers, for developers. Deploy Node.js, Python, React and more with ease.
            </p>
            <div className="flex space-x-4">
              {/* Social Icons */}
              {["twitter", "github", "linkedin"].map((platform, index) => (
                <a key={index} href="#" className="text-white/50 hover:text-white transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="currentColor" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              {["Container Hosting", "VPS Solutions", "API Services", "Documentation"].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="text-white/60 hover:text-white transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              {["Help Center", "Contact Us", "Status Page", "Community"].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="text-white/60 hover:text-white transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-white/40">
          <p>© 2025 HostPro. Built with ❤️ by <span className="text-blue-300">Shubham Maurya</span></p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
