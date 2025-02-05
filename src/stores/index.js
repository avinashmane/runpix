import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { debug } from "../helpers"
// import { getAuth, onAuthStateChanged } from "firebase/auth";
import { pick, assign, omit } from 'lodash-es'
import {
    signIn,
    signInGoogle,
    getUser,
    register,
    logOut,
    changePassword,
    reAuthenticate,
    getDocData,
    getDocAsync,
    getRaces,
    getRacesAsync
} from "../api";
import { firebaseAuth, db } from '../../firebase/config';

const PROFILE_FIELDS = "displayName,uid,email,photoURL".split(",")

export const useUserStore = defineStore('UserStore', () => {


    const profile = ref({})
    const roles = ref({})
    const isSignIn = ref(false)
    const signIn = ref({
        isLoading: false,
        isError: false,
        errorMessage: '',
        data: [],
    })
    const changePassword = ref({
        isLoading: false,
        isError: false,
        isSuccess: false,
        errorMessage: '',
    })
    const counter = ref({})

    const uid = computed(()=>(profile?.uid))
    const email = computed(()=>(profile?.uid))

    function getCounter(counterId = 'default') {
        counter[counterId] = counter[counterId] || 0
        counter[counterId]++
        return counter[counterId]
    }

    async function signInGoogleAction() {
        try {
            const response = await signInGoogle();
            if (response) {//return context.commit("successSignIn", response);
                await login(response)
                // uid.value = response?.uid
                // email.value = response?.email
                isSignIn.value = true
                signIn.value.isLoading = true
                signIn.value.isError = false
                signIn.value.data = response;
                return response
            } else
                return failSignIn('Could not complete login!!');
        } catch (error) {
            return failSignIn(error);
        }
    };


    /**
     * login hook
     * @param {*} user 
     */
    async function login(user) {
        debug('Pinia:login', user.email)
        try {
            if (user?.email) {
                isSignIn.value = true
            }

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
        const checkAnyRegex = (listString, value) =>
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
            console.error(e)
        }
    }

    async function getUserProfile() {
        try {
            const path = `users/${email}`
            // const _ref = collection(db,);
            return await getDocData(email)
        } catch (error) {
            // doc.data() will be undefined in this case
            debug("No such document!", error);
            return {}
        }
    }

    function logout() {
        debug('Pinia:logout')
        isSignIn.value = false
        profile.value = {}

    }

    /** copied from /home/avinash/runpix/src/store/modules/Auth/actions/index.js */
    function failSignIn(msg) {
        isSignIn.value = false
        signIn.isLoading = false
        signIn.isError = true
        signIn.errorMessage = msg
    }

    async function signInAction({ email: emailId, password }) {
        if (emailId === '' || password === '')
            return failSignIn("Email and password are required");

        try {
            const response = await signIn(emailId, password);

            if (response) {//return context.commit("successSignIn", response);
                isSignIn.value = true
                signIn.value.isLoading = true
                signIn.value.isError = false
                signIn.value.data = response;
                return response
            } else return failSignIn('Could not complete login!!');
        } catch (error) {
            return failSignIn(error);
        }
    };


    const getUserAction = async (context) => {
        try {
            const response = await getUser();
            if (response) {

            }
            else return failSignIn('Could not complete request!!');
        } catch (error) {
            return failSignIn(error);
        }
    };

    const logOutAction = async (context) => {
        try {
            const response = await logOut();
            context.commit("successLogOut", response);
        } catch (error) {
            context.commit("failLogOut", error);
        }
    };

    const changePasswordAction = async (context, { oldPassword, newPassword }) => {
        if (oldPassword === '' || newPassword === '') return context.commit("failChangePassword", "Old and new password are required");
        if (newPassword === oldPassword) return context.commit("failChangePassword", "New password must be different from old password");
        context.commit("beginChangePassword");
        try {
            const auth = await reAuthenticate(oldPassword);
            if (auth) {
                const isChange = await changePassword(newPassword);
                if (isChange === true) {
                    context.commit("successChangePassword");
                }
                else {
                    context.commit("failChangePassword", "Could not change password");
                }
            } else {
                context.commit("failChangePassword", 'Could not complete change password!!');
                console.debug('Could not complete change password!!');
            }
        } catch (e) {
            return context.commit("failChangePassword", e);
        }
    };

    return { uid, email, profile, roles, isSignIn, counter, getCounter, signInAction, signInGoogleAction, login, logout, checkAccess }
});

/**
 * Race Store
 * --------------------------------------------------------
 */
export const useRaceStore = defineStore('RaceStore', () => {
    const races = ref([])
    const racesObj = ref({})
    const raceId = ref()
    // const race : {waypoint:'VENUE'},
    const gps = ref({})
    const waypoint = ref('VENUE')
    const sub = {} // subscriptions

    sub['getRacesMutation'] = getRacesAsync((data) => {
        races.value = data;
        racesObj.value = data.reduce((a, x) => ({ ...a, [x.id]: x }), {})
    })

    const race = computed(() => {
        if (raceId.value) {
            return racesObj.value[raceId.value]
        } else {
            return { waypoint: 'VENUE' }
        }
    })

    function setRaceId(id) {
        raceId.value = id
    }
    /**
     * fetches all races in advance
     */
    async function getRacesAction() {
        try {
            // const response = await getRaces();
            // this.races = response;
            // this.racesObj = payload.reduce( (a,x) =>{
            //     a[x.id] = x
            //     return a
            // },{})
            sub['getRacesMutation'] = sub['getRacesMutation'] ||
                getRacesAsync((data) => {
                    races.value = data;
                    racesObj.value = data.reduce((a, x) => ({ ...a, [x.id]: x }), {})
                })
        } catch (error) {
            console.error("Failed getting errors", error)
        }
    };

    return { races, racesObj, raceId, race, gps, waypoint, setRaceId, getRacesAction }
})

