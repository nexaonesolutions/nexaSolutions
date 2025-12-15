import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, ArrowUp, LucideIcon, User } from 'lucide-react';

// --- Sub-componentes ---

// Componente para a seção de Newsletter
const NewsletterSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const newsletterRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'loading' || status === 'success') return;

    setStatus('loading');
    setMessage(''); // Limpa a mensagem anterior ao iniciar um novo envio

    try {
      const response = await fetch('/api/newsletter', { // Substitua pelo seu endpoint real
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        // Tenta extrair uma mensagem de erro do backend, se houver
        const errorData = await response.json().catch(() => ({ message: 'Ocorreu um erro no servidor.' }));
        throw new Error(errorData.message || 'Não foi possível completar a inscrição.');
      }

      setStatus('success');
      setMessage('Obrigado por se inscrever!');
      setName('');
      setEmail('');
    } catch (error) {
      setStatus('error');
      // Garante que a mensagem de erro seja exibida
      setMessage(error instanceof Error ? error.message : 'Um erro inesperado ocorreu.');
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = newsletterRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={newsletterRef}
      className={`text-center mb-16 transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <h3 className="text-3xl font-bold text-white mb-3">Fique por Dentro das Novidades</h3>
      <p className="text-gray-400 max-w-2xl mx-auto mb-8">
        Inscreva-se para receber as últimas atualizações, dicas de design e ofertas exclusivas diretamente na sua caixa de entrada.
      </p>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Seu nome"
              className="w-full pl-12 pr-4 py-3 bg-nexa-dark/70 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-nexa-primary focus:border-nexa-primary outline-none transition-all"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
          <div className="relative flex-grow">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="w-full pl-12 pr-4 py-3 bg-nexa-dark/70 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-nexa-primary focus:border-nexa-primary outline-none transition-all"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-nexa-primary to-nexa-secondary text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={status === 'loading' || status === 'success'}
        >
          {status === 'loading' ? 'Enviando...' : 'Inscrever-se'}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-sm transition-opacity duration-300 ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

// Componente para a coluna da marca e redes sociais
const BrandColumn: React.FC = () => {
  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexa-primary to-nexa-secondary flex items-center justify-center">
          <span className="text-white font-bold text-xl">N</span>
        </div>
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
          NEXA
        </span>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">
        Transformando visões em realidade digital. Criamos landing pages de alta conversão que impulsionam o seu negócio.
      </p>
      <div className="flex space-x-4 pt-2">
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            className="text-gray-400 hover:text-white transition-all duration-300 ease-in-out p-2 rounded-full transform hover:scale-110 hover:-translate-y-1 hover:bg-nexa-primary/20"
            aria-label={social.label}
          >
            <social.icon size={20} />
          </a>
        ))}
      </div>
    </div>
  );
};

// Componente reutilizável para colunas de links
interface FooterLinkColumnProps {
  title: string;
  links: { name: string; href: string }[];
}

const FooterLinkColumn: React.FC<FooterLinkColumnProps> = ({ title, links }) => (
  <div>
    <h3 className="text-white font-semibold text-lg mb-6">{title}</h3>
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.name}>
          <a href={link.href} className="text-gray-400 hover:text-nexa-primary transition-colors text-sm flex items-center group">
            <span className="w-0 group-hover:w-2 h-0.5 bg-nexa-primary mr-0 group-hover:mr-2 transition-all duration-300"></span>
            {link.name}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

// Componente para a coluna de contato
const ContactColumn: React.FC = () => {
  const contactInfo = [
    { icon: MapPin, text: ['Av. Paulista, 1000', 'São Paulo - SP'], href: 'https://www.google.com/maps/search/?api=1&query=Av.+Paulista,+1000', external: true },
    { icon: Phone, text: ['(11) 99999-9999'], href: 'tel:+5511999999999', external: false },
    { icon: Mail, text: ['contato@nexa.com.br'], href: 'mailto:contato@nexa.com.br', external: false }
  ];

  return (
    <div>
      <h3 className="text-white font-semibold text-lg mb-6">Contato</h3>
      <ul className="space-y-3">
        {contactInfo.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              target={item.external ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="flex items-start space-x-3 text-gray-400 hover:text-nexa-primary transition-colors group"
            >
              <item.icon size={18} className="text-nexa-primary/80 shrink-0 mt-0.5 group-hover:text-nexa-primary transition-colors" />
              <div>
                {item.text.map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Componente para a barra inferior do rodapé
const FooterBottom: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-gray-500 text-sm text-center md:text-left">
        &copy; {new Date().getFullYear()} Nexa Digital. Todos os direitos reservados.
      </p>
      <button
        onClick={scrollToTop}
        className="group flex items-center space-x-2 text-sm text-gray-400 hover:text-nexa-primary transition-colors px-4 py-2 rounded-full border border-white/10 hover:border-nexa-primary/50 hover:bg-white/5"
        aria-label="Voltar ao topo"
      >
        <span>Voltar ao topo</span>
        <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform" />
      </button>
    </div>
  );
};


// --- Componente Principal do Rodapé ---

const Footer: React.FC = () => {
  const quickLinks = [
    { name: 'Início', href: '#inicio' },
    { name: 'Serviços', href: '#servicos' },
    { name: 'Portfólio', href: '#portfolio' },
    { name: 'Planos', href: '#planos' },
    { name: 'Depoimentos', href: '#depoimentos' },
  ];

  const supportLinks = [
    { name: 'FAQ', href: '/faq' },
    { name: 'Termos de Uso', href: '/termos-de-uso' },
    { name: 'Política de Privacidade', href: '/politica-de-privacidade' },
    { name: 'Contato', href: '/contato' },
  ];

  return (
    <footer className="bg-nexa-card border-t border-white/5 pt-16 pb-8 relative overflow-hidden">
      {/* Elementos de fundo decorativos */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-nexa-primary/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-nexa-secondary/5 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <NewsletterSection />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          <BrandColumn />
          <FooterLinkColumn title="Links Rápidos" links={quickLinks} />
          <FooterLinkColumn title="Suporte" links={supportLinks} />
          <ContactColumn />
        </div>

        <FooterBottom />
      </div>
    </footer>
  );
};

export default Footer;