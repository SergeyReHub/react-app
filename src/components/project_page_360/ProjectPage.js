// ProjectDetailView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Dialog from '../360_view_page/photo_sphere_dialod/Dialog';


import './project_page.css'; // по желанию

export default function ProjectPage() {
    const { id } = useParams(); // ← получаем id из URL
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openedPSV, setOpenedPSV] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/projects/${id}`);

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
                        setProject(data);// ← safer: we already have text
                        setError(null);
                    } catch (parseErr) {
                        setProject(
                            {
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
                        );
                        setError(`Invalid JSON response: ${parseErr.message}. Raw: ${text.substring(0, 200)}`);
                    }

                } else {
                    // fallback
                    setProject(
                        [{
                            id: 1,
                            title: "Office Tour",
                            description: "asdfhj",
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
        fetchProject();
    }, [id]);

    const closeDialog = () => {
        setOpenedPSV(false);
    };
    const openProject = () => {
        setOpenedPSV(true);
    }

    if (loading) return <div>Loading...</div>;
    if (!project) return <div>No project found.</div>;

    return (
        <div className="project-page">
            <h1>{project.title}</h1>
            <p>{project.description}</p>
            <button onClick={openProject}>Open 360° View</button>
            {openedPSV && (
                <Dialog
                    project={project}
                    onClose={closeDialog}
                />
            )}
        </div>
    );
}