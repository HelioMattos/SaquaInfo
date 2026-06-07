import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';

export function useRole() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().role === 'admin') {
          setIsAdmin(true);
        }
      }
      setLoadingRole(false);
    };

    checkRole();
  }, []);

  return { isAdmin, loadingRole };
}