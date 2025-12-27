import React from 'react';
import { Github, Linkedin, ExternalLink, Code, User, Mail, Globe } from 'lucide-react';
import { useLanguage, Language } from '@/Pages/contexts/LanguageContext';

// --- DADOS E TRADUÇÕES ---
const TRANSLATIONS = {
  pt: {
    role: "Desenvolvedor Full Stack",
    bioTitle: "Sobre Mim",
    bioDescription: "Sou apaixonado por criar experiências digitais impactantes. Com especialização em React, Node.js e arquitetura de software, transformo ideias complexas em código limpo e eficiente.",
    projectsTitle: "Projetos Recentes",
    projectsBio: "Cada projeto é uma jornada única de resolução de problemas. Aqui estão algumas das soluções completas que desenvolvi, focando em escalabilidade, performance e experiência do usuário.",
    skillsTitle: "Habilidades Técnicas",
    skillsBio: "Minha caixa de ferramentas está em constante evolução. Domino as tecnologias mais modernas do mercado para entregar aplicações robustas e ágeis.",
    contactTitle: "Vamos Conversar?",
    contactBio: "Estou sempre aberto a novos desafios e parcerias. Se você tem uma ideia inovadora ou precisa de ajuda técnica, entre em contato.",
    viewCode: "Código",
    viewDemo: "Demo",
    sendEmail: "Enviar Email"
  },
  en: {
    role: "Full Stack Developer",
    bioTitle: "About Me",
    bioDescription: "I am passionate about creating impactful digital experiences. Specializing in React, Node.js, and software architecture, I transform complex ideas into clean, efficient code.",
    projectsTitle: "Recent Projects",
    projectsBio: "Each project is a unique problem-solving journey. Here are some of the full-stack solutions I've developed, focusing on scalability, performance, and user experience.",
    skillsTitle: "Technical Skills",
    skillsBio: "My toolbox is constantly evolving. I master the most modern technologies in the market to deliver robust and agile applications.",
    contactTitle: "Let's Talk?",
    contactBio: "I am always open to new challenges and partnerships. If you have an innovative idea or need technical help, get in touch.",
    viewCode: "Code",
    viewDemo: "Demo",
    sendEmail: "Send Email"
  },
  es: {
    role: "Desarrollador Full Stack",
    bioTitle: "Sobre Mí",
    bioDescription: "Me apasiona crear experiencias digitales impactantes. Especializado en React, Node.js y arquitectura de software, transformo ideas complejas en código limpio y eficiente.",
    projectsTitle: "Proyectos Recientes",
    projectsBio: "Cada proyecto es un viaje único de resolución de problemas. Aquí hay algunas de las soluciones completas que he desarrollado, enfocándome en escalabilidad, rendimiento y experiencia de usuario.",
    skillsTitle: "Habilidades Técnicas",
    skillsBio: "Mi caja de herramientas está en constante evolución. Domino las tecnologías más modernas del mercado para entregar aplicaciones robustas y ágiles.",
    contactTitle: "¿Hablamos?",
    contactBio: "Siempre estoy abierto a nuevos desafíos y colaboraciones. Si tienes una idea innovadora o necesitas ayuda técnica, contáctame.",
    viewCode: "Código",
    viewDemo: "Demo",
    sendEmail: "Enviar Correo"
  }
};

const USER_DATA = {
  name: "Ryan Grillo",
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  email: "mailto:seuemail@exemplo.com",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop"
};

