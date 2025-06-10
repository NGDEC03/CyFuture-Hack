# MedConnect - Healthcare Platform

A comprehensive healthcare management platform that connects patients with healthcare providers, enabling seamless appointment booking and medical consultations.

## 🌟 Features

### For Patients
- **Doctor Discovery**: Search and find qualified doctors by specialization and location
- **Hospital & Lab Finder**: Locate nearby hospitals and diagnostic labs
- **Appointment Booking**: Schedule appointments with doctors and lab tests
- **Health Records**: Manage and access personal medical records
- **Reviews & Ratings**: Read and write reviews for healthcare providers
- **Real-time Notifications**: Get updates on appointment status and reminders

### For Doctors
- **Profile Management**: Comprehensive doctor profiles with qualifications and specializations
- **Availability Management**: Set and manage consultation schedules
- **Appointment Management**: View, confirm, and manage patient appointments
- **Patient Records**: Access patient medical history and records
- **Hospital Affiliations**: Manage associations with multiple hospitals
- **Review System**: Track patient feedback and ratings

### For Administrators
- **Hospital Management**: Create and manage hospital listings
- **Doctor Verification**: Verify and approve doctor profiles
- **Platform Oversight**: Monitor platform activity and user management

## 🛠️ Tech Stack

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with React 19
- **UI Components**: Custom components with Tailwind CSS
- **State Management**: React Query (TanStack Query) for server state
- **Authentication**: JWT-based authentication
- **Icons**: Lucide React & React Icons
- **Animations**: Framer Motion
- **Notifications**: React Toastify

### Backend (Node.js/Express)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **File Storage**: Cloudinary integration
- **Payments**: Razorpay integration
- **Email**: Nodemailer for notifications

### AI/ML Services (Python)
- **Framework**: Flask
- **AI Integration**: Google Generative AI
- **Document Processing**: PDF processing capabilities
- **Search**: DuckDuckGo search integration

### Database Schema
- **Users**: Authentication and profile management
- **Doctors**: Medical professional profiles
- **Hospitals**: Healthcare facility management
- **Appointments**: Booking and scheduling system
- **Reviews**: Rating and feedback system
- **Medical Records**: Patient health data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- PostgreSQL database
- Yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd med/client
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   yarn install
   
   # Backend dependencies
   cd server/main-server
   npm install
   
   # Python server dependencies
   cd ../python-server
   pip install -r requirements.txt
   ```

3. **Environment Setup**
   
   Create `.env` files in respective directories:
   
   **Frontend (.env.local):**
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api/v1
   ```
   
   **Backend (server/main-server/.env):**
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/medconnect
   JWT_SECRET=your-jwt-secret
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   RAZORPAY_KEY_ID=your-razorpay-key
   RAZORPAY_KEY_SECRET=your-razorpay-secret
   EMAIL_USER=your-email
   EMAIL_PASS=your-email-password
   ```

4. **Database Setup**
   ```bash
   cd server/main-server
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed  # Optional: Load sample data
   ```

5. **Start Development Servers**
   
   **Frontend:**
   ```bash
   yarn dev
   ```
   
   **Backend:**
   ```bash
   cd server/main-server
   npm run dev
   ```
   
   **Python AI Server:**
   ```bash
   cd server/python-server
   python app.py
   ```

## 📱 Application Structure

```
client/
├── app/                    # Next.js App Router
│   ├── (dash)/            # Dashboard routes
│   ├── auth/              # Authentication pages
│   └── page.tsx           # Landing page
├── components/            # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── dash/              # Dashboard components
│   ├── chatbot/           # AI chatbot components
│   └── ui/                # Generic UI components
├── server/
│   ├── main-server/       # Node.js/Express backend
│   └── python-server/     # Python AI services
├── services/              # API service functions
├── types/                 # TypeScript type definitions
└── styles/                # Global styles
```

## 🔐 Authentication & Authorization

The platform implements role-based access control with three user roles:

- **PATIENT**: Can book appointments, view medical records, write reviews
- **DOCTOR**: Can manage appointments, set availability, view patient records
- **ADMIN**: Can manage hospitals, verify doctors, oversee platform

## 📊 Key Features Deep Dive

### Appointment System
- **Smart Scheduling**: Automatic conflict detection and slot management
- **Real-time Availability**: Dynamic availability based on doctor schedules
- **Status Tracking**: Pending → Confirmed → Completed workflow
- **Notifications**: Email and in-app notifications for status changes

### Search & Discovery
- **Geolocation**: Find nearby hospitals and doctors
- **Specialization Filtering**: Search by medical specialization
- **Advanced Filters**: Filter by ratings, experience, consultation fees
- **Distance Calculation**: Real-time distance calculation from user location

### Review System
- **5-Star Rating**: Comprehensive rating system for doctors
- **Verified Reviews**: Only patients with completed appointments can review
- **Average Ratings**: Calculated average ratings for each doctor
- **Review Moderation**: Admin oversight for review quality

## 🧪 Testing

```bash
# Run frontend tests
yarn test

# Run backend tests
cd server/main-server
npm run test

# Run Python tests
cd server/python-server
python test.py
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
yarn build
# Deploy to Vercel or your preferred platform
```

### Backend (Production)
```bash
cd server/main-server
npm run build
# Deploy to your cloud provider
```

### Database Migration
```bash
npx prisma migrate deploy
```

## 📈 Performance Optimizations

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting with Next.js
- **Caching**: React Query for intelligent server state caching
- **Database Indexing**: Optimized database queries with Prisma
- **Lazy Loading**: Component lazy loading for better performance

## 🔧 Configuration

### Database Configuration
The application uses Prisma with PostgreSQL. Key models include:
- User management with role-based access
- Doctor profiles with specializations and availability
- Hospital and lab management
- Appointment scheduling system
- Review and rating system

### Payment Integration
Razorpay integration for consultation fee payments and appointment booking.

### Email Services
Automated email notifications for:
- Account verification
- Appointment confirmations
- Status updates
- Password reset

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Telemedicine**: Video consultation capabilities
- **AI Diagnostics**: Enhanced AI-powered health assessments
- **Mobile App**: React Native mobile application
- **Insurance Integration**: Health insurance claim processing
- **Multi-language Support**: Internationalization
- **Pharmacy Integration**: Online medicine ordering

---

**Built with ❤️ for better healthcare accessibility**
