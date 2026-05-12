import { createContext, useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

const SocketContext = createContext();

const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    if (user && !socketRef.current) {
      socketRef.current = io(ENDPOINT, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.emit("setup", user);

      socketRef.current.on("connected", () => {
        setSocketConnected(true);
        console.log("Socket connected");
      });

      socketRef.current.on("disconnect", () => {
        setSocketConnected(false);
        console.log("Socket disconnected");
      });
    }

    return () => {
      if (socketRef.current) {
        // socketRef.current.disconnect();
        // socketRef.current = null;
      }
    };
  }, [user]);

  // Clean up on unmount or logout
  useEffect(() => {
    if (!user && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    }
  }, [user]);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, socketConnected }}
    >
      {children}
    </SocketContext.Provider>
  );
};
