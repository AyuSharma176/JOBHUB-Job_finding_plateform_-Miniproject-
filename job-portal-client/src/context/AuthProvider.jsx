/* eslint-disable react/prop-types */
import React from 'react';
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL;

    const createUser = async (email, password, name) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/register`, {
                email,
                password,
                name
            });
            if (response.data.token) {
                localStorage.setItem('genius-token', response.data.token);
                setUser(response.data.user);
            }
            return response.data;
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password
            });
            if (response.data.token) {
                localStorage.setItem('genius-token', response.data.token);
                setUser(response.data.user);
            }
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const createCompanyUser = async (email, password, name) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/company/register`, {
                email,
                password,
                name
            });
            if (response.data.token) {
                localStorage.setItem('genius-token', response.data.token);
                setUser(response.data.user);
            }
            return response.data;
        } catch (error) {
            console.error('Company sign up error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const companyLogin = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/company/login`, {
                email,
                password
            });
            if (response.data.token) {
                localStorage.setItem('genius-token', response.data.token);
                setUser(response.data.user);
            }
            return response.data;
        } catch (error) {
            console.error('Company login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const logOut = () => {
        localStorage.removeItem('genius-token');
        setUser(null);
    }

    useEffect(() => {
        const token = localStorage.getItem('genius-token');
        if (token) {
            // Verify token with backend
            axios.get(`${API_URL}/verify-token`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                setUser(response.data.user);
                setLoading(false);
            })
            .catch(() => {
                localStorage.removeItem('genius-token');
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [])

    const authInfo = {
        user, 
        loading,
        createUser, 
        createCompanyUser,
        login, 
        companyLogin,
        logOut
    }

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;