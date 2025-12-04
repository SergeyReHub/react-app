import React, { useState, useEffect, useRef } from 'react';
import './view_360_page.css'
import Dialog from './photo_sphere_dialod/Dialog';
import ProjectsSection from './project_section/ProjectsSection';
import MainSection from './main_section/MainSection';
import '@photo-sphere-viewer/core/index.css';           // основной стиль (иногда нужен)
import '@photo-sphere-viewer/markers-plugin/index.css'; // маркеры (стрелки)
import '@photo-sphere-viewer/gallery-plugin/index.css'; // галерея
import '@photo-sphere-viewer/virtual-tour-plugin/index.css'; // 🔥 критично для hotspots и карты

import { useNavigate } from 'react-router-dom';



export default function View_360_Page() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const touchStartY = useRef(0);
  const containerRef = useRef(null);
  const [activeSection, setActiveSection] = useState('main'); // 'main' | 'projects'
  const [isAtTop, setIsAtTop] = useState(false);
  const topHoldTimer = useRef(null); // для clearTimeout

  const [scrollImpulseCount, setScrollImpulseCount] = useState(0);
  const scrollImpulseTimer = useRef(null);

  const [pullUpActive, setPullUpActive] = useState(false); // активно ли "натяжение"
  const pullUpTimer = useRef(null);
  const pullUpThreshold = 50; // px — порог активации натяжения
  const touchStartScrollTop = useRef(0);

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/'); // программный переход на корень
  };

  const handleWheel = (e) => {
    if (selectedProject || !containerRef.current) return;

    const { scrollTop } = containerRef.current;

    if (activeSection === 'projects') {
      const isAtTop = scrollTop <= 1;

      if (e.deltaY < 0 && isAtTop) {
        e.preventDefault();

        if (!pullUpActive) {
          setPullUpActive(true);
        }

        if (pullUpTimer.current) {
          clearTimeout(pullUpTimer.current);
        }

        pullUpTimer.current = setTimeout(() => {
          pullUpTimer.current = null;
          if (pullUpActive && containerRef.current?.scrollTop <= 1) {
            setActiveSection('main');
            setPullUpActive(false);
            setTimeout(() => {
              if (containerRef.current) containerRef.current.scrollTop = 0;
            }, 300);
          }
        }, 1000);

      } else {
        // Сброс при скролле вниз или уходе с верха
        if (pullUpActive) setPullUpActive(false);
        if (pullUpTimer.current) clearTimeout(pullUpTimer.current);
      }

    } else if (activeSection === 'main' && e.deltaY > 0) {
      e.preventDefault();
      setActiveSection('projects');
      setPullUpActive(false);
      if (pullUpTimer.current) clearTimeout(pullUpTimer.current);
      setTimeout(() => {
        if (containerRef.current) containerRef.current.scrollTop = 0;
      }, 300);
    }
  };

  useEffect(() => {
    return () => {
      if (scrollImpulseTimer.current) {
        clearTimeout(scrollImpulseTimer.current);
      }
    };
  }, []);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    // 🔹 Важно: запоминаем scrollTop в момент старта свайпа
    if (containerRef.current && activeSection === 'projects') {
      touchStartScrollTop.current = containerRef.current.scrollTop;
    }
  };


  const handleTouchMove = (e) => {
    if (selectedProject || !containerRef.current) return;

    const touchY = e.touches[0].clientY;
    const currentScrollTop = containerRef.current.scrollTop;
    const diff = touchStartY.current - touchY; // >0: свайп вверх (контент — вниз)
    const isAtTop = currentScrollTop <= 1;

    if (activeSection === 'projects') {
      // 🔁 Сброс, если:
      // — ушли с верха
      // — или свайп не вниз (не "натяжение")
      if (!isAtTop || diff >= 0) { // diff >= 0 → свайп вверх или статика
        if (pullUpActive) setPullUpActive(false);
        if (pullUpTimer.current) {
          clearTimeout(pullUpTimer.current);
          pullUpTimer.current = null;
        }
        return; // ← разрешаем естественный скролл вниз и внутри
      }

      // ✅ Правильное условие: свайп ВНИЗ (diff < 0), и мы наверху
      if (diff < -pullUpThreshold && isAtTop) {
        e.preventDefault(); // блокируем увод фона/резинку

        if (!pullUpActive) {
          setPullUpActive(true);
        }

        // Перезапускаем таймер
        if (pullUpTimer.current) {
          clearTimeout(pullUpTimer.current);
        }

        pullUpTimer.current = setTimeout(() => {
          pullUpTimer.current = null;
          if (pullUpActive && containerRef.current?.scrollTop <= 1) {
            setActiveSection('main');
            setPullUpActive(false);
            setTimeout(() => {
              if (containerRef.current) containerRef.current.scrollTop = 0;
            }, 300);
          }
        }, 1000);
      }

    } else if (activeSection === 'main') {
      // main → projects: свайп ВВЕРХ (листаем контент вниз) → diff > threshold
      if (diff > pullUpThreshold) {
        e.preventDefault();
        setActiveSection('projects');
        setPullUpActive(false);
        if (pullUpTimer.current) clearTimeout(pullUpTimer.current);
        setTimeout(() => {
          if (containerRef.current) containerRef.current.scrollTop = 0;
        }, 300);
      }
    }
  };

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');

        // 🔍 DEBUG: inspect raw response
        const text = await res.text();
        console.log('Raw response:', text);
        console.log('Response status:', res.status);
        console.log('Content-Type:', res.headers.get('content-type'));

        if (res.ok) {
          // Now try to parse as JSON
          let data;
          try {
            data = JSON.parse(text);
            setProjects(data);// ← safer: we already have text
            setError(null);
          } catch (parseErr) {
            setProjects(
              [{
                id: 1,
                title: "Office Tour",
                description: "asdfhj",
                nodes: [
                  {
                    id: 1,
                    panorama: "/images/panoramnie-kartinki-4.jpg",
                    thumbnail: "/images/panoramnie-kartinki-4.jpg",
                    name: "Lobby",
                    caption: "[1] Main entrance",
                    links: [{ nodeId: 2 }],
                    gps: [55.7815, 37.6759, 1],
                    sphereCorrection: { pan: "33deg" }
                  },
                  {
                    id: 2,
                    panorama: "/images/panoramnie-kartinki-4.jpg",
                    thumbnail: "/images/panoramnie-kartinki-4.jpg",
                    name: "Hallway",
                    caption: "[2] Corridor to offices",
                    links: [{ nodeId: 1 }, { nodeId: 3 }],
                    gps: [55.7816, 37.6760, 1],
                    sphereCorrection: { pan: "66deg" }
                  },
                  {
                    id: 3,
                    panorama: "/images/panoramnie-kartinki-4.jpg",
                    thumbnail: "/images/panoramnie-kartinki-4.jpg",
                    name: "Office",
                    caption: "[3] Open workspace",
                    links: [{ nodeId: 2 }],
                    gps: [55.7817, 37.6761, 1],
                    sphereCorrection: { pan: "99deg" }
                  }
                ]
              },
              {
                id: 1,
                title: "Office Tour",
                description: "asdfhj",
                nodes: [
                  {
                    id: 1,
                    panorama: "/images/panoramnie-kartinki-4.jpg",
                    thumbnail: "/images/panoramnie-kartinki-4.jpg",
                    name: "Lobby",
                    caption: "[1] Main entrance",
                    links: [{ nodeId: 2 }],
                    gps: [55.7815, 37.6759, 1],
                    sphereCorrection: { pan: "33deg" }
                  },
                  {
                    id: 2,
                    panorama: "/images/panoramnie-kartinki-4.jpg",
                    thumbnail: "/images/panoramnie-kartinki-4.jpg",
                    name: "Hallway",
                    caption: "[2] Corridor to offices",
                    links: [{ nodeId: 1 }, { nodeId: 3 }],
                    gps: [55.7816, 37.6760, 1],
                    sphereCorrection: { pan: "66deg" }
                  },
                  {
                    id: 3,
                    panorama: "/images/panoramnie-kartinki-4.jpg",
                    thumbnail: "/images/panoramnie-kartinki-4.jpg",
                    name: "Office",
                    caption: "[3] Open workspace",
                    links: [{ nodeId: 2 }],
                    gps: [55.7817, 37.6761, 1],
                    sphereCorrection: { pan: "99deg" }
                  }
                ]
              },
              {
                id: 1,
                title: "Office Tour",
                description: "asdfhj",
                nodes: [
                  {
                    id: 1,
                    panorama: "/images/panoramnie-kartinki-4.jpg",
                    thumbnail: "/images/panoramnie-kartinki-4.jpg",
                    name: "Lobby",
                    caption: "[1] Main entrance",
                    links: [{ nodeId: 2 }],
                    gps: [55.7815, 37.6759, 1],
                    sphereCorrection: { pan: "33deg" }
                  },
                  {
                    id: 2,
                    panorama: "/images/panoramnie-kartinki-4.jpg",
                    thumbnail: "/images/panoramnie-kartinki-4.jpg",
                    name: "Hallway",
                    caption: "[2] Corridor to offices",
                    links: [{ nodeId: 1 }, { nodeId: 3 }],
                    gps: [55.7816, 37.6760, 1],
                    sphereCorrection: { pan: "66deg" }
                  },
                  {
                    id: 3,
                    panorama: "/images/panoramnie-kartinki-4.jpg",
                    thumbnail: "/images/panoramnie-kartinki-4.jpg",
                    name: "Office",
                    caption: "[3] Open workspace",
                    links: [{ nodeId: 2 }],
                    gps: [55.7817, 37.6761, 1],
                    sphereCorrection: { pan: "99deg" }
                  }
                ]
              }
              ]
            );
            setError(`Invalid JSON response: ${parseErr.message}. Raw: ${text.substring(0, 200)}`);
          }

        } else {
          // fallback
          setProjects(
            [{
              id: 1,
              title: "Office Tour",
              description: "asdfhj",
              nodes: [
                {
                  id: 1,
                  panorama: "/images/panoramnie-kartinki-4.jpg",
                  thumbnail: "/images/panoramnie-kartinki-4.jpg",
                  name: "Lobby",
                  caption: "[1] Main entrance",
                  links: [{ nodeId: 2 }],
                  gps: [55.7815, 37.6759, 1],
                  sphereCorrection: { pan: "33deg" }
                },
                {
                  id: 2,
                  panorama: "/images/panoramnie-kartinki-4.jpg",
                  thumbnail: "/images/panoramnie-kartinki-4.jpg",
                  name: "Hallway",
                  caption: "[2] Corridor to offices",
                  links: [{ nodeId: 1 }, { nodeId: 3 }],
                  gps: [55.7816, 37.6760, 1],
                  sphereCorrection: { pan: "66deg" }
                },
                {
                  id: 3,
                  panorama: "/images/panoramnie-kartinki-4.jpg",
                  thumbnail: "/images/panoramnie-kartinki-4.jpg",
                  name: "Office",
                  caption: "[3] Open workspace",
                  links: [{ nodeId: 2 }],
                  gps: [55.7817, 37.6761, 1],
                  sphereCorrection: { pan: "99deg" }
                }
              ]
            }
            ]
          );
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const openProject = (project) => {
    setSelectedProject(project);
  };

  const closeProject = () => {
    setSelectedProject(null);
  };






  if (loading) return <div className='loadingContainer'><p className='loading'>Loading projects...</p></div>;

  return (
    <div className="view_360_page"
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{ touchAction: 'none' }}
    >
      <div className='global-header'>
        <span className="brand"
          onClick={handleClick}>
          <span style={{ color: 'rgba(253, 69, 69, 0.58)' }}>M</span>
          <span style={{ color: 'rgba(253, 253, 253, 1)' }}>.</span>
          <span style={{ color: 'rgba(200, 200, 200, 1)' }}>GROUP</span>
        </span>
      </div>

      <MainSection isActive={activeSection === 'main'} />
      <ProjectsSection
        isActive={activeSection === 'projects'}
        projects={projects}
        openProject={openProject}
      />
      {/* Modal / Dialog */}
      {selectedProject && (
        <Dialog
          project={selectedProject}
          onClose={closeProject}
        />
      )}
    </div>
  );
}