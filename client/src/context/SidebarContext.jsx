import { createContext, useContext, useState, useCallback } from 'react';

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = useCallback(() => setIsOpen((v) => !v), []);
    const close = useCallback(() => setIsOpen(false), []);
    return (
        <SidebarContext.Provider value={{ isOpen, toggle, close, setIsOpen }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => useContext(SidebarContext);
