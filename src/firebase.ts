import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, remove, get, push, query, orderByChild, equalTo } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, type User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyATtpxLN_5Vai1bDn3m_TSEFVSog8C-WKY",
  authDomain: "dotadraftarena.firebaseapp.com",
  databaseURL: "https://dotadraftarena-default-rtdb.firebaseio.com",
  projectId: "dotadraftarena",
  storageBucket: "dotadraftarena.firebasestorage.app",
  messagingSenderId: "838341821217",
  appId: "1:838341821217:web:c1d7794a8e670e5a553460",
  measurementId: "G-0GGWVHG9B0"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// ========== AUTH ==========
export const registerUser = async (email: string, password: string, displayName: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  // Create user profile in DB
  await set(ref(db, `users/${cred.user.uid}`), {
    displayName,
    email,
    createdAt: Date.now(),
    stats: { wins: 0, losses: 0, draws: 0 },
    friends: {},
  });
  return cred.user;
};

export const loginUser = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

export const onAuthChange = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb);

// ========== USER PROFILE ==========
export const getUserProfile = async (uid: string) => {
  const snap = await get(ref(db, `users/${uid}`));
  return snap.val();
};

export const updateUserStats = async (uid: string, result: 'win' | 'loss' | 'draw') => {
  const snap = await get(ref(db, `users/${uid}/stats`));
  const stats = snap.val() || { wins: 0, losses: 0, draws: 0 };
  if (result === 'win') stats.wins++;
  else if (result === 'loss') stats.losses++;
  else stats.draws++;
  await set(ref(db, `users/${uid}/stats`), stats);
};

// ========== FRIENDS ==========
export const sendFriendRequest = async (fromUid: string, toUid: string) => {
  await set(ref(db, `friendRequests/${toUid}/${fromUid}`), {
    from: fromUid,
    timestamp: Date.now(),
  });
};

export const acceptFriendRequest = async (myUid: string, friendUid: string) => {
  await set(ref(db, `users/${myUid}/friends/${friendUid}`), true);
  await set(ref(db, `users/${friendUid}/friends/${myUid}`), true);
  await remove(ref(db, `friendRequests/${myUid}/${friendUid}`));
};

export const searchUsers = async (searchName: string) => {
  const snap = await get(ref(db, 'users'));
  const users = snap.val();
  if (!users) return [];
  return Object.entries(users)
    .filter(([_, data]: [string, any]) =>
      data.displayName?.toLowerCase().includes(searchName.toLowerCase())
    )
    .map(([uid, data]: [string, any]) => ({ uid, ...data }))
    .slice(0, 10);
};

// ========== ROOMS ==========
export const createRoom = async (roomId: string, data: object) => {
  await set(ref(db, `rooms/${roomId}`), data);
};

export const joinRoom = async (roomId: string, playerData: object) => {
  await update(ref(db, `rooms/${roomId}`), playerData);
};

export const updateRoom = async (roomId: string, data: object) => {
  await update(ref(db, `rooms/${roomId}`), data);
};

export const subscribeToRoom = (roomId: string, cb: (data: any) => void) => {
  const roomRef = ref(db, `rooms/${roomId}`);
  return onValue(roomRef, (snap) => cb(snap.val()));
};

export const deleteRoom = async (roomId: string) => {
  await remove(ref(db, `rooms/${roomId}`));
};

// ========== MATCH HISTORY ==========
export const saveMatchResult = async (matchData: object) => {
  const matchRef = push(ref(db, 'matches'));
  await set(matchRef, { ...matchData, timestamp: Date.now() });
  return matchRef.key;
};

export const getUserMatches = async (uid: string) => {
  const snap = await get(ref(db, 'matches'));
  const all = snap.val();
  if (!all) return [];
  return Object.entries(all)
    .filter(([_, m]: [string, any]) => m.player1Uid === uid || m.player2Uid === uid)
    .map(([id, m]: [string, any]) => ({ id, ...m }))
    .sort((a: any, b: any) => b.timestamp - a.timestamp);
};
