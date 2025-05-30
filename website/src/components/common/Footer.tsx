import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center md:justify-start space-x-6 md:order-2">
          <Link to="/privacy" className="text-gray-500 hover:text-gray-600">
            Privacy
          </Link>
          <Link to="/terms" className="text-gray-500 hover:text-gray-600">
            Terms
          </Link>
          <Link to="/contact" className="text-gray-500 hover:text-gray-600">
            Contact
          </Link>
        </div>
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center md:text-left text-sm text-gray-500">
            &copy; {new Date().getFullYear()} AgentEcos. All rights reserved.
            <span className="inline-flex items-center ml-1">
              Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> in the cloud
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;