# 🧸 INBOLA Kids Marketplace

A safe, fun, and educational e-commerce platform designed specifically for children and families. Built with modern technologies and a focus on child-friendly design and parental control.

## 🌟 Overview

INBOLA Kids Marketplace transforms the traditional e-commerce experience into a safe, engaging environment where children can learn about shopping while parents maintain full control. The platform features bright colors, large buttons, emoji-based navigation, and comprehensive parental controls.

## ✨ Key Features

### 👶 For Children
- **Kid-Friendly Interface**: Bright colors, large buttons, and emoji-based navigation
- **Gift Registry**: Create wishlists for birthdays and special occasions
- **Age-Appropriate Products**: Content filtered by age groups (0-2, 3-5, 6-8, 9-12, 13+)
- **Educational Shopping**: Learn about money, choices, and responsibility
- **Safe Environment**: Moderated content and secure transactions

### 👨‍👩‍👧‍👦 For Parents
- **Parental Dashboard**: Monitor children's activities and spending
- **Purchase Approval System**: Control and approve children's purchases
- **Spending Limits**: Set daily/monthly spending limits for each child
- **Family Management**: Manage multiple children accounts
- **Activity Monitoring**: Track browsing and purchase history

### 🛍️ For Everyone
- **Multi-User Support**: Parent, Child, Seller, and Admin roles
- **Secure Payments**: Safe and encrypted payment processing
- **Real-time Notifications**: Instant updates on orders and approvals
- **Mobile-First Design**: Optimized for tablets and smartphones
- **Multi-Language Support**: Currently supports Uzbek

## 🏗️ Architecture

### Backend (NestJS + PostgreSQL)
```
backend-main/
├── src/
│   ├── auth/                 # Authentication & authorization
│   ├── user/                 # User management with family support
│   ├── product/              # Product management with kids features
│   ├── category/             # Kids-specific categories
│   ├── gift-registry/        # Wishlist management
│   ├── purchase-approval/    # Parental control system
│   ├── cart/                 # Shopping cart
│   ├── order/                # Order processing
│   └── prisma/               # Database schema and migrations
└── prisma/
    └── schema.prisma         # Database schema with family relations
```

### Frontend (Next.js + React + TypeScript)
```
front-main/
├── components/
│   ├── marketplace/          # Main marketplace components
│   ├── home/                 # Home page components
│   └── Layout.tsx           # Main layout wrapper
├── pages/
│   ├── gift-registry/       # Gift registry management
│   ├── parent-dashboard/    # Parent control panel
│   └── index.tsx           # Home page
├── styles/
│   ├── kids-theme.scss     # Kids marketplace theme
│   └── globals.css         # Global styles
└── store/                  # Redux store configuration
```

## 🎨 Design System

### Color Palette
- **Primary**: Coral Red (#FF6B6B) - Warm and friendly
- **Secondary**: Turquoise (#4ECDC4) - Calming and fun
- **Accent**: Sunny Yellow (#FFE66D) - Energetic and bright
- **Supporting**: Mint Green, Peach Orange, Light Pink, Sky Blue

### Typography
- **Headings**: Fredoka One - Playful and bold
- **Body Text**: Nunito - Readable and friendly
- **Accent**: Comic Neue - Casual and fun

### UI Principles
- **Large Touch Targets**: Minimum 48px for easy interaction
- **High Contrast**: Ensures readability for all ages
- **Rounded Corners**: Soft, friendly appearance
- **Generous Spacing**: Prevents accidental taps
- **Emoji Icons**: Universal understanding across languages

## 🛒 Product Categories

- 🧸 **Toys & Games**: Educational and fun toys for all ages
- 👕 **Kids Clothing**: Comfortable and stylish clothing
- 📚 **Books & Educational**: Learning materials and storybooks
- ⚽ **Sports Equipment**: Active play and sports gear
- 📝 **School Supplies**: Everything needed for school
- 🍼 **Baby Products**: Safe products for infants and toddlers
- 📱 **Kid-Safe Electronics**: Age-appropriate technology
- 🧴 **Health & Hygiene**: Personal care products for children

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/inbola-kids-marketplace.git
cd inbola-kids-marketplace
```

2. **Setup Backend**
```bash
cd backend-main
npm install
cp .env.example .env
# Configure your database and environment variables
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

3. **Setup Frontend**
```bash
cd front-main
npm install
cp .env.example .env.local
# Configure your API endpoints
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Documentation: http://localhost:4000/api/docs

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/inbola_kids"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
SMTP_HOST="your-smtp-host"
SMTP_PORT=587
SMTP_USER="your-email"
SMTP_PASS="your-password"
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_BASE_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## 🧪 Testing

### Backend Tests
```bash
cd backend-main
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

### Frontend Tests
```bash
cd front-main
npm run test          # Jest tests
npm run test:watch    # Watch mode
npm run cypress       # E2E tests
```

## 📱 Mobile Support

The platform is designed mobile-first with:
- Touch-friendly interface
- Responsive design for all screen sizes
- Optimized performance for mobile devices
- Progressive Web App (PWA) capabilities

## 🔒 Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Encrypted sensitive data
- **Parental Controls**: Comprehensive family safety features
- **Content Moderation**: All products are reviewed before listing

## 🌍 Internationalization

Currently supports:
- **Uzbek**: Primary language
- **English**: Secondary language (planned)
- **Russian**: Additional language (planned)

## 📊 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Core Web Vitals**: Optimized for fast loading
- **Image Optimization**: Automatic image compression and resizing
- **Code Splitting**: Efficient bundle loading
- **Caching**: Redis-based caching for improved performance

## 🚀 Deployment

### Production Deployment

**Backend (Docker)**
```bash
cd backend-main
docker build -t inbola-backend .
docker run -p 4000:4000 inbola-backend
```

**Frontend (Vercel)**
```bash
cd front-main
vercel --prod
```

### Environment Setup
- **Development**: Local development with hot reload
- **Staging**: Testing environment with production-like data
- **Production**: Live environment with full security

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Modern kids' apps and educational platforms
- **Icons**: Emoji sets for universal understanding
- **Fonts**: Google Fonts (Fredoka One, Nunito, Comic Neue)
- **Community**: Built with love for children and families worldwide

## 📞 Support

For support, email support@inbola.uz or join our community Discord server.

---

**Made with ❤️ for children and families**
