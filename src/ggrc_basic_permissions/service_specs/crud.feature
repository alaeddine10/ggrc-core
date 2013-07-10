Feature: Role CRUD

  Background:
    Given service description

  Scenario: Basic Role and UserRole CRUD using settings configured admin user
    Given current user is "{\"email\": \"example.admin@example.com\", \"name\": \"Jo Admin\"}"
    And a new Role named "role" is created from json
      """
      {
        "name": "Program Editor",
        "description": "simple program editor role.",
        "permissions": {
          "create": ["Program","Control"],
          "read":   ["Program","Control"],
          "update": ["Program","Control"],
          "delete": ["Control"]
          },
        "context_id": 0
      }
      """
    Then POST of "role" to its collection is allowed
    And GET of "role" is allowed
    And PUT of "role" is allowed
    And GET of "role" is allowed
    And DELETE of "role" is allowed

  Scenario: A non-adminstrative user cannot access role information
    Given the current user
      """
      { "email": "example.admin@example.com", "name": "Jo Admin" }
      """
    And a new Role named "role" is created from json
      """
      {
        "name": "Program Editor",
        "description": "simple program editor role.",
        "permissions": {
          "create": ["Program","Control"],
          "read":   ["Program","Control"],
          "update": ["Program","Control"],
          "delete": ["Control"]
          },
        "context_id": 0
      }
      """
    And "role" is POSTed to its collection
    And the current user 
      """
      {
        "email": "example.user@example.com",
        "name": "Jim User",
        "permissions": { }
      }
      """
    Then GET of "role" is forbidden
    Given the current user
      """
      {
        "email": "example.user2@example.com",
        "name": "Jayne User",
        "permissions": {
          "read": { "Role": [0] }
        }
      }
      """
    Then GET of "role" is allowed
    Then PUT of "role" is forbidden
    Then GET of "role" is allowed
    Then DELETE of "role" is forbidden

  Scenario: Use settings configured admin user to add other admin users
    Given the current user
      """
      { "email": "example.admin@example.com", "name": "Jo Admin" }
      """
    And a new Role named "role" is created from json
      """
      {
        "name": "Permissions Administrator",
        "description": "simple Role and UserRole editor role.",
        "permissions": {
          "create": ["Role","UserRole"],
          "read":   ["Role","UserRole"],
          "update": ["Role","UserRole"],
          "delete": ["Role","UserRole"]
          },
        "context_id": 0
      }
      """
    And "role" is POSTed to its collection
    Then GET of "role" is allowed
    Given a new "ggrc_basic_permissions.models.UserRole" named "user_role" is created from json
      """
      {
        "role": {
          "id": {{context.role.value['role']['id']}},
          "type": "Role"
        },
        "user_email": "another.admin@example.com",
        "target_context_id": 0
      }
      """
    And "user_role" is POSTed to its collection
    And the current user
      """
      { "email": "another.admin@example.com", "name": "Ann Other Admin" }
      """
    Then GET of "role" is allowed
    Given a new "ggrc_basic_permissions.models.Role" named "role2" is created from json
      """
      {
        "name": "Section and Directive Editor",
        "description": "simple program editor role.",
        "permissions": {
          "create": ["Section","Directive"],
          "read":   ["Section","Directive"],
          "update": ["Section","Directive"],
          "delete": ["Section","Directive"]
          },
        "context_id": 0
      }
      """
    Then POST of "role2" to its collection is allowed
    Then GET of "role2" is allowed
    Then PUT of "role2" is allowed
    Then GET of "role2" is allowed
    Then DELETE of "role2" is allowed
