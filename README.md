# pay-iLift
A secure lift-sharing platform connecting South African commuters travelling along similar routes and schedules to work.
Here is the entire Pay-iLift POC Design & Architecture Document formatted in standard Markdown, perfectly structured for a README.md or a documentation file in your GitHub repository.
Pay-iLift POC: User Stories, System Functionality and Design
Project Name: Pay-iLift
Baseline Reference: Mzansi e-Hailing POC Requirements
Core Objective: Demonstrate commuter onboarding, trip visibility, feedback management, role-based access, and MySQL persistence via an ASP.NET Core Web API and React + TypeScript frontend.
Executive Summary & Scope
Pay-iLift addresses the South African commuting challenge by enabling co-workers and commuters traveling along similar routes to coordinate lift-sharing arrangements.
POC Mandatory Scope: Commuter registration/authentication, user onboarding, profile management, trip history display, feedback submission/review workflows, role-based authorization, and relational persistence via MySQL.
Proposed Extensions (Post-POC): Driver-to-rider route matching, commute schedule discovery, seat reservation requests.
Explicitly Excluded from POC: Live GPS tracking, automated dispatch algorithms, payment processing/fare calculation, and native mobile apps.
1. User Stories and Acceptance Criteria
ID
User Story
Acceptance Criteria
US-01
As a commuter, I want to register so that I can access Pay-iLift.
Valid details create an account; duplicate email addresses are rejected; passwords are securely hashed and stored.
US-02
As a commuter, I want to sign in and sign out securely.
Valid credentials grant access; invalid credentials are rejected; protected pages and API endpoints enforce authentication.
US-03
As a commuter, I want to complete my profile so that my commuting and contact information is maintained.
Contact details, preferred route, workplace, emergency contact, and communication preferences can be saved and retrieved.
US-04
As a commuter, I want to see my onboarding status.
The dashboard clearly indicates whether required profile information is complete or outstanding.
US-05
As a commuter, I want to view scheduled and completed trips.
Trip references, routes, schedules, operator/vehicle details, and statuses are displayed from API-backed records.
US-06
As a commuter, I want to submit feedback about a completed trip.
Validates rating (1–5), category, and comment; associates feedback with the specific trip and commuter; records submission date and initial status.
US-07
As a commuter, I want to track feedback and concerns I have submitted.
Commuters can view their submitted feedback, tracking real-time status and official reviewer responses.
US-08
As an authorized reviewer, I want to review feedback and respond.
Reviewers access a protected queue, record official responses, and update feedback statuses.
US-09
As an authorized reviewer, I want to resolve feedback.
Resolution details are recorded, persisted, and made visible to the submitting commuter.
US-10
As a commuter, I want to receive and view notifications.
Notifications are retrieved for the authenticated user, and read status can be updated.
US-11
As an administrator, I want to manage authorized access.
Only administrative users can perform restricted access and role management operations.
US-12
As a reviewer, I want to verify that information is stored reliably.
Profile, trip, and feedback records remain available after browser refreshes or application restarts (MySQL persistence).

Note: US-01 through US-09 constitute the core commuter and feedback journey. US-10 and US-11 provide dashboard functionality and access control. US-12 defines data persistence requirements.
2. System Functionality & Scope Mapping
POC Requirement
Pay-iLift Implementation
Priority
Secure Authentication
Registration, login, logout, and JWT/Cookie-protected endpoints
Mandatory
Commuter Profile
Contact details, preferred route, workplace, emergency contacts, preferences
Mandatory
Dashboard
Onboarding status tracker, active/past trips, feedback history, notifications
Mandatory
Demonstration Trips
Seeded route, schedule, operator/vehicle details, and trip statuses
Mandatory
Trip Feedback
Star rating, category selection, text comments, dates, and status tracking
Mandatory
Authorized Review
Admin feedback queue, official responses, status changes, resolution tracking
Mandatory
Role-Based Access
Commuter, Reviewer, and Administrator role permissions
Mandatory
MySQL Persistence
Entity Framework Core mediated storage for all domain entities
Mandatory
Driver-to-Rider Matching
Compatible route and schedule matching discovery
Proposed Extension
Live GPS / Payments
Real-time tracking and financial transaction processing
Excluded from POC

