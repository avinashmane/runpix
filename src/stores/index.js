import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { debug } from "../helpers"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { pick, assign, omit } from 'lodash-es'

import {
    getDocData,
    getDocAsync,
} from "../api";
import { firebaseAuth, db } from '../../firebase/config';

const PROFILE_FIELDS = "displayName,uid,email,photoURL".split(",")

export const useUserStore = defineStore('UserStore', () => {
    const profile = ref({})
    const roles = ref({})
    const loggedIn = computed(() => 'count.value * 2')

    // debug("useUserStore()")

    async function login(user) {
        // debug('Pinia:login', user)
        try {
            profile.value = assign(pick(user, PROFILE_FIELDS), user.metadata)
            // debugger
            await getDocAsync(`users/${profile.value.email}`,
                (profileInfoInFireStore) => { 
                    roles.value = profileInfoInFireStore?.roles
                    // debug("refresh roles",roles.value)
                    profile.value = assign(profile.value,
                                        omit(profileInfoInFireStore, ["roles"]))
                })
        } catch (e) {
            throw e
        }
    }

    /**
     * 
     * @param {*} objType race|photos|org|user
     * @param {*} objId 
     * @param {*} accessType : create|update|delete|read|timing
     * @returns true|false
     */
    function checkAccess(objType, objId, accessType,) {
        const checkAnyRegex=(listString,value)=>
            listString?.split(",").some(x => RegExp(x, "i").test(value));

        try {
            // debugger
            // debug(roles)
            if (!roles?.value)   // if roles not defined...no access
                return false
            if (/^test/i.test(objId))   // Anything test...all access granted
                return true                
            if (objType == 'race') {
                if (checkAnyRegex(roles.value.admin, objId)) {
                    // check access to 
                    return true
                }

                if (checkAnyRegex(roles.value.director, objId))
                    if (accessType != 'delete')
                        return true
                if (checkAnyRegex(roles.value.timing, objId))
                    if ('timing,read'.includes(accessType))
                        return true
            }
            if (objType == 'photos') {
                if (checkAnyRegex(roles.value.photos, objId))
                    // if (accessType == 'photos')
                    return true

            } 

            return false
        } catch (e) {
            // debugger
            console.error( e)
        }
    }

    async function getUserProfile() {
        try {
            const path = `users/${email}`
            // const _ref = collection(db,);
            return await getDocData(getDocData)
        } catch (error) {
            // doc.data() will be undefined in this case
            debug("No such document!", error);
            return {}
        }
    }

    function logout() {
        debug('Pinia:logout')
        profile.value = {}

    }

    return { profile, roles,loggedIn, login, logout, checkAccess }
});