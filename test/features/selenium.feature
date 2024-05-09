Feature: Selenium testing using Selenium official web page
    # base_url is defined in cucumber.yml
    # prerequisite vite start

    Scenario: Basic website check
        Given I have visited path "/login?email=avinashmane@yahoo.com"
        When There is a title on the page as "Run PiX"
        When I clicked on text "Project Info"
        Then input "name" has value "Ashish's test project"

    # Scenario: Basic
    #     Given I have visited the page on "https://seleniumbase.io/demo_page"
    #     When There is a title on the page as "Web Testing Page" 
    #     Then I should be able to click Search in the sidebar 