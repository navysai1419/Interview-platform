import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import techlogo from "../assests/techlogo.png"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, BarChart3, Code, Zap, PieChart, Users, CheckCircle2, Star, ArrowRight, Menu, X } from "lucide-react";
import { toast } from "sonner";

const Landing = () => {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loginData, setLoginData] = useState({ 
    email: "", 
    password: "", 
    collegePasskey: "",
    collegeName: ""
  });
  const [adminLoginData, setAdminLoginData] = useState({ 
    email: "", 
    password: "" 
  });
  const [contactType, setContactType] = useState("student");
  const [contactData, setContactData] = useState({});
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch("http://52.87.175.51:8000/admin/colleges");
        if (response.ok) {
          const data = await response.json();
          setColleges(data);
        } else {
          console.error("Failed to fetch colleges");
        }
      } catch (error) {
        console.error("Network error fetching colleges:", error);
      }
    };

    fetchColleges();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    debugger 
    e.preventDefault();
    if (loginData.email && loginData.password && loginData.collegePasskey && loginData.collegeName) {
      try {
        const response = await fetch("http://52.87.175.51:8000/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password,
            college_name: loginData.collegeName,
            college_passkey: loginData.collegePasskey,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userEmail", loginData.email);
          localStorage.setItem("userCollege", loginData.collegeName);
          localStorage.setItem("userToken", data.access_token);
          toast.success("Login successful!");
          setIsLoginOpen(false);
          setLoginData({ email: "", password: "", collegePasskey: "", collegeName: "" });
          navigate("/terms");
        } else {
          toast.error("Login failed. Please check your credentials.");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      }
    } else {
      toast.error("Please fill all fields!");
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLoginData.email && adminLoginData.password) {
      try {
        const response = await fetch("http://52.87.175.51:8000/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: adminLoginData.email,
            password: adminLoginData.password,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("isAdminAuthenticated", "true");
          localStorage.setItem("adminEmail", adminLoginData.email);
          localStorage.setItem("adminToken", data.access_token);
          toast.success("Admin login successful!");
          setIsAdminLoginOpen(false);
          setAdminLoginData({ email: "", password: "" });
          navigate("/dashboard");
        } else {
          toast.error("Admin login failed. Please check your credentials.");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      }
    } else {
      toast.error("Please fill all fields!");
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let url = "";
    let body: any = {
      email: contactData.email,
      extras: {},
    };

    switch (contactType) {
      case "student":
        url = "http://52.87.175.51:8000/contact/student";
        body = {
          ...body,
          name: contactData.name,
          qualification: contactData.qualification,
          passedout_year: contactData.passedout_year,
          college: contactData.college,
          purpose: contactData.purpose,
          phone: contactData.phone,
        };
        break;
      case "college":
        url = "http://52.87.175.51:8000/contact/college";
        body = {
          ...body,
          name: contactData.name,
          location: contactData.location,
          contact: contactData.contact,
          designation: contactData.designation,
          point_of_contact: contactData.point_of_contact,
        };
        break;
      case "recruiter":
        url = "http://52.87.175.51:8000/contact/student";
        body = {
          ...body,
          company_name: contactData.company_name,
          designation: contactData.designation,
          point_of_contact_name: contactData.point_of_contact_name,
          phone: contactData.phone,
          using_platform: contactData.using_platform,
        };
        break;
      default:
        toast.error("Please select a contact type.");
        return;
    }

    if (!body.email || Object.keys(body).filter(key => key !== 'email' && key !== 'extras').some(key => !body[key])) {
      toast.error("Please fill all fields!");
      return;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success("Contact form submitted successfully!");
        setIsContactOpen(false);
        setContactData({});
        setContactType("student");
      } else {
        toast.error("Failed to submit contact form. Please try again.");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: "Enhanced Security & Integrity",
      description: "AI proctoring with camera and screen tracking to ensure exam integrity.Prevents cheating and maintains fairness.",
    },
    {
      icon: BarChart3,
      title: "Real-Time Evaluation",
      description: "Instant feedback and automated grading for faster results.",
    },
    {
      icon: Code,
      title: "MCQ & Coding Tests",
      description: "Support for multiple question types including live coding challenges.",
    },
    {
      icon: Zap,
      title: "Scalability",
      description: "Can handle hundreds or thousands of candidates simultaneously.Useful for universities, recruitment tests, certifications, and competitive exams.",
    },
    {
      icon: PieChart,
      title: "Anytime, Anywhere Access",
      description: "Students can take exams remotely from any device (mobile, tablet, or PC)Supports flexible learning and testing schedules.",
    },
    {
      icon: Users,
      title: "User-Friendly Interface",
      description: "Intuitive design for seamless exam experience.",
    },
  ];

 const testimonials = [
  {
    name: "Sri Ram Degari",
    role: "Certified Data Analyst",
    content:
      "I joined the 3-Month Data Analyst training at Lauratek, powered by SecurXperts and it was a great experience. The sessions were fully practical with real-world projects and the trainers helped me strengthen my analytical and visualization skills. I’m proud to be a certified Data Analyst today — truly, Lauratek is part of the best software training company in Hyderabad for anyone seeking hands-on learning and career growth.",
    rating: 5,
  },
  {
    name: "Amgothu Sai Naik",
    role: "Certified Data Analyst",
    content:
      "Learning Data Analytics through Lauratek from SecurXperts was an amazing experience. The 3-month course combined theory with practical sessions in Excel, SQL and Power BI. Supportive mentors and real-time case studies boosted my confidence to begin my career. Lauratek truly stands as one of the best software training company in Hyderabad for career-focused learning.",
    rating: 5,
  },
  {
    name: "Jatavath Sandeep",
    role: "Certified Data Analyst",
    content:
      "The 3-Month Data Analyst program by Lauratek, powered by SecurXperts, gave me strong insights into using data for real decision-making. Each module was practical and easy to follow and the trainer’s feedback improved my skills quickly. Completing this course opened new opportunities for me — Lauratek is part of the best software training company in Hyderabad, focused on practical and career-driven learning.",
    rating: 5,
  },
  {
    name: "Bikumalla Kranthikumar",
    role: "Certified Data Analyst",
    content:
      "I’m really happy to have completed my 3-Month Data Analyst certification at Lauratek, a SecurXperts initiative. The training covered Excel, Power BI and SQL effectively and real-world tasks helped me apply what I learned. I’m thankful to the team for shaping my skills — Lauratek truly belongs to the best software training company in Hyderabad, offering hands-on, job-ready training.",
    rating: 5,
  },
];


  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-50">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
           <div className="flex items-center space-x-3">
 <img src={techlogo} alt="LauraTech Logo" className="w-32 h-16 object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300" />
</div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-foreground hover:text-primary transition-all duration-300 relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#benefits" className="text-foreground hover:text-primary transition-all duration-300 relative group">
                Benefits
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#serve" className="text-foreground hover:text-primary transition-all duration-300 relative group">
                Who We Serve
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#testimonials" className="text-foreground hover:text-primary transition-all duration-300 relative group">
                Testimonials
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground hover:text-primary"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>

            {/* Desktop Login Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button onClick={() => setIsLoginOpen(true)} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300">
                Login
              </Button>
              <Button onClick={() => setIsContactOpen(true)} className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-600/90 hover:to-green-800/90 shadow-lg hover:shadow-xl transition-all duration-300">
                Contact US
              </Button>
              <Button onClick={() => setIsAdminLoginOpen(true)} className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-600/90 hover:to-gray-800/90 shadow-lg hover:shadow-xl transition-all duration-300">
                Admin Login
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <a href="#home" className="text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </a>
                <a href="#benefits" className="text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Benefits
                </a>
                <a href="#serve" className="text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Who We Serve
                </a>
                <a href="#testimonials" className="text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Testimonials
                </a>
                <Button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsLoginOpen(true);
                  }} 
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsContactOpen(true);
                  }} 
                  className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-600/90 hover:to-green-800/90"
                >
                  Contact US
                </Button>
                <Button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAdminLoginOpen(true);
                  }} 
                  className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-600/90 hover:to-gray-800/90"
                >
                  Admin Login
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="py-6 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent animate-fade-in-up">
            The World's Most Advanced
            <br />
            <span className="text-gradient">Interview Assessment Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-300">
            Prepare, practice, and perform your best — anytime, anywhere.
          </p>
          <Button 
            onClick={() => setIsLoginOpen(true)} 
            className="btn-hero text-xl py-6 px-12 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-bounce-in animation-delay-600"
          >
            Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-6 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
            Why Choose <span className="text-gradient">LauraTek?</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover-lift border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
                <CardHeader className="text-center">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <benefit.icon className="text-white" size={28} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground leading-relaxed">{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section id="serve" className="py-6 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Who We Serve</h2>
          <div className="grid md:grid-cols-4 gap-8 mb-6">
            {[
              { title: "Students", desc: "Prepare for interviews with realistic practice exams" },
              { title: "Colleges", desc: "Assess student skills with comprehensive testing tools" },
              { title: "Recruiters", desc: "Find the best candidates with data-driven insights" },
              { title: "Companies", desc: "Evaluate employee skills and streamline hiring through smart assessments" }
            ].map((item, idx) => (
              <Card key={idx} className="text-center hover-lift border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="text-3xl group-hover:text-primary transition-colors">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Case Studies */}
         
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-2 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">What Our Users Say</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="hover-lift border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="fill-yellow-400 text-yellow-400" size={24} />
                    ))}
                  </div>
                  <CardTitle className="text-center">{testimonial.name}</CardTitle>
                  <CardDescription className="text-center text-muted-foreground">{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-center text-muted-foreground italic font-medium">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-black text-white py-6 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">LauraTek</h3>
              <p className="text-gray-400 leading-relaxed">The world's most advanced interview assessment platform.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Follow Us</h4>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-xl"><i className="fab fa-twitter"></i>Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-xl"><i className="fab fa-linkedin"></i>LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 LauraTeck Exam Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Welcome Back</DialogTitle>
            <DialogDescription className="text-center">Login to access your exam portal</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                className="h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                className="h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <Label htmlFor="login-college-name" className="text-sm font-medium">College Name</Label>
              <Select onValueChange={(value) => setLoginData({ ...loginData, collegeName: value })} value={loginData.collegeName}>
                <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Select College" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college: any) => (
                    <SelectItem key={college.id} value={college.name}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="login-college-passkey" className="text-sm font-medium">College Passkey</Label>
              <Input
                id="login-college-passkey"
                type="password"
                value={loginData.collegePasskey}
                onChange={(e) => setLoginData({ ...loginData, collegePasskey: e.target.value })}
                required
                className="h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 rounded-xl shadow-lg">
              Login
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Login Dialog */}
      <Dialog open={isAdminLoginOpen} onOpenChange={setIsAdminLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Admin Login</DialogTitle>
            <DialogDescription className="text-center">Login to access the admin portal</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <Label htmlFor="admin-email" className="text-sm font-medium">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={adminLoginData.email}
                onChange={(e) => setAdminLoginData({ ...adminLoginData, email: e.target.value })}
                required
                className="h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <Label htmlFor="admin-password" className="text-sm font-medium">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminLoginData.password}
                onChange={(e) => setAdminLoginData({ ...adminLoginData, password: e.target.value })}
                required
                className="h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 rounded-xl shadow-lg">
              Admin Login
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
  <DialogContent className="w-full max-w-xs 2xs:max-w-sm xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl">
    <div className="flex flex-col h-[70vh] max-h-[70vh]">
      <DialogHeader className="sticky top-0 bg-background z-10 border-b">
        <DialogTitle className="text-2xl font-bold text-center">Contact Us</DialogTitle>
        <DialogDescription className="text-center">Fill out the form to get in touch with us</DialogDescription>
      </DialogHeader>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <Label htmlFor="contact-type" className="text-sm font-medium">Contact Type</Label>
            <Select value={contactType} onValueChange={(value) => {
              setContactType(value);
              setContactData({});
            }}>
              <SelectTrigger className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Select contact type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="college">College</SelectItem>
                <SelectItem value="recruiter">Recruiter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {contactType === "student" && (
            <>
              <div>
                <Label htmlFor="contact-name" className="text-sm font-medium">Name</Label>
                <Input
                  id="contact-name"
                  type="text"
                  value={contactData.name || ""}
                  onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-qualification" className="text-sm font-medium">Qualification</Label>
                <Input
                  id="contact-qualification"
                  type="text"
                  value={contactData.qualification || ""}
                  onChange={(e) => setContactData({ ...contactData, qualification: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-passedout-year" className="text-sm font-medium">Passed Out Year</Label>
                <Input
                  id="contact-passedout-year"
                  type="text"
                  value={contactData.passedout_year || ""}
                  onChange={(e) => setContactData({ ...contactData, passedout_year: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-college" className="text-sm font-medium">College</Label>
                <Input
                  id="contact-college"
                  type="text"
                  value={contactData.college || ""}
                  onChange={(e) => setContactData({ ...contactData, college: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-purpose" className="text-sm font-medium">Purpose</Label>
                <Input
                  id="contact-purpose"
                  type="text"
                  value={contactData.purpose || ""}
                  onChange={(e) => setContactData({ ...contactData, purpose: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-phone" className="text-sm font-medium">Phone</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={contactData.phone || ""}
                  onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-email" className="text-sm font-medium">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactData.email || ""}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </>
          )}

          {contactType === "college" && (
            <>
              <div>
                <Label htmlFor="contact-name" className="text-sm font-medium">Name</Label>
                <Input
                  id="contact-name"
                  type="text"
                  value={contactData.name || ""}
                  onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-location" className="text-sm font-medium">Location</Label>
                <Input
                  id="contact-location"
                  type="text"
                  value={contactData.location || ""}
                  onChange={(e) => setContactData({ ...contactData, location: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-contact" className="text-sm font-medium">Contact</Label>
                <Input
                  id="contact-contact"
                  type="tel"
                  value={contactData.contact || ""}
                  onChange={(e) => setContactData({ ...contactData, contact: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-designation" className="text-sm font-medium">Designation</Label>
                <Input
                  id="contact-designation"
                  type="text"
                  value={contactData.designation || ""}
                  onChange={(e) => setContactData({ ...contactData, designation: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-point-of-contact" className="text-sm font-medium">Point of Contact</Label>
                <Input
                  id="contact-point-of-contact"
                  type="text"
                  value={contactData.point_of_contact || ""}
                  onChange={(e) => setContactData({ ...contactData, point_of_contact: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-email" className="text-sm font-medium">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactData.email || ""}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </>
          )}

          {contactType === "recruiter" && (
            <>
              <div>
                <Label htmlFor="contact-company-name" className="text-sm font-medium">Company Name</Label>
                <Input
                  id="contact-company-name"
                  type="text"
                  value={contactData.company_name || ""}
                  onChange={(e) => setContactData({ ...contactData, company_name: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-designation" className="text-sm font-medium">Designation</Label>
                <Input
                  id="contact-designation"
                  type="text"
                  value={contactData.designation || ""}
                  onChange={(e) => setContactData({ ...contactData, designation: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-point-of-contact-name" className="text-sm font-medium">Point of Contact Name</Label>
                <Input
                  id="contact-point-of-contact-name"
                  type="text"
                  value={contactData.point_of_contact_name || ""}
                  onChange={(e) => setContactData({ ...contactData, point_of_contact_name: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-phone" className="text-sm font-medium">Phone</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={contactData.phone || ""}
                  onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-using-platform" className="text-sm font-medium">Using Platform</Label>
                <Input
                  id="contact-using-platform"
                  type="text"
                  value={contactData.using_platform || ""}
                  onChange={(e) => setContactData({ ...contactData, using_platform: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="contact-email" className="text-sm font-medium">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactData.email || ""}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  required
                  className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </>
          )}

          <Button 
            type="submit" 
            className="w-full h-10 sm:h-12 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-600/90 hover:to-green-800/90 rounded-xl shadow-lg"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default Landing;