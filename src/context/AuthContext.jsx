import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Use getDoc instead of onSnapshot for faster initial load
          const docSnapshot = await getDoc(doc(db, "users", user.uid));
          if (docSnapshot.exists()) {
            setUserData(docSnapshot.data());
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Function to manually set user data (useful after registration)
  const setUserDataManually = useCallback((data) => {
    setUserData(data);
  }, []);

  const value = useMemo(() => ({
    currentUser,
    userData,
    userRole: userData?.role || null,
    loading,
    setUserDataManually,
  }), [currentUser, userData, loading, setUserDataManually]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
