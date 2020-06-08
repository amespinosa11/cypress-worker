Feature: Login feature

  Scenario: As a invalid user I can´t log into my app
    When I press "Skip"
    And I press "Login"
    Then I wait
    And I enter text "jmauricio" into field with id "username"
    And I enter text "password" into field with id "password"
    And I press "Login"
    Then I see "Forgot password"
    And I wait
    And I press "OK" 
  Scenario: As a valid use I can log into my app
    When I press "Skip"
    And I press "Login"
    And I wait
    And I enter text "jmauricio123" into field with id "username"
    And I enter text "1234567A@" into field with id "password"
    And I press "Login"
    And I wait
