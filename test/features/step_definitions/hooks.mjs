
import { Before, After, Status, BeforeAll, AfterAll,
  setDefaultTimeout ,setWorldConstructor } from '@cucumber/cucumber';
import CustomWorld  from '../../support/world.mjs'
// import webdriver from 'selenium-webdriver';

// console.log('hooks')
const matchAnyIn=(listStr, str)=>listStr.split(",").some(x=>str.includes(x))

setWorldConstructor(CustomWorld)
setDefaultTimeout (1000000)

Before(async function(scenario) {
  if (matchAnyIn("web,ui,selen",scenario.gherkinDocument.feature.name)){
    await this.init(scenario);
  }
});


After(async function (scenario) {
  if (isSelenium(scenario)){
    if (scenario.result.status === Status.FAILED) {
        try{
            await this.driver.takeScreenshot().then(data =>{
              // Attaching screenshot to report
              return this.attach(data, 'image/png');
            } );
        } catch (e) {
            console.error(e);
        }
    }

    // console.warn(this.parameters)
    if (!this.parameters.keepBrowserOpen){
      await this.driver.quit();
    }
  }
});

function isSelenium(scenario) {
  return matchAnyIn("web,ui,selen", scenario.gherkinDocument.feature.name);
}