3. UI Mockup Descriptions
Mockup 1 — Registration & Sign-In: Landing view with input fields for email/password, validation state messaging, and toggle between sign-in and account registration.
Mockup 2 — Commuter Onboarding: Multi-section form capturing contact information, home area, workplace destination, route choices, commuting times, and emergency contact details.
Mockup 3 — Dashboard & Trip Visibility: Central hub containing summary cards for profile completion status, upcoming/completed demonstration trips, active concerns, and unread notifications.
Mockup 4 — Trip Feedback Submission: Dedicated view referencing a completed trip ID, presenting a 5-star rating selector, category dropdown, comment field, and submission state.
Mockup 5 — Administrative Review Queue: Restricted view for authorized reviewers to inspect submitted feedback, append response notes, and update status flags (e.g., Submitted  Under Review  Resolved).
4. System Architecture



+-----------------------------------------------------------------------+
|                            PRESENTATION LAYER                         |
|   Commuter Browser / Admin Browser (React + TypeScript / Vite)        |
+-----------------------------------------------------------------------+
                                    |
                                HTTPS / JSON
                                    v
+-----------------------------------------------------------------------+
|                            APPLICATION API LAYER                      |
|                  ASP.NET Core Web API (C# / .NET)                     |
|  - Authentication & JWT / Cookie Auth Middleware                      |
|  - Role & Resource Authorization Policies                             |
|  - REST Controllers & DTO Input Validation                            |
|  - Application Domain Services                                        |
+-----------------------------------------------------------------------+
                                    |
                          Entity Framework Core
                                    v
+-----------------------------------------------------------------------+
|                            PERSISTENCE LAYER                          |
|                             MySQL Database                            |
+-----------------------------------------------------------------------+


Architecture Key Points
Client-Side: React manages state and view rendering. It communicates exclusively with the REST API.
Backend Services: ASP.NET Core API handles all business logic, input validation, and role authorization. Direct client access to MySQL is strictly prohibited.
Persistence: Entity Framework Core maps C# entities to MySQL relational tables and manages migrations.
5. Database Entity-Relationship Diagram (ERD)
Data Entities Schema



USERS
  ├── UserId (PK, int, auto_increment)
  ├── Email (UK, string, varchar(255))
  ├── PasswordHash (string, varchar(255))
  ├── Role (string, varchar(50)) -- Commuter, Reviewer, Admin
  ├── IsActive (bool)
  └── CreatedAt (datetime)

COMMUTER_PROFILES
  ├── ProfileId (PK, int, auto_increment)
  ├── UserId (FK -> USERS.UserId, Unique)
  ├── FullName (string, varchar(150))
  ├── PhoneNumber (string, varchar(20))
  ├── HomeArea (string, varchar(100))
  ├── Workplace (string, varchar(100))
  ├── PreferredRoute (string, varchar(150))
  ├── DepartureTime (time)
  ├── ReturnTime (time)
  ├── EmergencyContact (string, varchar(150))
  ├── CommunicationPreference (string, varchar(50))
  └── OnboardingComplete (bool)

ROUTES
  ├── RouteId (PK, int, auto_increment)
  ├── RouteName (string, varchar(100))
  ├── OriginArea (string, varchar(100))
  ├── DestinationArea (string, varchar(100))
  └── Description (text)

OPERATORS
  ├── OperatorId (PK, int, auto_increment)
  ├── DisplayName (string, varchar(100))
  └── VehicleInfo (string, varchar(200))

TRIPS
  ├── TripId (PK, int, auto_increment)
  ├── RouteId (FK -> ROUTES.RouteId)
  ├── OperatorId (FK -> OPERATORS.OperatorId)
  ├── Reference (UK, string, varchar(50))
  ├── DepartureTime (datetime)
  ├── ArrivalTime (datetime)
  ├── VehicleDetails (string, varchar(150))
  └── Status (string, varchar(50)) -- Scheduled, InProgress, Completed, Cancelled

FEEDBACK
  ├── FeedbackId (PK, int, auto_increment)
  ├── TripId (FK -> TRIPS.TripId)
  ├── CommuterId (FK -> USERS.UserId)
  ├── Rating (int, check(1..5))
  ├── Category (string, varchar(50))
  ├── Comment (text)
  ├── SubmittedAt (datetime)
  └── Status (string, varchar(50)) -- Submitted, UnderReview, Responded, Resolved

FEEDBACK_RESPONSES
  ├── ResponseId (PK, int, auto_increment)
  ├── FeedbackId (FK -> FEEDBACK.FeedbackId)
  ├── ReviewerId (FK -> USERS.UserId)
  ├── Response (text)
  ├── StatusChange (string, varchar(50))
  └── ResolvedAt (datetime)

NOTIFICATIONS
  ├── NotificationId (PK, int, auto_increment)
  ├── UserId (FK -> USERS.UserId)
  ├── Title (string, varchar(100))
  ├── Message (text)
  ├── Type (string, varchar(50))
  ├── CreatedAt (datetime)
  └── IsRead (bool)


Entity Relationships
USERS (1)  (0..1) COMMUTER_PROFILES (One-to-one mapping via unique foreign key)
USERS (1)  (0..*) FEEDBACK (Commuter submits feedback)
USERS (1)  (0..*) NOTIFICATIONS (User receives system notifications)
ROUTES (1)  (0..*) TRIPS (Route contains scheduled trips)
OPERATORS (1)  (0..*) TRIPS (Operator operates trips)
TRIPS (1)  (0..*) FEEDBACK (Trip collects user feedback)
FEEDBACK (1)  (0..*) FEEDBACK_RESPONSES (Feedback audit history/responses)
6. Logical Domain Model & Class Structure
Core Domain Models



C#
public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; }
    
    public bool Login() => true;
    public void Logout() { }
}

