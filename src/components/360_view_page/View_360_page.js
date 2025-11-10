import React, { useState, useEffect } from 'react';
import './view_360_page.css'
import Dialog from './photo_sphere_dialod/Dialog';
import '@photo-sphere-viewer/core/index.css';           // основной стиль (иногда нужен)
import '@photo-sphere-viewer/markers-plugin/index.css'; // маркеры (стрелки)
import '@photo-sphere-viewer/gallery-plugin/index.css'; // галерея
import '@photo-sphere-viewer/virtual-tour-plugin/index.css'; // 🔥 критично для hotspots и карты

// Optional: simple modal styling
const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.9)',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export default function View_360_Page() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="view_360_page">
      <h1>Our Projects</h1>
      <div className='project-list'>
        {projects.map((project) => (
          <div
            className='project'
            key={project.id}
            onClick={() => openProject(project)}
          >
            <h3>{project.title}</h3>
            <p>{project.caption}</p>
            <img src={project.nodes[0].panorama}></img>
          </div>
        ))}

      </div>

      {/* Modal / Dialog */}
      {selectedProject && (
        <Dialog
          project={selectedProject}
          onClose={closeProject}
        />
      )}
      <p>{error}</p>
    </div>
  );
}