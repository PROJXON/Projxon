import React, { useState, useEffect, useRef } from 'react';
import { fetchClients, addClient, deleteClient } from '../services/clientService';
import './TestimonialEditorPage.css';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/loginService';
import ImageUpload from '../components/ImageUpload';

const TestimonialEditorPage = () => {
  const [clients, setClients] = useState([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [newTestimonial, setNewTestimonial] = useState({ image: '', quote: '', name: '', title: '' });
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const authToken = localStorage.getItem('authToken');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const loadClients = async () => {
      const response = await fetchClients();
      setClients(response);
    };
    loadClients();
  }, []);

  const getCurrentClient = () => {
    if (clients.length === 0) {
      return { image: '', quote: 'No testimonials available.', name: '', title: '' };
    }
    return clients[currentTestIndex];
  };

  const handlePrev = () => {
    if (clients.length > 0) {
      setCurrentTestIndex((prevIndex) => (prevIndex - 1 + clients.length) % clients.length);
    }
  };

  const handleNext = () => {
    if (clients.length > 0) {
      setCurrentTestIndex((prevIndex) => (prevIndex + 1) % clients.length);
    }
  };

  const handleDelete = async () => {
    if (clients.length === 0) return;

    const clientId = clients[currentTestIndex].id;

    try {
      const success = await deleteClient(clientId);
      if (success) {
        const updatedClients = await fetchClients();
        setClients(updatedClients);
        setCurrentTestIndex(Math.max(0, currentTestIndex - 1)); 
      }
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const handleInputChange = (e) => {
    setNewTestimonial({ ...newTestimonial, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!newTestimonial.image || !newTestimonial.quote || !newTestimonial.name || !newTestimonial.title) {
      alert("Please fill out relevant fields before adding a new entry.");
      return;
    }

    const addedClient = await addClient(newTestimonial);

    if (addedClient && addedClient.id) {
      const updatedClients = await fetchClients();
      setClients(updatedClients);
      setCurrentTestIndex(updatedClients.length - 1); 
      setNewTestimonial({ image: '', quote: '', name: '', title: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  const handleImageUpload = (imageUrl) => {
    setNewTestimonial((prevTestimonial) => ({
      ...prevTestimonial,
      image: imageUrl,
    }));
  };

  return (
    <div className="testimonial-editor">
      <h1>Testimonial Carousel Editor</h1>
      <div className="testimonial-carousel">
        <div className="testimonial">
          <img className="image" src={getCurrentClient().image} alt="Client" />
          <span className="quote">{getCurrentClient().quote}</span>
          <span className="name">{getCurrentClient().name}</span>
          <span className="title">{getCurrentClient().title}</span>
        </div>
        <button id="leftButton" onClick={handlePrev}>Left</button>
        <button id="rightButton" onClick={handleNext}>Right</button>
        <button id="deleteButton" onClick={handleDelete}>Delete Current Entry</button>
      </div>

      <ImageUpload authToken={authToken} onUploadSuccess={handleImageUpload} ref={fileInputRef}/>
      <textarea name="quote" value={newTestimonial.quote} onChange={handleInputChange} placeholder="Quote"></textarea>
      <textarea name="name" value={newTestimonial.name} onChange={handleInputChange} placeholder="Name"></textarea>
      <textarea name="title" value={newTestimonial.title} onChange={handleInputChange} placeholder="Title"></textarea>
      <div className="buttons">
        <button id="addButton" onClick={handleAdd}>Add Entry</button>
        <button id="logoutButton" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default TestimonialEditorPage;
