// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyAWAlsHL3LkwVEC41OkkjqyHLv51gLfLlY",
    authDomain: "inventorycontrol-aab50.firebaseapp.com",
    databaseURL: "https://inventorycontrol-aab50.firebaseio.com",
    projectId: "inventorycontrol-aab50",
    storageBucket: "inventorycontrol-aab50.appspot.com",
    messagingSenderId: "688978052287"
  },
  smtp: {
    token : "693086b4-5c29-45c0-9a5c-86007b01278e",
    from : "antimicrobialmeister@gmail.com"
  },
};

/*
 * In development mode, for easier debugging, you can ignore zone related error
 * stack frames such as `zone.run`/`zoneDelegate.invokeTask` by importing the
 * below file. Don't forget to comment it out in production mode
 * because it will have a performance impact when errors are thrown
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
