"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">

<div
  className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`}
></div>


        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Mouse Follower */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl transition-all duration-1000 ease-out pointer-events-none"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="max-w-6xl mx-auto text-center">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8 animate-bounce">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-sm font-medium">🚀 Container-Based Hosting</span>
            </div>

            {/* Main Heading with Gradient Animation */}
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="block bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent animate-pulse">
                Deploy
              </span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent bg-300% animate-gradient">
                Anywhere
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
              Revolutionary container-based VPS hosting for{' '}
              <span className="text-green-400 font-semibold">Node.js</span>,{' '}
              <span className="text-blue-400 font-semibold">Python</span>,{' '}
              <span className="text-cyan-400 font-semibold">React</span> and more
            </p>

            {/* CTA Buttons with Hover Effects */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                href="/signup"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  Start Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              
              <a
                href="#pricing"
                className="group px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-bold text-lg text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  View Pricing
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </span>
              </a>
            </div>

            {/* Animated Tech Stack */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: "Node.js", color: "from-green-400 to-green-600", delay: "0s" },
                { name: "Python", color: "from-blue-400 to-blue-600", delay: "0.2s" },
                { name: "React", color: "from-cyan-400 to-cyan-600", delay: "0.4s" },
                { name: "Docker", color: "from-blue-500 to-blue-700", delay: "0.6s" },
              ].map((tech, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  style={{ animationDelay: tech.delay }}
                >
                  <div className={`w-3 h-3 bg-gradient-to-r ${tech.color} rounded-full group-hover:animate-ping`}></div>
                  <span className="text-white/90 font-medium">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 relative">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-black text-white mb-6">
                Why Choose{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  HostPro?
                </span>
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Experience the future of container-based hosting
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🚀",
                  title: "Lightning Fast",
                  description: "Container-based infrastructure with instant deployments and auto-scaling capabilities.",
                  gradient: "from-blue-500/20 to-cyan-500/20",
                  border: "border-blue-500/30"
                },
                {
                  icon: "🔒",
                  title: "Enterprise Security",
                  description: "Military-grade encryption, DDoS protection, and automated security updates.",
                  gradient: "from-purple-500/20 to-pink-500/20",
                  border: "border-purple-500/30"
                },
                {
                  icon: "⚡",
                  title: "Global CDN",
                  description: "Worldwide content delivery network ensuring blazing fast load times everywhere.",
                  gradient: "from-green-500/20 to-emerald-500/20",
                  border: "border-green-500/30"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`group p-8 bg-gradient-to-br ${feature.gradient} backdrop-blur-md border ${feature.border} rounded-3xl hover:scale-105 transition-all duration-500 hover:shadow-2xl`}
                >
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 relative">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-black text-white mb-6">
                Simple{' '}
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Pricing
                </span>
              </h2>
              <p className="text-xl text-white/70">Choose the perfect plan for your needs</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="group p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Free</h3>
                  <div className="text-5xl font-black text-white mb-2">₹0</div>
                  <p className="text-white/60">Perfect for getting started</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {["1 Container", "512MB RAM", "1GB Storage", "Community Support"].map((feature, i) => (
                    <li key={i} className="flex items-center text-white/80">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="/signup"
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold transition-all duration-300 block text-center border border-white/20"
                >
                  Get Started
                </a>
              </div>

              {/* Pro Plan - Featured */}
              <div className="group relative p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-blue-500/30 rounded-3xl hover:scale-110 transition-all duration-500 transform scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold animate-pulse">
                  Most Popular
                </div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Pro</h3>
                  <div className="text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">₹99</div>
                  <p className="text-white/60">per month</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {["5 Containers", "4GB RAM", "50GB Storage", "Priority Support", "SSL Certificates"].map((feature, i) => (
                    <li key={i} className="flex items-center text-white/80">
                      <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="/signup"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 rounded-2xl font-bold transition-all duration-300 block text-center shadow-lg hover:shadow-2xl"
                >
                  Start Pro
                </a>
              </div>

              {/* Enterprise Plan */}
              <div className="group p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Enterprise</h3>
                  <div className="text-5xl font-black text-white mb-2">₹999</div>
                  <p className="text-white/60">per year</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {["Unlimited Containers", "16GB RAM", "500GB Storage", "24/7 Support", "Custom Domains"].map((feature, i) => (
                    <li key={i} className="flex items-center text-white/80">
                      <div className="w-5 h-5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="/signup"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 rounded-2xl font-bold transition-all duration-300 block text-center"
                >
                  Go Enterprise
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-32 relative">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-5xl font-black text-white mb-8">
                  Built by{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Developers
                  </span>
                </h2>
                <p className="text-xl text-white/80 mb-8 leading-relaxed">
                  Founded by{' '}
                  <span className="text-blue-400 font-bold">Shubham Maurya</span>, HostPro solves real hosting challenges with innovative container-based solutions.
                </p>
                <div className="flex items-center gap-6 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                    SM
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">Shubham Maurya</div>
                    <div className="text-white/60">Founder & Lead Developer</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-white/20 rounded-3xl p-8">
                  <h3 className="text-3xl font-bold text-white mb-6">Our Mission</h3>
                  <p className="text-white/80 leading-relaxed text-lg">
                    To democratize cloud hosting by providing affordable, scalable, and developer-friendly container-based infrastructure that empowers creators worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 relative">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-6xl font-black text-white mb-8">
              Ready to{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Deploy?
              </span>
            </h2>
            <p className="text-2xl text-white/80 mb-12">
              Join thousands of developers building the future
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="/signup"
                className="group px-12 py-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl font-bold text-xl text-white hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/25"
              >
                <span className="flex items-center gap-3">
                  Start Free Today
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
