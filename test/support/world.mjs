// CustomWorld.js
import { World,setDefaultTimeout,setWorldConstructor } from '@cucumber/cucumber';
import seleniumWebdriver from "selenium-webdriver";


/* Global timouot */
setDefaultTimeout(10 * 1000);

/*
 * The only method to be inherited from the default world is
 * the constructor, so if you want to handle the options in
 * an entirely customized manner you don't have to extend from
 * World as seen here.
 */
export default class extends World {
  // export default class extends World {
  driver = null;
  // attach = null
  /*
   * A constructor is only needed if you have custom actions
   * to take after the Cucumber parses the options or you
   * want to override how the options are parsed.
   * 
   * The options are an object with three members
   * {
   *   log: Cucumber log function,
   *   attach: Cucumber attachment function,
   *   params: World Parameters object
   * }
   */
  constructor(options) {
    /*
     * If you don't call the super method you will need
     * to bind the options here as you see fit.
     */
    super(options);
    // Custom actions go here.
  }

  /*
   * Constructors cannot be asynchronous! To work around this we'll
   * use an init method with the Before hook
   */
  url(path){
    path=path.substring(0,1)=='/'?path.substring(1):path;
    return `${this.parameters.base_url}/${path}`
  }

  async init(scenario) {
    var chromeCapabilities = seleniumWebdriver.Capabilities.chrome();
    chromeCapabilities.set("acceptInsecureCerts", true);

    this.driver = await new seleniumWebdriver.Builder()
      .forBrowser(this.parameters.browser)
      .withCapabilities(chromeCapabilities)
      .build();
  }
}

//Now we'll use a step file to setup this custom world and declare the before hook.

// setup.js
// import { Before, setWorldConstructor } from '@cucumber/cucumber';
// // import CustomWorld from "../classes/CustomWorld.js"
// debugger
// setWorldConstructor(CustomWorld);

// Before(async function(scenario) {
//   await this.init(scenario);
// });