const PROJECTS = [
  {
    id: 1,
    title: "Nexa Landing Page",
    description: {
      pt: "Uma plataforma de alta conversão com sistema de pagamentos integrado via Stripe e autenticação segura.",
      en: "A high-conversion platform with integrated Stripe payment system and secure authentication.",
      es: "Una plataforma de alta conversión con sistema de pagos integrado vía Stripe y autenticación segura."
    },
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    tags: ["React", "TypeScript", "Node.js", "Stripe", "Tailwind CSS", "MongoDB"],
    link: "#",
    github: "#"
  },
  {
    id: 2,
    title: "Dashboard Financeiro",
    description: {
      pt: "Aplicação para gestão financeira pessoal com gráficos interativos e relatórios em tempo real.",
      en: "Personal financial management application with interactive charts and real-time reports.",
      es: "Aplicación para gestión financiera personal con gráficos interactivos e informes en tiempo real."
    },
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    tags: ["React", "TypeScript", "Recharts", "Firebase"],
    link: "#",
    github: "#"
  },
  {
    id: 3,
    title: "E-commerce Mobile",
    description: {
      pt: "App mobile desenvolvido com React Native focado em experiência do usuário e performance.",
      en: "Mobile app developed with React Native focused on user experience and performance.",
      es: "App móvil desarrollada con React Native enfocada en experiencia de usuario y rendimiento."
    },
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop",
    tags: ["React Native", "Redux", "API REST"],
    link: "#",
    github: "#"
  }
];

const Portfolio: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 animate-fade-in transition-colors duration-300">
      
      {/* Controles Flutuantes (Para teste/uso direto) */}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-2">
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {(['pt', 'en', 'es'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`p-2 text-xs font-bold uppercase ${language === lang ? 'bg-nexa-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* --- SEÇÃO DE BIOGRAFIA --- */}
        <section className="flex flex-col md:flex-row items-center gap-10 bg-white dark:bg-nexa-card/50 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl transition-colors duration-300">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-nexa-primary to-blue-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <img 
              src={USER_DATA.avatarUrl} 
              alt={`Foto de perfil de ${USER_DATA.name}`} 
              className="relative w-48 h-48 rounded-full object-cover border-4 border-gray-800 shadow-2xl"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              {USER_DATA.name}
            </h1>
            <h2 className="text-xl text-blue-600 dark:text-nexa-primary font-medium flex items-center justify-center md:justify-start gap-2">
              <Code className="w-5 h-5" /> {t.role}
            </h2>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 pt-2">{t.bioTitle}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-2xl">
              {t.bioDescription}
            </p>
            
            <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
              <a href={USER_DATA.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-all">
                <Github className="w-6 h-6" />
              </a>
              <a href={USER_DATA.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-blue-600 hover:text-white text-gray-800 dark:text-white transition-all">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href={USER_DATA.email} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-nexa-primary hover:text-white text-gray-800 dark:text-white transition-all">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </section>

        {/* --- SEÇÃO DE PROJETOS --- */}
        <section>
          <div className="mb-8 space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-nexa-primary rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.projectsTitle}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
              {t.projectsBio}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROJECTS.map((project) => (
              <div key={project.id} className="group bg-white dark:bg-nexa-card rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-nexa-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-nexa-primary/10 flex flex-col">
                
                {/* Imagem do Projeto */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Conteúdo do Card */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-nexa-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">
                    {project.description[language]}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-nexa-primary rounded-md border border-gray-200 dark:border-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <a href={project.github} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <Github className="w-4 h-4" /> {t.viewCode}
                    </a>
                    <a href={project.link} className="flex items-center gap-2 text-sm text-blue-600 dark:text-nexa-primary hover:text-blue-500 dark:hover:text-cyan-300 font-medium transition-colors">
                      {t.viewDemo} <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- SEÇÃO DE HABILIDADES (NOVA) --- */}
        <section className="bg-white dark:bg-nexa-card/30 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.skillsTitle}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t.skillsBio}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['React', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Docker', 'AWS', 'Git'].map((skill) => (
              <div key={skill} className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">
                {skill}
              </div>
            ))}
          </div>
        </section>

        {/* --- SEÇÃO DE CONTATO (NOVA) --- */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t.contactTitle}</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            {t.contactBio}
          </p>
          <a 
            href={USER_DATA.email}
            className="inline-flex items-center gap-2 px-8 py-3 bg-nexa-primary text-white rounded-full font-bold hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
          >
            <Mail className="w-5 h-5" /> {t.sendEmail}
          </a>
        </section>

      </div>
    </div>
  );
};

export default Portfolio;