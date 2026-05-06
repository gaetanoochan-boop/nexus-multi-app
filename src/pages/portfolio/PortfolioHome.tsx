import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'motion/react';
import { ExternalLink, Mail, Send, Github, Layout } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  tags: string[];
}

const DEFAULT_PROJECTS = [
  {
    id: 'p1',
    title: 'Nexus Multi-App Ecosystem',
    description: 'A massive suite of interconnected apps including a store, portfolio, and auth system built with React and Firebase.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426',
    link: '#',
    tags: ['React', 'Firebase', 'Tailwind']
  },
  {
    id: 'p2',
    title: 'Aether Audio Branding',
    description: 'Complete visual identity and e-commerce experience for a premium high-fidelity audio brand.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=2070',
    link: '#',
    tags: ['Design', 'Branding', 'Store']
  }
];

export default function PortfolioHome() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      const path = 'projects';
      try {
        const q = query(collection(db, path), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(data.length > 0 ? data : DEFAULT_PROJECTS);
      } catch (error) {
        setProjects(DEFAULT_PROJECTS);
        console.error('Using fallback projects due to:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const path = 'submissions';
    try {
      await addDoc(collection(db, path), {
        name: contactName,
        email: contactEmail,
        message: contactMessage,
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      {/* Hero Section */}
      <section className="mb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <span className="text-indigo-600 font-semibold tracking-wider text-sm uppercase mb-4 block">Available for Work</span>
          <h1 className="text-6xl font-bold leading-tight mb-6 tracking-tight">
            Building digital experiences that <span className="text-indigo-600 underline">matter</span>.
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mb-10">
            Professional Full-Stack Developer specializing in React, Node.js, and high-performance cloud architectures.
          </p>
          <div className="flex gap-4">
            <a href="#projects" className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">View Projects</a>
            <a href="#contact" className="border border-gray-200 px-8 py-3 rounded-full font-medium hover:border-gray-900 transition-colors">Contact Me</a>
          </div>
        </motion.div>
      </section>

      {/* Projects Grid */}
      <section id="projects" className="mb-32">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Work</h2>
            <p className="text-gray-500">A selection of my best projects from the last year.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[1, 2].map(i => <div key={i} className="aspect-video bg-gray-100 rounded-3xl animate-pulse" />)}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden mb-6">
                  <img
                    src={project.imageUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072'}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                    <p className="text-gray-500 mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex gap-2 mb-4">
                      {project.tags?.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <a href={project.link} target="_blank" className="p-3 bg-white border border-gray-100 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                    <ExternalLink className="w-5 h-5 text-gray-500" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
            <Layout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No projects to display yet. Sign in as admin to add some!</p>
          </div>
        )}
      </section>

      {/* Contact Section */}
      <section id="contact" className="max-w-4xl mx-auto bg-gray-50 rounded-[3rem] p-12 md:p-20 overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Have a project in mind?</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-xl">
            I'm currently accepting new projects and would love to hear about what you're building.
          </p>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-3xl text-center shadow-lg"
            >
              <Send className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
              <p className="text-gray-500">I'll get back to you as soon as possible.</p>
              <button onClick={() => setSubmitted(false)} className="mt-6 text-indigo-600 font-medium hover:underline">Send another message</button>
            </motion.div>
          ) : (
            <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full bg-white border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full bg-white border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  className="w-full flex-1 bg-white border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>
              <div className="md:col-start-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  {!isSubmitting && <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Decor */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50" />
      </section>

      {/* Footer */}
      <footer className="mt-32 pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
        <p>© 2026 Nexus Portfolio. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gray-900 transition-colors flex items-center gap-1"><Github className="w-4 h-4" /> Github</a>
          <a href="#" className="hover:text-gray-900 transition-colors flex items-center gap-1"><Mail className="w-4 h-4" /> Email</a>
        </div>
      </footer>
    </div>
  );
}
