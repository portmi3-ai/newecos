import React from 'react';
import Link from 'next/link';
import { Shield, BarChart, Users, FileText, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4 text-primary-foreground">Michael Porter</h1>
            <h2 className="text-3xl font-semibold mb-6 text-primary-foreground">Business-Focused Security Executive</h2>
            <p className="text-xl mb-8">
              Transformative security leader with 30+ years of experience driving measurable performance improvements while ensuring operational excellence and regulatory compliance in highly regulated industries.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/about" className="bg-accent text-accent-foreground px-6 py-3 rounded-md font-medium hover:bg-accent/90 transition-colors">
                Learn More
              </Link>
              <Link href="/contact" className="bg-transparent border-2 border-primary-foreground text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary-foreground/10 transition-colors">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Bridging Security & Business Objectives</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Shield size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Business-Aligned Security</h3>
              <p>Translating security requirements into business value and aligning security initiatives with organizational objectives.</p>
            </div>
            <div className="card flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <BarChart size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Data-Driven Performance</h3>
              <p>Consistently delivering 24-37% above-target results through metrics-driven decision making and performance optimization.</p>
            </div>
            <div className="card flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Users size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transformative Leadership</h3>
              <p>Building high-performing teams and developing consultative relationships with stakeholders at all levels.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Highlights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Experience Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Financial Services Security</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  <span>Led security operations across multiple financial institutions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  <span>Implemented regulatory compliance frameworks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  <span>Achieved 115% of security compliance targets</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  <span>Developed data-driven security metrics programs</span>
                </li>
              </ul>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Enterprise Risk Management</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  <span>Established risk-based security approaches</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  <span>Reduced security incidents by 15-30%</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  <span>Created and executed security awareness campaigns</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  <span>Led cross-functional security initiatives</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Thought Leadership Preview */}
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Thought Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card">
              <div className="mb-4">
                <FileText size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transforming Security from Cost Center to Business Enabler</h3>
              <p className="mb-4">How security leaders can demonstrate value and align with business objectives.</p>
              <Link href="/thought-leadership" className="text-primary hover:text-accent transition-colors font-medium">
                Read More →
              </Link>
            </div>
            <div className="card">
              <div className="mb-4">
                <FileText size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Data-Driven Security: Measuring What Matters</h3>
              <p className="mb-4">Implementing effective security metrics that drive business decisions.</p>
              <Link href="/thought-leadership" className="text-primary hover:text-accent transition-colors font-medium">
                Read More →
              </Link>
            </div>
            <div className="card">
              <div className="mb-4">
                <FileText size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Building C-Suite Relationships: Security as a Business Partner</h3>
              <p className="mb-4">Strategies for effective communication with executive leadership.</p>
              <Link href="/thought-leadership" className="text-primary hover:text-accent transition-colors font-medium">
                Read More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-primary-foreground">Ready to Transform Your Security Strategy?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let's discuss how my business-focused approach to security can help your organization achieve its objectives while maintaining robust protection.
          </p>
          <Link href="/contact" className="bg-accent text-accent-foreground px-8 py-3 rounded-md font-medium hover:bg-accent/90 transition-colors inline-block">
            Contact Me
          </Link>
        </div>
      </section>
    </div>
  );
}
