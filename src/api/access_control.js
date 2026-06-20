// import { useUserStore } from "../stores";
// const VALID_ROLES = ['admin','photo','volunteer']
// /**
//  * 
//  * @param {*} event : event id
//  * @param {*} role : manager,volunteer,runner,others
//  * @returns 
//  */
// export const checkAccessEventRole = (event,role) =>{
//     let user= useUserStore();
//     if(user) {
//         if (role){
//             //check user id in raceManager, raceVolunteers in database
//             if (VALID_ROLES.includes(role)){
//                 // let role_regexp= RegExp(user.roles[role].replace("*",".*"))
//                 console.warn(user)
//                 return role_regexp.test(event)
//             } else {
//                 console.error(`Error: no valid role ${role}`)
//                 return false
//             }
//         } else {
//             return false
//         }
//     }
// }
