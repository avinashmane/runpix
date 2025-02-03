import { signInWithEmailAndPassword,GoogleAuthProvider, signInWithRedirect,signInWithPopup, createUserWithEmailAndPassword, signOut , updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { collection, doc, getDocs, getDoc, setDoc, onSnapshot  } from "firebase/firestore"; 
import { config } from "../config";
import {debug} from "../helpers"
import { firebaseAuth, db } from '../../firebase/config';

export const getUser = () => {
    try {
        return firebaseAuth.currentUser;
    } catch (error) {
        throw error;
    }
}

export const getUserObservable = () => {
    try {
        firebaseAuth.onAuthStateChanged(
            (user) => {
                debug('firebaseAuth.onAuthStateChanged()')
                return user;
            }
        );
    } catch (error) {
        throw error;
    }
}

export const reAuthenticate = (password) => reauthenticateWithCredential(firebaseAuth.currentUser, EmailAuthProvider.credential(firebaseAuth.currentUser.email, password))
    .then(
        (user) => {
            debug(user);
            return user;
        }
    ).catch(
        (error) => {
            debug(error);
            throw error;
        }
    );

export const signIn = (email, password) => signInWithEmailAndPassword(firebaseAuth, email, password)
    .then((userCredential) => {
        return userCredential.user;
    })
    .catch((error) => {
        throw error.code;
    })

/**
 * ```javascript
 * // Sign in using a popup.
 * const provider = new GoogleAuthProvider();
 * provider.addScope('profile');
 * provider.addScope('email');
 * const result = await signInWithPopup(auth, provider);
 *
 * // The signed-in user info.
 * const user = result.user;
 * // This gives you a Google Access Token.
 * const credential = GoogleAuthProvider.credentialFromResult(result);
 * const token = credential.accessToken;
 * ```
 */    

export const signInGoogle = () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    // signInWithRedirect(firebaseAuth, provider)
    return signInWithPopup(firebaseAuth, provider).then((userCredential) => {
        debug(`logging in ${userCredential.user.email}`)
        return userCredential.user;
    })
    .catch((error) => {
        console.error(error)
        throw error.code;
    })
    // debugger;
}

export const register = (email, password) => createUserWithEmailAndPassword(firebaseAuth, email, password)
    .then((userCredential) => {
        return userCredential.user;
    })
    .catch((error) => {
        throw error.code;
    })

export const logOut = () => signOut(firebaseAuth)
    .then(() => {
        return true;
    })
    .catch((error) => {
        throw error;
    })

export const changePassword = (password) => {
    const user = firebaseAuth.currentUser;
    return updatePassword(user, password)
        .then(() => {
            return true;
        })
        .catch((error) => {
            debug(error);
            throw error;
        })
}

export const getRaces = () => {
    const racesRef = collection(db, "races");
    return getDocs(racesRef).then(docSnap=> {
            let dat= docSnap.docs.map(x=>{
                        let o=x.data();
                        o['id']=x.id;
                        return o})
            return dat;
        }).catch((error) => {
            // doc.data() will be undefined in this case
            debug("No such document!",error);
            return {}
        }) 
}

export const getDocAsync = async (path,callback) => {
    try{
        const docRef = doc(db, path);
        return onSnapshot(docRef,docSnap=> {
            let dat= docSnap.data();
            callback(dat);
        })
    }catch(error) {
            // doc.data() will be undefined in this case
            debug(`No document at ${path}`,error);
            return {}
    }
}


export const getRacesAsync = (callback) => {
    try{
        const racesRef = collection(db, "races");
        return onSnapshot(racesRef,docSnap=> {
            let dat= docSnap.docs.map(x=>{
                        let o=x.data();
                        o['id']=x.id;
                        return o})
            console.log(`loading ${dat.length} races`)
            callback(dat);
        })
    }catch(error) {
            // doc.data() will be undefined in this case
            debug("No such document!",error);
            return {}
    }
}


export const getAllDocs = (path) => {
    const racesRef = collection(db, path);
    return getDocs(racesRef).then(docSnap=> {
            let dat= docSnap.docs.map(x=>x.data())
            return dat;
        }).catch((error) => {
            // doc.data() will be undefined in this case
            debug("No such Collection!",error);
            return {}
        }) 
}

export const  getDocData = async (path) => {
    // debugger
    console.log(`getDocData(): ${path}`)
    const docRef = doc(db, path);
    // debug(docRef)
    return await getDoc(docRef).then((docSnap)=> {
            let dat= docSnap.data()
            // debug(dat)
            return dat;
        }).catch((error) => {
            // doc.data() will be undefined in this case
            debug("No such document!",error);
            return {}
        }) 
}

/**
 * 
 * @param {*} event : event id
 * @param {*} role : manager,volunteer,runner,others
 * @returns 
 */
export const  checkAccessEventRole = (event,role) =>{
    let user= firebaseAuth.currentUser;
    if(user) {
        if (role){
            //check user id in raceManager, raceVolunteers in database
            
        } else {
            return true
        }
    } else {
        return false
    }
}

export const setDocData = async (path,payload,merge) => {
    // debugger
    // console.log(`setDocData(): ${path}`)
    const docRef = doc(db, path);

    if (authorized()) {    
        return await setDoc(docRef,
                            payload,
                            merge? {merge: true} : {} )
                        .then((ret)=> {
                return ret;
            }).catch((error) => {
                // doc.data() will be undefined in this case
                debug("Error in setDocData()",error);
                throw Error("Error in setDocData()")
            }) 
        }else{
            debug("Error in setDocData()",error);
            throw Error("Error in setDocData()") 
        }
}

function authorized(){
    // debugger
    // firebaseAuth.currentUser
    return true
}

/**
 * Delete all docs in collections
 * https://firebase.google.com/docs/firestore/manage-data/delete-data#node.js_2
 * @param {*} db 
 * @param {*} collectionPath 
 * @param {*} batchSize 
 * @returns 
 */
export async function deleteCollection(db, collectionPath, batchSize) {
    batchSize=batchSize||100;
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);
  
    return new Promise((resolve, reject) => {
      deleteQueryBatch(db, query, resolve).catch(reject);
    });
  }
  
  async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();
  
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      // When there are no documents left, we are done
      resolve();
      return;
    }
  
    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  
    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
      deleteQueryBatch(db, query, resolve);
    });
  }
//end delete collection  

/**
 * Realtime updates
 */
let subscriptions={}
subscriptions['config']=onSnapshot(doc(db,'app/config'),
                    docSnap => {
                        if (docSnap.exists()) {
                            config.app = Object.assign(config.app,docSnap.data())
                            console.log("app/config loaded :"+Object.keys(config.app).length );
                        } else {
                            // doc.data() will be undefined in this case
                            console.log("No app/config");
                        }
                    })

// function subscribetoUserProfile(email){        
//     const path=`users/${email}`            
//     return onSnapshot(doc(db,path),
//                     docSnap => {
//                         if (docSnap.exists()) {
//                             config.app = Object.assign(config.app,docSnap.data())
//                             console.log(`${path} loaded`+Object.keys(config.app).length );
//                         } else {
//                             // doc.data() will be undefined in this case
//                             console.log(`Error loading ${path}`);
//                         }
//                     })
// }