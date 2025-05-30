import React from 'react';
import Link from 'next/link';
import { Linkedin, Mail, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-primary-foreground">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail size={18} className="mr-2" />
                <a href="mailto:mportmedia@gmail.com" className="hover:text-accent transition-colors">
                  mportmedia@gmail.com
                </a>
              </li>
              <li className="flex items-center">
                <Linkedin size={18} className="mr-2" />
                <a 
                  href="https://linkedin.com/in/mportin" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  linkedin.com/in/mportin
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Site Map */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-primary-foreground">Site Map</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-accent transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/expertise" className="hover:text-accent transition-colors">
                  Expertise
                </Link>
              </li>
              <li>
                <Link href="/thought-leadership" className="hover:text-accent transition-colors">
                  Thought Leadership
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quote */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-primary-foreground">Philosophy</h3>
            <blockquote className="italic border-l-4 border-accent pl-4">
              "Make a positive impact on someone's life today, it is the least you can do."
            </blockquote>
            <p className="mt-2 text-right">- Michael Porter</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-4 border-t border-primary-foreground/20 text-center">
          <p>&copy; {currentYear} Michael Porter. All rights reserved.</p>
          <p className="text-sm mt-1">Business-Focused Security Executive</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
