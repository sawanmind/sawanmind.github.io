/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, Pocket as Projects, FileText as Resume, Mail as Contact, ArrowRight, Github, Twitter, Linkedin, Terminal, Layers, Database, Zap, Layout as LayoutIcon, Smartphone, Cpu, Palette, Monitor, Apple, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useCallback } from 'react';

// --- Types ---
type SectionId = 'home' | 'projects' | 'resume' | 'contact';

interface ContentData {
  personal: {
    name: string;
    headline: string;
    headlineHighlight: string;
    tagline: string;
    avatar: string;
    version: string;
    availability: {
      status: string;
      text: string;
      tags: string[];
    };
  };
  hero: {
    currentProject: {
      name: string;
      label: string;
      status: string;
      progress: number;
    };
    stats: {
      downloads: string;
      downloadsDescription: string;
      appsCount: number;
    };
  };
  techStack: {
    title: string;
    description: string;
    expertise: string;
    technologies: Array<{
      name: string;
      icon: string;
      description: string;
    }>;
  };
  experience: Array<{
    role: string;
    company: string;
    companyUrl?: string;
    period: string;
    description: string | string[];
    tags: string[];
  }>;
  skills: {
    title: string;
    items: Array<{
      label: string;
      value: number;
      level: string;
    }>;
  };
  projects: {
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      category: string;
      description: string;
      tags?: string[];
      image: string;
      linkText: string;
      link?: string;
      icon: string;
    }>;
  };
  competencies: Array<{
    label: string;
    value: string;
    icon: string;
  }>;
  contact: {
    title: string;
    subtitle: string;
    links: Array<{
      label: string;
      subtitle: string;
      icon: string;
      url: string;
      color: string;
    }>;
  };
  social: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}

// Impact words/phrases to highlight (defined once at module level)
const impactWords = [
  'Drove', 'Led', 'Architected', 'Implemented', 'Built', 'Delivered', 'Developed', 'Designed',
  'technical leadership', 'end-to-end', 'cross-functional', 'large-scale', 'high-impact',
  'production stability', 'performance improvements', 'system-level', 'scalable',
  'workflow optimization', 'CI/CD pipeline', 'release engineering', 'systematic quality',
  'micro app-based', 'Server-Driven UI', 'modular architecture', 'parallel team development',
  'Core ML', 'Vision', 'OpenCV', 'image-processing', 'machine learning', 'augmented reality',
  'innovative UI/UX', 'concept to App Store', 'location-based services'
];

// Create regex pattern once at module level for performance
const impactPattern = impactWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
const highlightPattern = new RegExp(`\\b(\\d+[+%KkM]?|\\$\\d+[KkM]?|<\\d+|\\d+\\s+(?:months?|years?|days?))\\b|(${impactPattern})`, 'gi');

// Helper to highlight metrics and impactful words in text
const highlightMetrics = (text: string) => {
  const parts = text.split(highlightPattern).filter(Boolean);

  return parts.map((part, index) => {
    // Check if this part matches the pattern (excluding undefined from capture groups)
    if (part && (
      /\b(\d+[+%KkM]?|\$\d+[KkM]?|<\d+|\d+\s+(?:months?|years?|days?))\b/i.test(part) ||
      impactWords.some(word => part.toLowerCase() === word.toLowerCase())
    )) {
      return (
        <span key={`highlight-${part}-${index}`} className="font-bold text-primary">
          {part}
        </span>
      );
    }
    return part;
  });
};

// Icon mapping helper
const getIconComponent = (iconName: string, className?: string) => {
  const icons: Record<string, any> = {
    cpu: Cpu,
    layers: Layers,
    zap: Zap,
    database: Database,
    monitor: Monitor,
    smartphone: Smartphone,
    apple: Apple,
    layout: LayoutIcon,
    palette: Palette,
    mail: Contact,
    linkedin: Linkedin,
    twitter: Twitter,
    github: Github,
    filedown: FileDown,
    download: FileDown,
  };
  const IconComponent = icons[iconName.toLowerCase()] || Terminal;
  return <IconComponent className={className} />;
};

// --- Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`ethereal-card rounded-2xl p-6 md:p-8 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="mb-12">
    <h2 className="font-display text-4xl md:text-5xl font-bold text-on-surface mb-2 relative inline-block">
      {title}
    </h2>
    {subtitle && <p className="text-on-surface-variant mt-4 text-lg leading-relaxed">{subtitle}</p>}
  </div>
);

