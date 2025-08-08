import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building,
  AlertTriangle,
  FileText,
  Shield,
  Users,
  Calendar,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Building Management System
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <AuthButtons />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Modern Building Management
            <span className="text-blue-600"> Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive solution for building administration, deviation
            tracking, and fire safety compliance. Built for efficiency and
            transparency.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for Building Management
          </h2>
          <p className="text-lg text-gray-600">
            From deviation tracking to fire safety compliance, we&apos;ve got
            you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={Building}
            title="Building Management"
            description="Comprehensive building profiles with access control and detailed information management."
          />
          <FeatureCard
            icon={AlertTriangle}
            title="Deviation Tracking"
            description="Report, track, and resolve building issues with priority levels and status updates."
          />
          <FeatureCard
            icon={FileText}
            title="Substance Catalog"
            description="Manage building materials and substances with detailed documentation and file storage."
          />
          <FeatureCard
            icon={Shield}
            title="Fire Safety"
            description="Complete fire inspection system with automated reporting and compliance tracking."
          />
          <FeatureCard
            icon={Users}
            title="User Management"
            description="Role-based access control with occupant, worker, and administrator permissions."
          />
          <FeatureCard
            icon={Calendar}
            title="Maintenance Schedule"
            description="Automated maintenance scheduling with email and SMS notifications."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Pay only for what you use. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard
            title="Starter"
            buildings={5}
            users={50}
            price="299"
            description="Perfect for small property management companies"
          />
          <PricingCard
            title="Professional"
            buildings={10}
            users={100}
            price="599"
            description="Ideal for growing businesses"
            featured
          />
          <PricingCard
            title="Enterprise"
            buildings={25}
            users={250}
            price="1299"
            description="For large property portfolios"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Building Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function AuthButtons() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return (
      <div className="flex items-center space-x-4">
        <Button asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <UserButton />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <SignInButton mode="modal">
        <Button variant="outline">Sign In</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button>Sign Up</Button>
      </SignUpButton>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <Icon className="h-12 w-12 text-blue-600 mb-4" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function PricingCard({
  title,
  buildings,
  users,
  price,
  description,
  featured = false,
}: {
  title: string;
  buildings: number;
  users: number;
  price: string;
  description: string;
  featured?: boolean;
}) {
  return (
    <Card
      className={`${featured ? "ring-2 ring-blue-500" : ""} hover:shadow-lg transition-shadow`}
    >
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <div className="text-4xl font-bold text-blue-600">
          kr {price}
          <span className="text-lg font-normal text-gray-600">/month</span>
        </div>
      </CardHeader>
      <CardContent className="text-center">
        <CardDescription className="mb-6">{description}</CardDescription>
        <div className="space-y-2 text-sm">
          <div>{buildings} buildings</div>
          <div>{users} users</div>
          <div>Full feature access</div>
          <div>24/7 support</div>
        </div>
        <Button
          className="w-full mt-6"
          variant={featured ? "default" : "outline"}
        >
          Choose Plan
        </Button>
      </CardContent>
    </Card>
  );
}
