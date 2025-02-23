import {
    createRouter,
    createWebHistory
} from "vue-router";
import { trackRouter } from "vue-gtag-next";
import TestPage from "../pages/TestPage.vue";
import HomePage from "../pages/HomePage.vue";
import ProfilePage from "../pages/ProfilePage.vue";
import LoginPage from "../pages/LoginPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";
import ResultsPage from "../pages/ResultsPage.vue";
import ImageReviewPage from "../pages/ImageReviewPage.vue";
import PhotosPage from "../pages/PhotosPage.vue";
import RaceLog from "../pages/RaceLogPage.vue";
import RaceStartList from "../pages/RaceStartListPage.vue";
import Races from "../pages/RacesPage.vue";
import Race from "../pages/RaceForm.vue";
import RaceEdit from "../pages/RaceEditCard.vue";
import RaceEntry from "../pages/RaceEntry.vue";
import TestFunctions from "../pages/TestFunctions.vue";
import NotFoundPage from "../pages/exceptions/NotFoundPage.vue";
import { useUserStore } from "../stores";
import {
    firebaseAuth
} from '../../firebase/config';

import { debug } from "../helpers";

let userStore
const nextIfLogin=(next,ifLogged,notLogged)=>{
    if(!userStore)
        userStore=useUserStore()
    debug(userStore.isSignIn,next)
    if(userStore.isSignIn){
        next(ifLogged);
    } else {
        next(notLogged);
    }
}

const routes = [
    // dynamic segments start with a colon
    {
        path: "/e",
        name: 'Events',
        component: Races,
        beforeEnter: (to, from, next) =>{ 
            nextIfLogin(next,null,'/login')
        },

    },
    {
        path: '/e',
        name: "Event",
        // component: Race,
        children: [{
            path: ':raceId',
            component: Race,
          },
          {
            path: ':raceId/entry/:mode',
            alias: ':raceId/entry',
            component: RaceEntry,
          },
          {
            path: ':raceId/images',
            component: ImageReviewPage,
          },
          {
            path: ':raceId/edit',
            component: RaceEdit,
          },
          {
            path: ':raceId/bibs',
            component: RaceStartList,
          },
          {
            path: ':raceId/log',
            component: RaceLog,
          },
        ],
    },
    {
        path: '/r',
        name: "Results",
        component: ResultsPage,
        children: [{
              path: ':raceId',
              component: ResultsPage,
            },
            {
              path: ':raceId/:bib',
              component: ResultsPage,
            },
          ],
    },
    {
        path: '/p',
        name: "Photos",
        component: PhotosPage,
        children: [{
              path: ':raceId',
              component: PhotosPage,
            },
            {
              path: ':raceId/:bib',
              component: PhotosPage,
            },
          ],
    },
    {
        path: "/testfunction",
        alias: '/testfn',
        name: 'TestPage',
        component: TestFunctions
    },
    {
        path: '/test',
        name: 'TestPage',
        component: TestPage
    },
    {
        path: "/home",
        name: 'HomePage',
        component: HomePage,
        beforeEnter: (to, from, next) => {
            nextIfLogin(next,null,'/login')
        }
    },
    {
        path: "/profile",
        name: 'ProfilePage',
        component: ProfilePage,
        beforeEnter: (to, from, next) => {
            nextIfLogin(next,null,'/login')
        }
    },
    {
        patch: "/",
        redirect: "/home",
        beforeEnter: (to, from, next) => {
            nextIfLogin(next,null,'/login')
        }
    },
    {
        path: "/login",
        name: 'LoginPage',
        component: LoginPage,
        beforeEnter: (to, from, next) => {
            nextIfLogin(next,'/home',)
        }
    },
    {
        path: "/register",
        name: 'RegisterPage',
        component: RegisterPage,
        beforeEnter: (to, from, next) => {
            nextIfLogin(next,'/home',)
        }
    },
    {
        path: "/:catchAll(.*)",
        component: NotFoundPage,
        beforeEnter: (to, from, next) => {
            console.log(to, from)
        }
    }
]

const router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes
});


trackRouter(router);

export default router;