const ProgressBar: React.FC<{ label: string; value: number; level: string }> = ({ label, value, level }) => (
  <div className="mb-8">
    <div className="flex justify-between items-end mb-2">
      <span className="font-bold text-on-surface">{label}</span>
      <span className="text-xs font-mono uppercase tracking-widest text-outline">{level}</span>
    </div>
    <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full bg-primary"
      />
    </div>
  </div>
);

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load content from JSON
  useEffect(() => {
    fetch('/content.json')
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load content:', err);
        setLoading(false);
      });
  }, []);

  // Validation functions
  const validateName = (name: string): string => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email is required';
    // More robust email validation: requires valid format with proper TLD
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validateMessage = (message: string): string => {
    if (!message.trim()) return 'Message is required';
    if (message.trim().length < 10) return 'Message must be at least 10 characters';
    return '';
  };

  // Handle input changes with real-time validation
  const handleInputChange = useCallback((field: 'name' | 'email' | 'message', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Real-time validation
    let error = '';
    switch (field) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'message':
        error = validateMessage(value);
        break;
    }
    setFormErrors(prev => ({ ...prev, [field]: error }));
  }, []); // Empty deps since validate functions are stable and setState functions are stable

  // Check if form is valid
  const isFormValid = (): boolean => {
    return (
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.message.trim() !== '' &&
      !formErrors.name &&
      !formErrors.email &&
      !formErrors.message
    );
  };

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const messageError = validateMessage(formData.message);

    setFormErrors({
      name: nameError,
      email: emailError,
      message: messageError
    });

    if (nameError || emailError || messageError) return;

    setIsSending(true);
    setSendStatus('idle');

    try {
      // Send email using Web3Forms (free, no backend needed)
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: '2a727e54-e3a0-40aa-92eb-6b92994fb2a9',
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: `Portfolio Contact: ${formData.name}`,
          from_name: formData.name,
          replyto: formData.email
        })
      });

      const data = await response.json();

      if (data.success) {
        setSendStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setFormErrors({ name: '', email: '', message: '' });

        // Auto-dismiss success message after 5 seconds
        setTimeout(() => {
          setSendStatus('idle');
        }, 5000);
      } else {
        setSendStatus('error');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setSendStatus('error');
    } finally {
      setIsSending(false);
    }
  }, [formData, content]); // Depend on formData and content

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // Show loading state
  if (loading || !content) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <Terminal className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-on-surface-variant">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return (
          <motion.div key="home" {...pageVariants} transition={{ duration: 0.4 }} className="space-y-24">
            {/* Hero */}
            <section className="pt-8">
              <div className="max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.1] text-on-surface mb-6">
                    {content.personal.headline.split(content.personal.headlineHighlight)[0]}
                    <span className="text-primary italic">{content.personal.headlineHighlight}</span>
                  </h1>
                </motion.div>
                <p className="text-lg md:text-xl text-on-surface-variant mb-10 leading-relaxed max-w-xl">
                  {content.personal.tagline}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setActiveSection('projects')}
                    className="bg-primary text-white px-8 py-4 rounded-[2rem] font-bold hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span className="pointer-events-none">View Portfolio</span>
                    <ArrowRight className="w-5 h-5 pointer-events-none" />
                  </button>
                  <button
                    onClick={() => setActiveSection('contact')}
                    className="bg-accent text-white px-8 py-4 rounded-[2rem] font-bold hover:shadow-lg hover:-translate-y-1 transition-all shadow-sm cursor-pointer"
                  >
                    <span className="pointer-events-none">Get in Touch</span>
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        );
      case 'resume':
        return (
          <motion.div key="resume" {...pageVariants} transition={{ duration: 0.4 }}>
            <SectionTitle title="Experience" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-8 space-y-8 relative">
                {/* Timeline Line */}
                <div className="absolute left-[11px] top-4 bottom-4 w-px bg-outline-variant/30 hidden sm:block" />

                {content.experience.map((exp) => (
                  <div key={exp.company} className="relative sm:pl-12">
                    <div className="absolute left-1.5 top-6 w-3 h-3 rounded-full bg-primary hidden sm:block shadow-[0_0_0_4px_var(--color-surface)]" />
                    <Card className="border-outline-variant rounded-[2.5rem]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <h3 className="font-display text-2xl font-bold text-on-surface">{exp.role}</h3>
                        <span className="text-xs font-mono font-bold tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-lg">{exp.period}</span>
                      </div>
                      <div className="text-on-surface-variant font-bold mb-4">
                        {exp.companyUrl ? (
                          <a
                            href={exp.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors cursor-pointer"
                          >
                            {exp.company}
                          </a>
                        ) : (
                          exp.company
                        )}
                      </div>
                      {Array.isArray(exp.description) ? (
                        <ul className="text-on-surface-variant mb-6 leading-relaxed space-y-2">
                          {exp.description.map((item, index) => (
                            <li key={`${exp.company}-${item.substring(0, 20)}-${index}`} className="flex gap-3">
                              <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                              <span>{highlightMetrics(item)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-on-surface-variant mb-6 leading-relaxed">
                          {highlightMetrics(exp.description)}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {exp.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-surface-container-low text-on-surface-variant rounded-full text-[10px] font-bold tracking-wider uppercase border border-outline-variant/30">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>

              <div className="md:col-span-4">
                <h3 className="font-display text-2xl font-bold mb-8 text-on-surface">Core Competencies</h3>
                <div className="grid grid-cols-1 gap-4">
                  {content.competencies.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white/40 border border-outline-variant/10 rounded-2xl p-6 hover:bg-white hover:shadow-md transition-all group cursor-pointer"
                    >
                      <div className="text-primary mb-4 group-hover:scale-110 transition-transform">{getIconComponent(item.icon)}</div>
                      <div className="font-bold text-sm mb-1">{item.label}</div>
                      <div className="text-xs text-outline">{item.value}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'projects':
        return (
          <motion.div key="projects" {...pageVariants} transition={{ duration: 0.4 }}>
            <SectionTitle
              title={content.projects.title}
              subtitle={content.projects.subtitle}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
              {content.projects.items.map((project, index) => (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="group"
                >
                  <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 bg-surface-container-highest">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8 text-white">
                       <div>
                         <div className="text-[10px] font-bold tracking-widest uppercase mb-1">{project.category}</div>
                        <h4 className="text-2xl font-display font-bold">{project.title}</h4>
                       </div>
                    </div>
                  </div>
                  <Card className="border-outline-variant rounded-[3rem]">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary border border-outline-variant/30">
                        {getIconComponent(project.icon, 'w-6 h-6')}
                      </div>
                      <div>
                        <h3 className="font-display text-2xl font-bold text-on-surface">{project.title}</h3>
                        <div className="text-[10px] font-bold text-outline tracking-widest uppercase">{project.category}</div>
                      </div>
                    </div>
                    <p className="text-on-surface-variant mb-6 leading-relaxed">
                      {project.description}
                    </p>
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-8">
                        {project.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-primary text-white rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.link ? (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-surface-container-low hover:bg-surface-container-high text-primary font-bold rounded-2xl flex items-center justify-center gap-2 transition-all border border-outline-variant cursor-pointer"
                      >
                        <Terminal className="w-4 h-4 pointer-events-none" />
                        <span className="pointer-events-none">{project.linkText}</span>
                      </a>
                    ) : (
                      <button className="w-full py-4 bg-surface-container-low hover:bg-surface-container-high text-primary font-bold rounded-2xl flex items-center justify-center gap-2 transition-all border border-outline-variant cursor-pointer">
                        <Terminal className="w-4 h-4 pointer-events-none" />
                        <span className="pointer-events-none">{project.linkText}</span>
                      </button>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      case 'contact':
        return (
          <motion.div key="contact" {...pageVariants} transition={{ duration: 0.4 }}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-5">
                <SectionTitle
                  title={content.contact.title}
                  subtitle={content.contact.subtitle}
                />
                <div className="space-y-4">
                  {content.contact.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full ethereal-card p-6 rounded-2xl flex items-center justify-between group hover:bg-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4 text-left pointer-events-none">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${link.color}`}>
                          {getIconComponent(link.icon)}
                        </div>
                        <div>
                          <div className="font-bold text-on-surface">{link.label}</div>
                          <div className="text-xs text-outline font-medium">{link.subtitle}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-outline group-hover:translate-x-1 transition-transform pointer-events-none" />
                    </a>
                  ))}
                </div>
              </div>
              <div className="md:col-span-7">
                <Card className="border-outline-variant rounded-[3rem]">
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-outline">Name</label>
                        <input
                          type="text"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full p-4 rounded-2xl bg-surface-container-low border ${
                            formErrors.name ? 'border-red-500' : 'border-outline-variant/30'
                          } focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline/50`}
                        />
                        {formErrors.name && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-outline">Email</label>
                        <input
                          type="email"
                          placeholder="your.email@company.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full p-4 rounded-2xl bg-surface-container-low border ${
                            formErrors.email ? 'border-red-500' : 'border-outline-variant/30'
                          } focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline/50`}
                        />
                        {formErrors.email && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-outline">Message</label>
                      <textarea
                        rows={5}
                        placeholder="Tell me about your opportunity, technical challenge, or what you'd like to discuss..."
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        className={`w-full p-4 rounded-2xl bg-surface-container-low border ${
                          formErrors.message ? 'border-red-500' : 'border-outline-variant/30'
                        } focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:text-outline/50`}
                      />
                      {formErrors.message && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.message}</p>
                      )}
                    </div>

                    {sendStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="p-5 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3"
                      >
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-green-800 font-bold mb-1">Message sent successfully!</p>
                          <p className="text-green-700 text-sm">Thank you for reaching out. I'll get back to you within 24 hours.</p>
                        </div>
                      </motion.div>
                    )}

                    {sendStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3"
                      >
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-red-800 font-bold mb-1">Failed to send message</p>
                          <p className="text-red-700 text-sm">Please try again or email me directly at{' '}
                            <a
                              href={content?.contact.links.find(l => l.icon === 'mail')?.url}
                              className="underline hover:text-red-800"
                            >
                              {content?.contact.links.find(l => l.icon === 'mail')?.url.replace('mailto:', '')}
                            </a>
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={!isFormValid() || isSending}
                      className={`w-full py-5 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md ${
                        !isFormValid() || isSending
                          ? 'bg-surface-container-low text-outline cursor-not-allowed'
                          : 'bg-primary text-white hover:shadow-lg active:scale-95 cursor-pointer'
                      }`}
                    >
                      {isSending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin pointer-events-none" />
                          <span className="pointer-events-none">Sending...</span>
                        </>
                      ) : (
                        <>
                          <span className="pointer-events-none">Send Message</span>
                          <Contact className="w-5 h-5 pointer-events-none" />
                        </>
                      )}
                    </button>
                  </form>
                </Card>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-container/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/20 shadow-sm">
              <img src={content.personal.avatar} alt={`${content.personal.name}'s profile picture`} className="w-full h-full object-cover" />
            </div>
            <span className="font-display text-xl md:text-2xl font-bold text-on-surface tracking-tight block">{content.personal.name}</span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {(['home', 'projects', 'resume', 'contact'] as SectionId[]).map((id) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                aria-label={`Navigate to ${id === 'resume' ? 'Experience' : id}`}
                aria-current={activeSection === id ? 'page' : undefined}
                className={`text-[10px] uppercase font-bold tracking-[0.2em] transition-colors relative py-2 cursor-pointer ${
                  activeSection === id ? 'text-primary' : 'text-outline hover:text-on-surface'
                }`}
              >
                <span className="pointer-events-none">{id === 'resume' ? 'Experience' : id}</span>
                {activeSection === id && (
                  <motion.div layoutId="nav-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full pointer-events-none" />
                )}
              </button>
            ))}
          </nav>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-24 mb-24 md:mb-0">
        <AnimatePresence mode="wait">
          {renderSection()}
        </AnimatePresence>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/90 backdrop-blur-2xl border-t border-outline-variant/10 px-6 pt-4 pb-8">
        <div className="flex justify-between items-center">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'projects', icon: Projects, label: 'Projects' },
            { id: 'resume', icon: Resume, label: 'Experience' },
            { id: 'contact', icon: Contact, label: 'Contact' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as SectionId)}
              aria-label={`Navigate to ${item.label}`}
              aria-current={activeSection === item.id ? 'page' : undefined}
              className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                activeSection === item.id ? 'text-primary' : 'text-outline'
              }`}
            >
              <item.icon className="w-6 h-6 pointer-events-none" />
              <span className="text-[10px] uppercase font-bold tracking-widest pointer-events-none">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}
