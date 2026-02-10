'use client';

import {
  Users,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Notebook,
  Youtube,
  ComputerIcon,
  Target,
  Instagram,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">About ChatAadi</h1>
      <p className="text-lg text-gray-700 mb-8 leading-relaxed">
        <span className="font-semibold text-blue-600">ChatAadi</span> is a modern AI chatbot platform designed to deliver
        smart, conversational experiences powered by open-source models like <strong>LLaMA</strong> and <strong>Mistral</strong>.
        With secure Google-based authentication, persistent chat history, and token tracking, it’s built for everyone — from
        developers to AI enthusiasts.
      </p>
      <div className='flex justify-center items-center mb-8'>
        <img src="/chatAadi.png" alt="ChatAadi" className='w-96 h-96 object-cover'/>
      </div>

      {/* Section: What We Do */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🚀 What We Do</h2>
        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          <li>Real-time, responsive AI chat using open-source models.</li>
          <li>Google sign-in with secure and persistent user sessions.</li>
          <li>Token usage tracking for optimization and cost control.</li>
          <li>Developer-friendly architecture for easy integration.</li>
        </ul>
      </section>

      {/* Section: Our Team */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">👨‍💻 Our Team</h2>
        <div className="flex items-start gap-6 flex-wrap">
          <div className="flex items-center gap-4 bg-white shadow rounded-lg p-5">
            <img
              src="https://abchatterjee7.github.io/abc-bio/assets/img/profile-img.jpg"
              alt="Aaditya B Chatterjee"
              className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover"
            />
            <div>
              <p className="text-lg font-semibold text-gray-800">Aaditya B Chatterjee</p>
              <p className="text-gray-500 text-sm">Founder & Full Stack Developer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Location */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📍 Where We're Based</h2>
        <div className="flex items-center gap-3 text-gray-600">
          <MapPin className="w-5 h-5 text-red-500" />
          <p>Hyderabad, India</p>
        </div>
      </section>

      {/* Section: Contact & Socials */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">💬 Connect With Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-gray-700">
          {[
            {
              icon: <Github className="w-5 h-5 text-gray-800" />,
              label: 'GitHub',
              href: 'https://github.com/abchatterjee7',
            },
            {
              icon: <Linkedin className="w-5 h-5 text-blue-600" />,
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/in/aaditya-bachchu-chatterjee-0485933b/',
            },
            {
              icon: <Twitter className="w-5 h-5 text-sky-500" />,
              label: 'Twitter/X',
              href: 'https://twitter.com/AadityaRaj8',
            },
            {
              icon: <Notebook className="w-5 h-5 text-yellow-600" />,
              label: 'Personal Blogs',
              href: 'https://dearabc.vercel.app/',
            },
            {
              icon: <Youtube className="w-5 h-5 text-red-600" />,
              label: 'YouTube',
              href: 'https://www.youtube.com/@geopolitiksimplified',
            },
            {
              icon: <Target className="w-5 h-5 text-pink-500" />,
              label: 'Portfolio',
              href: 'https://abchatterjee.netlify.app/',
            },
            {
              icon: <ComputerIcon className="w-5 h-5 text-purple-600" />,
              label: 'Tech Blogs',
              href: 'https://abc-tech-blog.vercel.app/',
            },
            {
              icon: <Globe className="w-5 h-5 text-green-600" />,
              label: 'Resume',
              href: 'https://abchatterjee7.github.io/abc-bio/',
            },
            {
                icon: <Instagram className="w-5 h-5 text-red-600" />,
                label: 'Instagram',
                href: 'https://www.instagram.com/geopolitiksimplified/',
            }
          ].map(({ icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:underline hover:text-blue-700 transition-colors"
            >
              {icon}
              {label}
            </a>
          ))}
        </div>
      </section>

      {/* Section: Vision */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🌟 Our Vision</h2>
        <p className="text-gray-700 leading-relaxed">
          We believe that open and responsible AI should be accessible to everyone. Our mission is to create tools that empower users,
          democratize knowledge, and support developers in building a more intelligent and ethical digital future.
        </p>
      </section>
    </div>
  );
}
