import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Twitter, Github, Linkedin } from "lucide-react";

function Footer() {
  return (
    <footer className="w-full border-t border-[#e8e8ec] dark:border-[#2a2a2e] bg-white/50 dark:bg-[#141416]/50 backdrop-blur-xl mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/home" className="flex items-center gap-2 group w-fit mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                <Sparkles size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Lexis</h1>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-6">
              The next-generation publishing platform for creators and thinkers. Powered by bleeding-edge AI to help you write better, faster, and smarter.
            </p>
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-indigo-500 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-indigo-500 transition-colors"><Github size={20} /></a>
              <a href="#" className="hover:text-indigo-500 transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/home" className="hover:text-indigo-500 transition-colors">Features</Link></li>
              <li><Link to="/home" className="hover:text-indigo-500 transition-colors">AI Copilot</Link></li>
              <li><Link to="/home" className="hover:text-indigo-500 transition-colors">Pricing</Link></li>
              <li><Link to="/home" className="hover:text-indigo-500 transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/home" className="hover:text-indigo-500 transition-colors">Blog</Link></li>
              <li><Link to="/home" className="hover:text-indigo-500 transition-colors">Documentation</Link></li>
              <li><Link to="/home" className="hover:text-indigo-500 transition-colors">Community</Link></li>
              <li><Link to="/home" className="hover:text-indigo-500 transition-colors">Help Center</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-[#e8e8ec] dark:border-[#2a2a2e] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Lexis. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/home" className="hover:text-indigo-500 transition-colors">Privacy Policy</Link>
            <Link to="/home" className="hover:text-indigo-500 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
