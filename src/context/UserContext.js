'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [chefName, setChefName] = useState('Chef');
    const [chefAvatar, setChefAvatar] = useState('Hat');
    const [chefImage, setChefImage] = useState(null);

    // Flavor DNA & Dietary Preferences
    const [dietary, setDietary] = useState([]);
    const [allergies, setAllergies] = useState('');
    const [cuisines, setCuisines] = useState([]);
    const [skillLevel, setSkillLevel] = useState('Intermediate');
    const [equipment, setEquipment] = useState([]);
    const [spiceTolerance, setSpiceTolerance] = useState('Medium');
    const [dislikes, setDislikes] = useState('');
    const [typicalTime, setTypicalTime] = useState('30-45');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedName = localStorage.getItem('rasoi_chef_name');
        const storedAvatar = localStorage.getItem('rasoi_chef_avatar');
        const storedImage = localStorage.getItem('rasoi_chef_image');

        // Load DNA
        const storedDietary = localStorage.getItem('rasoi_dietary');
        const storedAllergies = localStorage.getItem('rasoi_allergies');
        const storedCuisines = localStorage.getItem('rasoi_cuisines');
        const storedSkill = localStorage.getItem('rasoi_skill');
        const storedEquip = localStorage.getItem('rasoi_equipment');
        const storedSpice = localStorage.getItem('rasoi_spice');
        const storedDislikes = localStorage.getItem('rasoi_dislikes');
        const storedTime = localStorage.getItem('rasoi_typical_time');

        if (storedName) setChefName(storedName);
        if (storedAvatar) setChefAvatar(storedAvatar);
        if (storedImage) setChefImage(storedImage);

        if (storedDietary) setDietary(JSON.parse(storedDietary));
        if (storedAllergies) setAllergies(storedAllergies);
        if (storedCuisines) setCuisines(JSON.parse(storedCuisines));
        if (storedSkill) setSkillLevel(storedSkill);
        if (storedEquip) setEquipment(JSON.parse(storedEquip));
        if (storedSpice) setSpiceTolerance(storedSpice);
        if (storedDislikes) setDislikes(storedDislikes);
        if (storedTime) setTypicalTime(storedTime);

        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('rasoi_chef_name', chefName);
            localStorage.setItem('rasoi_chef_avatar', chefAvatar);
            if (chefImage) {
                localStorage.setItem('rasoi_chef_image', chefImage);
            } else {
                localStorage.removeItem('rasoi_chef_image');
            }

            // Save DNA
            localStorage.setItem('rasoi_dietary', JSON.stringify(dietary));
            localStorage.setItem('rasoi_allergies', allergies);
            localStorage.setItem('rasoi_cuisines', JSON.stringify(cuisines));
            localStorage.setItem('rasoi_skill', skillLevel);
            localStorage.setItem('rasoi_equipment', JSON.stringify(equipment));
            localStorage.setItem('rasoi_spice', spiceTolerance);
            localStorage.setItem('rasoi_dislikes', dislikes);
            localStorage.setItem('rasoi_typical_time', typicalTime);
        }
    }, [chefName, chefAvatar, chefImage, dietary, allergies, cuisines, skillLevel, equipment, spiceTolerance, dislikes, typicalTime, loading]);

    return (
        <UserContext.Provider value={{
            chefName,
            setChefName,
            chefAvatar,
            setChefAvatar,
            chefImage,
            setChefImage,
            dietary,
            setDietary,
            allergies,
            setAllergies,
            cuisines,
            setCuisines,
            skillLevel,
            setSkillLevel,
            equipment,
            setEquipment,
            spiceTolerance,
            setSpiceTolerance,
            dislikes,
            setDislikes,
            typicalTime,
            setTypicalTime,
            loading
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
