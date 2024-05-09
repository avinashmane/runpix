/* This Cucumber.js tutorial file contains the step definition or the description of each of the behavior that is expected from the application */

'use strict';

const { Given, When, Then } = require('@cucumber/cucumber');
const { By }= require('selenium-webdriver');
const assert = require('assert')

// const webdriver = require('selenium-webdriver');

// // The step definitions are defined for each of the scenarios // //

// // The “given” condition for our test scenario // //
Given(/^I have visited the page on "([^"]*)"$/, function (url, next) {

  console.log("Given " + url)
  this.driver.get(url).then(next);

});



Given(/.*visit.* path "([^"]*)"/, function (path, next) {

  let url=this.url(path)
  console.log("Given " + url)
  this.driver.get(url)
    .then(next);

});
// When('There is a title on the page as {string}', function (title,next) {
//   console.log(JSON.stringify(next))
//   next()
//   return `pending ${title}`;
// });

// // The “when” condition for our test scenario // //

When('{string} url is visited', function (string) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});

When(/^There is a title on the page as "([^"]*)"$/, function (titleMatch, next) {
  // console.log(Object.keys(this))
  this.driver.getTitle()
    .then(function (title) {
      assert.equal(title, titleMatch,  'Expected title to be ' + titleMatch);
      next()
    })
})

When(/clicked on text "([^"]*)"/, function (text) {
  // Write code here that turns the phrase above into concrete actions
  return this.driver.findElement(By.xpath(`//*[contains(text(), '${text}')]`)).click()

});
// // The “then” condition for our test scenario // //

Then(/input "([^"]*)" .*value "([^"]*)"/ , function (input_id,expectedValue) {
  const el = this.driver.findElement({ id: input_id })
  el.getAttribute("value").then(value=>{
    assert.equal(value, expectedValue,  `Expected  ${value} to be ${expectedValue}`);
  })
  
  // console.log(JSON.stringify(  this.driver))
});

Then(/I should be able to click ([\w\ -]+) in the sidebar/, function (text, next) {
  this.driver.findElement({ id: 'myTextInput' }).sendKeys(text);
  this.driver.findElement({ id: 'myButton' }).click().then(next);
});