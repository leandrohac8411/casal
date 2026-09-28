import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export function userRef(uid) {
  return doc(db, "users", uid);
}

export async function createUserDoc(uid, { name, email }) {
  await setDoc(userRef(uid), {
    name,
    email,
    createdAt: serverTimestamp(),
    onboardingComplete: false,
    coupleId: null,
  });
}

export async function getUserDoc(uid) {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? snap.data() : null;
}

export function subscribeUserDoc(uid, callback) {
  return onSnapshot(userRef(uid), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export async function saveOnboarding(uid, data) {
  await updateDoc(userRef(uid), {
    ...data,
    onboardingComplete: true,
  });
}

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createCoupleInvite(uid) {
  const code = randomCode();
  const ref = doc(collection(db, "couples"));
  await setDoc(ref, {
    ownerUid: uid,
    memberUids: [uid],
    inviteCode: code,
    createdAt: serverTimestamp(),
  });
  await updateDoc(userRef(uid), { coupleId: ref.id });
  return { coupleId: ref.id, code };
}

export async function joinCoupleByCode(uid, code) {
  const q = query(collection(db, "couples"), where("inviteCode", "==", code.toUpperCase().trim()));
  const results = await getDocs(q);
  if (results.empty) throw new Error("Código não encontrado.");
  const coupleDoc = results.docs[0];
  if (coupleDoc.data().memberUids.includes(uid)) {
    return { coupleId: coupleDoc.id };
  }
  if (coupleDoc.data().memberUids.length >= 2) {
    throw new Error("Esse código já tem dois participantes.");
  }
  await updateDoc(coupleDoc.ref, { memberUids: arrayUnion(uid) });
  await updateDoc(userRef(uid), { coupleId: coupleDoc.id });
  return { coupleId: coupleDoc.id };
}

function compressImage(file, maxSize = 360, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadProfilePhoto(personKey, file) {
  const url = await compressImage(file);
  if (url.length > 900000) throw new Error("Imagem grande demais mesmo comprimida.");
  await setDoc(doc(db, "profilePhotos", personKey), { url, updatedAt: serverTimestamp() });
  return url;
}

export function subscribeProfilePhotos(callback) {
  return onSnapshot(collection(db, "profilePhotos"), (snap) => {
    const map = {};
    snap.forEach((d) => {
      map[d.id] = d.data().url;
    });
    callback(map);
  });
}