public class CommuterProfile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string HomeArea { get; set; } = string.Empty;
    public string Workplace { get; set; } = string.Empty;
    public string EmergencyContact { get; set; } = string.Empty;
    public bool OnboardingComplete { get; set; }

    public void UpdateProfile() { }
    public bool CheckCompletion() => OnboardingComplete;
}

public class Trip
{
    public int Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; }
    public TripStatus Status { get; set; }

    public bool CanReceiveFeedback() => Status == TripStatus.Completed;
}

public class Feedback
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public int CommuterId { get; set; }
    public int Rating { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public FeedbackStatus Status { get; set; }

    public void Submit() { }
}

public class FeedbackResponse
{
    public int Id { get; set; }
    public int FeedbackId { get; set; }
    public int ReviewerId { get; set; }
    public string Response { get; set; } = string.Empty;
    public DateTime ResolvedAt { get; set; }

    public void AddResponse() { }
    public void UpdateStatus(FeedbackStatus newStatus) { }
}


Domain Enums
UserRole: Commuter, Reviewer, Admin
TripStatus: Scheduled, InProgress, Completed, Cancelled
FeedbackStatus: Submitted, UnderReview, Responded, Resolved
7. REST API Endpoints Specification
Method
Endpoint
Description
Access Level
POST
/api/auth/register
Register new commuter account
Public
POST
/api/auth/login
Authenticate user & receive token/cookie
Public
POST
/api/auth/logout
Terminate session
Authenticated
GET
/api/profile/me
Fetch profile details of logged-in user
Authenticated
PUT
/api/profile/me
Update commuter profile details
Authenticated
GET
/api/dashboard
Load summary data for dashboard
Authenticated
GET
/api/trips
List available/historical trips
Authenticated
GET
/api/trips/{id}
Get specific trip details
Authenticated
POST
/api/trips/{id}/feedback
Submit feedback for a completed trip
Commuter
GET
/api/feedback/mine
View user's submitted feedback history
Commuter
GET
/api/admin/feedback
Fetch feedback review queue
Reviewer / Admin
POST
/api/admin/feedback/{id}/responses
Post official response to feedback
Reviewer / Admin
PATCH
/api/admin/feedback/{id}/status
Update feedback status (e.g., Resolve)
Reviewer / Admin
GET
/api/notifications
Get user notifications
Authenticated
PATCH
/api/notifications/{id}/read
Mark notification as read
Authenticated

8. Implementation & Verification Checklist
[x] User Stories & Acceptance Criteria Defined
[x] Mandatory POC Scope Separated from Proposed Extensions
[x] UI Mockup Flow & Component Mapping Completed
[x] System Architecture Defined (React  .NET Web API  MySQL)
[x] Relational Entity Model & ERD Designed
[x] Domain Class Diagram & Service Responsibilities Outlined
[x] API Contracts & Authorization Rules Specified
[ ] Reviewer Approval & Sign-Off Obtained
How to use this for GitHub:
Create a new file in your repository named README.md (or docs/POC_DESIGN.md).
Paste the content above directly into the file and commit it.
