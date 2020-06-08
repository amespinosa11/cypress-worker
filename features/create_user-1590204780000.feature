Feature: Create user feature

Scenario: Validación de campos vacios
    When I press "Skip"
    And I press "Register"
    And I enter text "jmauricio" into field with id "username"
    And I press "Register"
    Then I should see "Validation error"
    And I press "OK" 
Scenario: Email invalido
    When I press "Skip"
    And I press "Register"
    And I enter text "jmauricio123456" into field with id "username"
    And I enter text "jmauricio" into field with id "email"
    And I enter text "12345678" into field with id "password"
    And I enter text "12345678" into field with id "confirm_password"
    And I press "Register"
    Then I should see "invalid email address"
    And I press "OK" 
Scenario: Validar información de entrada de campo de usuario
    When I press "Skip"
    And I press "Register"
    And I enter text "##///@&()´" into field with id "username"
    And I enter text "123@h.com" into field with id "email"
    And I enter text "12345678" into field with id "password"
    And I enter text "12345678" into field with id "confirm_password"
    And I press "Register"
    Then I should see "Usernames can only contain letters"
    And I press "OK" 
Scenario: Validar longitud minima del password
    When I press "Skip"
    And I press "Register"
    And I enter text "jmauricio123" into field with id "username"
    And I enter text "jmauricio@mail.com" into field with id "email"
    And I enter text "12345" into field with id "password"
    And I enter text "12345" into field with id "confirm_password"
    And I press "Register"
    Then I should see "Password must be 8 characters or more"
    And I press "OK" 
Scenario: Registro exitoso
    When I press "Skip"
    And I press "Register"
    Then I fill fields to create an user
    And I press "Register"
    And I press "Next"
    And I wait
    And I press "Next"
    And I wait
    Then I should see "Let\'s start!"
    And I wait
    And I press "Let\'s start!"
    And I wait


