# CareConnect

CareConnect is a comprehensive, role-based web application built with Spring Boot. It serves as a centralized platform designed to manage and coordinate relief efforts, connecting displaced persons, donors, government officers, and system administrators during emergencies or disaster relief situations.

## 🌟 Key Features

* **Role-Based Access Control:** Dedicated dashboards and features for different user roles:
  * **Displaced Persons:** Can request help, access resources, and communicate via messages.
  * **Donors:** Can view requests, make donations, and track their donation history.
  * **Government Officers:** Can manage cases, oversee resource distribution, view live maps, and handle communications.
  * **Administrators:** Handle user management, system settings, activity logs, and comprehensive reporting.
* **Real-Time Communication:** Integrated WebSockets for real-time chat and notifications.
* **Live Map Integration:** Geographical tracking of cases and resources.
* **Resource & Donation Management:** End-to-end tracking of aid, from donation to delivery.
* **Reporting & Analytics:** Generate reports on activities, donations, and case resolutions.

## 💻 Tech Stack

**Backend:**
* Java 17
* Spring Boot 4.0.0
* Spring Web MVC
* Spring Data JPA
* Spring WebSockets
* Lombok

**Database:**
* MySQL (Connector-J)

**Frontend:**
* HTML5, CSS3, Vanilla JavaScript
* Static file serving via Spring Boot

**Build Tool:**
* Maven

## 🚀 Getting Started

### Prerequisites
* [Java Development Kit (JDK) 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
* [Maven](https://maven.apache.org/)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CareConnect
