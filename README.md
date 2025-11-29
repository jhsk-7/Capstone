easybikeservice.com is a full-stack bike service scheduling platform where users can register bikes, book appointments, and manage service status in real time.

URL: https://easybikeservice.com
Status: LIVE 

User Features:
- Create account, login/logout
- Add and delete bikes
- Book service appointments
- View appointment details & history
- Light/Dark mode
- Upload bike images

Admin Features:
- Manage services
- Approve/decline appointments
- Update service status

Tech Stack:
- Frontend: Next.js (App Router), React, Tailwind
- Backend: Node.js, Mongoose, Next.js API Routes
- Database: MongoDB
- Auth: JWT + HttpOnly cookies
- Testing: Jest + React Testing Library
- Deployment: Render 

Endpoints:
- Home - https://www.easybikeservice.com/
- User login - /user/auth/login
- User signup - /user/auth/signup
- View user bikes - /user/myBikes
- View user bike - /user/myBikes/[id]
- Add user bike - /user/addBike
- View user appointments - /user/appointment/myAppointments
- View user appointment - /user/appointment/myAppointments/[id]
- Book user appointment - /user/appointment
- Admin login - /admin/auth/login
- Admin signup - /admin/auth/signup
- Admin manage services - /admin/services
- Admin view appointments - /admin/appointments
- Admin manage appointments - /admin/appointments/[id]

Clone the repo:
- git clone https://github.com/jhsk-7/Capstone.git

Install dependencies:
- npm install

Enviroment variables:
- MONGO_URL=
- TOKEN_SECRET=
- DOMAIN=
- ADMIN_SIGNUP_CODE=

Run the app:
- npm run dev

Run all tests:
- npm run test
- npm test -- --coverage

